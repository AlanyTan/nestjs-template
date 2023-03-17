import { readFileSync } from "fs";
import { join } from "path";
import * as yaml from "js-yaml";

const YAML_CONFIG_FILENAME = "../../../.git_commit.yml";

export default (): Record<string, unknown> => {
  return yaml.load(
    readFileSync(join(__dirname, YAML_CONFIG_FILENAME), "utf8")
  ) as Record<string, unknown>;
};
