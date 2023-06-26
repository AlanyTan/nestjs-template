/bin/bash
#this script should be uploaded to Azure DevOps Pipeline and shared by all pipelines.
GIT_COMMIT_FILE=../.git_commit.json
echo '"last 3 commits":[' >> $GIT_COMMIT_FILE
git log -n 3 --oneline --abbrev=8 | awk 'NR>1{print ","} {gsub(/([\"\\/])/, "\\\&") ; COMMIT_HASH=$1; $1=""; printf " {\042" COMMIT_HASH "\042: \042" $0 "\042}"} ' >> $GIT_COMMIT_FILE
echo "\n ]\n}" >> $GIT_COMMIT_FILE
git add $GIT_COMMIT_FILE