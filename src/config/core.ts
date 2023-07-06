import buildCommitJson from "../../.build_info.json";
import packageJson from "../../package.json";

export default (): Record<string, unknown> => {
  const title = packageJson.name;
  const description = packageJson.description;
  const version = packageJson.version;
  // const lastCommits = gitCommitJson["latest commit"];
  // const previousCommits = gitCommitJson["previous commits"];
  let buildInfo;
  let commitInfo;
  if (buildCommitJson) {
    if ("build_info" in buildCommitJson) {
      buildInfo = buildCommitJson.build_info;
    } else {
      buildInfo = {};
    }
    if ("commit_info" in buildCommitJson) {
      commitInfo = buildCommitJson.commit_info;
    } else {
      commitInfo = {};
    }
  }

  return { title, description, version, buildInfo, commitInfo };
};
