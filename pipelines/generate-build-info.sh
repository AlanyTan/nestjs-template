#!/bin/bash
#this script should be uploaded to Azure DevOps Pipeline and shared by all pipelines.
SCRIPTDIR=$(dirname "$0")
BUILD_INFO_FILE=$SCRIPTDIR/../.build-info.json
echo -n '{"commitInfo":' > $BUILD_INFO_FILE
git log -n 1 --oneline --abbrev=8 --pretty=format:"%cI,~<%h>,~%s" | awk -F',~' '{
  gsub(/\\/,"\\\\");   # Escape backslash \
  gsub(/"/,"\\\"");     # Escape double quote "
  gsub(/\//,"\\/");    # Escape forward slash /
  gsub(/\t/,"\\t");    # Escape tab character
  gsub(/\n/,"\\n");    # Escape newline character
  gsub(/\r/,"\\r");    # Escape carriage return character
  print "{\"commitTime\":\""$1"\",\"commitHash\":\""$2"\",\"commitMessage\":\""$3"\"}";         # Print the escaped line
}' >> $BUILD_INFO_FILE
echo -e "," >> $BUILD_INFO_FILE
echo -e "\"buildInfo\":{\"build\":\"2023-07-06_4231386d_124\", \"buildNumber\":124, \"buildTime\":\"2023-07-06 09:25:30\"}" >> $BUILD_INFO_FILE
echo -e "} " >> $BUILD_INFO_FILE
