import * as fs from "fs";
import * as asyncfs from "fs/promises";
import path from "path";
import _ from "lodash";
import pLimit from "p-limit";
import sharp from "sharp";

import { mkdir, weightedPick } from "./utils";
import { Config } from "./types";

const configPath = process.argv[2] || "config.json";
const config: Config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const traitsCache = "trait-cache";

const getTraitImagePath = (trait: string, value: string) =>
  path.join(traitsCache, trait, `${value}.png`);

const resizeTraitImages = async (): Promise<unknown[]> => {
  console.log("Optimizing trait images...");

  mkdir(traitsCache);

  const concurrent = pLimit(10);
  const promises: Promise<unknown>[] = [];

  for (const trait of config.traits) {
    mkdir(path.join(traitsCache, trait.name));

    for (const value of trait.values) {
      if (!value.path) continue;

      promises.push(
        concurrent(() =>
          sharp(value.path)
            .resize(config.imageSize.width, config.imageSize.height)
            .toFile(getTraitImagePath(trait.name, value.name))
            .finally(() => console.log(`optimized ${trait.name}/${value.name}`))
        )
      );
    }
  }

  return Promise.all(promises);
};

const generateAssets = async (): Promise<unknown[]> => {
  console.log("Generating assets...");

  mkdir(config.assetsDir);

  const concurrent = pLimit(10);
  const promises: Promise<unknown>[] = [];

  for (let i = 0; i < config.count; i++) {
    const n = config.offset + i;

    const traits = config.traits.map((trait) => ({
      name: trait.name,
      value: weightedPick(trait.values),
    }));

    const metadata = {
      name: config.nftNameTemplate.replace("$NUMBER", `${n}`),
      symbol: config.symbol,
      description: config.nftDescriptionTemplate.replace("$NUMBER", `${n}`),
      image: `${n}.png`,
      attributes: traits.map((trait) => ({
        trait_type: trait.name,
        value: trait.value.name,
      })),
      properties: {
        category: "image",
        files: [
          {
            uri: `${n}.png`,
            type: "image/png",
          },
        ],
      },
    };

    const layers = traits
      .filter((trait) => !!trait.value.path)
      .map((trait) => getTraitImagePath(trait.name, trait.value.name));

    promises.push(
      concurrent(() =>
        asyncfs
          .writeFile(
            path.join(config.assetsDir, `${n}.json`),
            JSON.stringify(metadata, null, 2)
          )
          .finally(() => console.log(`generated ${n}.json`))
      )
    );

    promises.push(
      concurrent(() =>
        sharp(layers.shift())
          .composite(layers.map((layer) => ({ input: layer })))
          .toFile(path.join(config.assetsDir, `${n}.png`))
          .finally(() => console.log(`generated ${n}.png`))
      )
    );
  }

  return Promise.all(promises);
};

(async () => {
  await resizeTraitImages();
  await generateAssets();
})();
