import { readFileSync } from "fs";
import { join } from "path";
import * as yaml from "js-yaml";

import packageJson from "../../package.json";
const title = packageJson.name;
const description = packageJson.description;
const version = packageJson.version;

const YAML_CONFIG_FILENAME = "../../../.git_commit.yml";
export default (): Record<string, unknown> => {
  let yaml_cfg = {};
  try {
    yaml_cfg = yaml.load(
      readFileSync(join(__dirname, YAML_CONFIG_FILENAME), "utf8")
    ) as Record<string, unknown>;
  } catch (e) {
    //ignore
  }
  return { title, description, version, ...yaml_cfg };
};
