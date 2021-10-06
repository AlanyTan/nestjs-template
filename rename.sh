#!/usr/bin/env bash
read -p "Enter repository name: " name
spaces=$(echo $name | tr "-" " ")
underscores=$(echo $name | tr "-" "_")
capitalized=$(sed "s/\b\(.\)/\u\1/g" <<< $spaces)
sed -i "s/nestjs-example/$name/g" ./package.json
sed -i "s/nestjs_example/$underscores/g" ./local_setup.sh
sed -i "s/nestjs_example/$underscores/g" ./.env
sed -i "s/NestJS Example/$capitalized/g" ./src/main.ts
npm i
rm ./rename.sh
