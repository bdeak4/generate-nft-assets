import * as fs from "fs";
import _ from "lodash";

export const mkdir = (...dirs: string[]) => {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }
};

export const weightedPick = <T extends { weight: number }>(items: T[]): T =>
  _.sample(items.flatMap((item) => _.times(item.weight, () => item)))!;
