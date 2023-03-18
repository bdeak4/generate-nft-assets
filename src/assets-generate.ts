import fs from "fs";
import path from "path";
import pLimit from "p-limit";
import sharp from "sharp";

import { Config } from "./types";

const TRAITS_DIR = "trait-cache";
const config: Config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const getTraitImage = (trait: string, value: string) =>
  path.join(TRAITS_DIR, trait, `${value}.png`);

const optimizeTraitImages = () => {
  console.log("Optimizing trait images...");

  if (!fs.existsSync(TRAITS_DIR)) {
    fs.mkdirSync(TRAITS_DIR);
  }

  const concurrent = pLimit(10);

  for (const trait of config.traits) {
    const traitDir = path.join(TRAITS_DIR, trait.name);
    if (!fs.existsSync(traitDir)) {
      fs.mkdirSync(traitDir);
    }

    for (const value of trait.values) {
      concurrent(() =>
        sharp(value.path)
          .resize(config.imageSize.width, config.imageSize.height)
          .toFile(getTraitImage(trait.name, value.name))
      );
    }
  }
};

optimizeTraitImages();
