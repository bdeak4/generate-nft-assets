import * as fs from "fs";
import * as asyncfs from "fs/promises";
import path from "path";
import _ from "lodash";

import { Config, Metadata } from "./types";

const config: Config = JSON.parse(fs.readFileSync("config.json", "utf8"));

const loadAllMetadata = async (): Promise<Metadata[]> => {
  const assetsDir = await asyncfs.readdir(config.assetsDir);
  return Promise.all(
    assetsDir
      .filter((file) => path.extname(file) === ".json")
      .map((file) => path.join(config.assetsDir, file))
      .map(
        (path) =>
          new Promise(async (resolve) => {
            const buffer = await asyncfs.readFile(path);
            const json = JSON.parse(buffer.toString()) as Metadata;
            return resolve(json);
          })
      )
  ) as Promise<Metadata[]>;
};

const traitStats = async () => {
  const metadata = await loadAllMetadata();
  const attributes = metadata.flatMap((m) => m.attributes);

  const counts = attributes.reduce((acc, curr) => {
    if (!acc[curr.trait_type]) {
      acc[curr.trait_type] = {};
    }
    if (!acc[curr.trait_type][curr.value]) {
      acc[curr.trait_type][curr.value] = 0;
    }
    acc[curr.trait_type][curr.value]++;
    return acc;
  }, {} as { [trait: string]: { [value: string]: number } });

  const percentages = Object.fromEntries(
    Object.entries(counts).map(([trait, values]) => {
      const total = Object.values(values).reduce((acc, curr) => acc + curr);
      const valueEntries = Object.entries(values).map(([value, count]) => {
        return [value, _.round((count / total) * 100, 1)];
      });
      return [trait, Object.fromEntries(valueEntries)];
    })
  );

  console.log("TRAIT COUNTS:", counts);
  console.log("TRAIT PERCENTAGES:", percentages);
};

(async () => {
  await traitStats();
})();
