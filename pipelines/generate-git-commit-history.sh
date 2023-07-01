#!/bin/bash
#this script should be uploaded to Azure DevOps Pipeline and shared by all pipelines.
SCRIPTDIR=$(dirname "$0")
GIT_COMMIT_FILE=$SCRIPTDIR/../.git_commit.json
echo -n '{"commit":' > $GIT_COMMIT_FILE
#git log -n 1 --oneline --abbrev=8 | awk 'NR>1{print ","} {gsub(/([\"\\/])/, "\\\&") ; COMMIT_HASH=$1; $1=""; printf " {\042" COMMIT_HASH "\042: \042" $0 "\042}"} ' >> $GIT_COMMIT_FILE
git log -n 1 --oneline --abbrev=8 --pretty=format:"%ci - <%h> : %s" | awk '{
  gsub(/\\/,"\\\\");   # Escape backslash \
  gsub(/"/,"\\\"");     # Escape double quote "
  gsub(/\//,"\\/");    # Escape forward slash /
  gsub(/\t/,"\\t");    # Escape tab character
  gsub(/\n/,"\\n");    # Escape newline character
  gsub(/\r/,"\\r");    # Escape carriage return character
  print "\""$0"\"";            # Print the escaped line
}' >> $GIT_COMMIT_FILE
echo -e "} " >> $GIT_COMMIT_FILE
