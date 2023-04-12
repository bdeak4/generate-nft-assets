import process from "process";
import fs from "fs";
import path from "path";

const traitsDir = process.argv[2];
if (!traitsDir) {
  throw new Error("No trait directory specified");
}

if (fs.existsSync("config.json")) {
  throw new Error("Config file already exists");
}

const cleanFilename = (name: string) => {
  // TODO: title case
  return name.replace(".png", "");
};

const traits = fs
  .readdirSync(traitsDir, { withFileTypes: true })
  .filter((traitDir) => traitDir.isDirectory())
  .map(({ name }) => ({
    name: cleanFilename(name),
    path: path.join(traitsDir, name),
    values: fs.readdirSync(path.join(traitsDir, name)).map((trait) => ({
      name: cleanFilename(trait),
      path: path.join(traitsDir, name, trait),
      weight: 1,
    })),
  }));

const config = {
  symbol: "MYNFT",
  collectionName: "My NFT Collection",
  collectionImagePath: "./mynfts.png",
  collectionDescription: "",
  nftNameTemplate: "My NFT $NUMBER",
  nftDescriptionTemplate: "",
  imageSize: {
    width: 1000,
    height: 1000,
  },
  assetsDir: "./assets",
  count: 10000,
  offset: 0,
  traits,
};

fs.writeFileSync("config.json", JSON.stringify(config, null, 2));
