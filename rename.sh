#!/usr/bin/env bash
read -p "Enter repository name: " name
spaces=$(echo $name | tr "-" " ")
underscores=$(echo $name | tr "-" "_")
capitalized=$(echo $spaces | awk '{for (i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1')
sed -i ".bak" -e "s/nestjs-example/$name/g" ./package.json
sed -i ".bak" -e "s/nestjs_example/$underscores/g" ./local_db_setup.sh
sed -i ".bak" -e "s/nestjs_example/$underscores/g" ./.env
sed -i ".bak" -e "s/NestJS Example/$capitalized/g" ./src/main.ts
rm ./package.json.bak
rm ./local_db_setup.sh.bak
rm ./.env.bak
rm ./src/main.ts.bak
npm i
rm ./rename.sh
