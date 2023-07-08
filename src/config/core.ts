import buildCommitJson from "../../.build-info.json";
import packageJson from "../../package.json";

export default (): Record<string, unknown> => {
  const title = packageJson.name;
  const description = packageJson.description;
  const version = packageJson.version;
  let buildInfo;
  let commitInfo;
  if (buildCommitJson) {
    if ("buildInfo" in buildCommitJson) {
      buildInfo = buildCommitJson.buildInfo;
    } else {
      buildInfo = {};
    }
    if ("commitInfo" in buildCommitJson) {
      commitInfo = buildCommitJson.commitInfo;
    } else {
      commitInfo = {};
    }
  }

  return { title, description, version, buildInfo, commitInfo };
};
