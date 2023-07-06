#!/bin/bash
#this script should be uploaded to Azure DevOps Pipeline and shared by all pipelines.
SCRIPTDIR=$(dirname "$0")
BUILD_INFO_FILE=$SCRIPTDIR/../.build_info.json
echo -n '{"commit_info":' > $BUILD_INFO_FILE
#git log -n 1 --oneline --abbrev=8 | awk 'NR>1{print ","} {gsub(/([\"\\/])/, "\\\&") ; COMMIT_HASH=$1; $1=""; printf " {\042" COMMIT_HASH "\042: \042" $0 "\042}"} ' >> $BUILD_INFO_FILE
git log -n 1 --oneline --abbrev=8 --pretty=format:"%cI,~<%h>,~%s" | awk -F',~' '{
  gsub(/\\/,"\\\\");   # Escape backslash \
  gsub(/"/,"\\\"");     # Escape double quote "
  gsub(/\//,"\\/");    # Escape forward slash /
  gsub(/\t/,"\\t");    # Escape tab character
  gsub(/\n/,"\\n");    # Escape newline character
  gsub(/\r/,"\\r");    # Escape carriage return character
  print "{\"commit_time\":\""$1"\",\"commit_hash\":\""$2"\",\"commit_message\":\""$3"\"}";         # Print the escaped line
}' >> $BUILD_INFO_FILE
echo -e "," >> $BUILD_INFO_FILE
echo -e "\"build_info\":{\"build\":\"2023-07-06_4231386d_124\", \"build_number\":124, \"build_time\":\"2023-07-06 09:25:30\"}" >> $BUILD_INFO_FILE
echo -e "} " >> $BUILD_INFO_FILE
