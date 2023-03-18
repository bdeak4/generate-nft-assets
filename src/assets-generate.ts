import * as fs from "fs";
import path from "path";
import _ from "lodash";
import pLimit from "p-limit";
import sharp from "sharp";

import { Config } from "./types";

const config: Config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const traitsCache = "trait-cache";

const mkdir = (...dirs: string[]) => {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
};

const getTraitImage = (trait: string, value: string) =>
  path.join(traitsCache, trait, `${value}.png`);

const resizeTraitImages = async (): Promise<sharp.OutputInfo[]> => {
  console.log("Optimizing trait images...");

  mkdir(traitsCache);

  const concurrent = pLimit(10);
  const promises: Promise<sharp.OutputInfo>[] = [];

  for (const trait of config.traits) {
    mkdir(path.join(traitsCache, trait.name));

    for (const value of trait.values) {
      promises.push(
        concurrent(() =>
          sharp(value.path)
            .resize(config.imageSize.width, config.imageSize.height)
            .toFile(getTraitImage(trait.name, value.name))
            .finally(() => console.log(`optimized ${trait.name}/${value.name}`))
        )
      );
    }
  }

  return Promise.all(promises);
};

const generateAssets = async (): Promise<sharp.OutputInfo[]> => {
  console.log("Generating assets...");

  mkdir(config.assetsDir);

  const concurrent = pLimit(10);
  const promises: Promise<sharp.OutputInfo>[] = [];

  for (let i = 0; i < config.count; i++) {
    const layers = config.traits.map((trait) =>
      getTraitImage(trait.name, _.sample(trait.values)!.name)
    );

    promises.push(
      concurrent(() =>
        sharp(layers.shift())
          .composite(layers.map((layer) => ({ input: layer })))
          .toFile(path.join(config.assetsDir, `${config.offset + i}.png`))
          .finally(() => console.log(`generated ${config.offset + i}.png`))
      )
    );
  }

  return Promise.all(promises);
};

(async () => {
  await resizeTraitImages();
  await generateAssets();
})();
