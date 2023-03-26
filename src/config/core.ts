import gitCommitJson from "../../.git_commit.json";
import packageJson from "../../package.json";

export default (): Record<string, unknown> => {
  const title = packageJson.name;
  const description = packageJson.description;
  const version = packageJson.version;
  // const lastCommits = gitCommitJson["latest commit"];
  // const previousCommits = gitCommitJson["previous commits"];
  const commits = gitCommitJson;

  return { title, description, version, commits };
};
