#!/usr/bin/env bash

set -e

rm ./chinese-dict.zip || true
echo "Zipping all files apart from manifest.json"
find . | grep -P '(\.png|\.html|\.css|(^(?!.*\.test\.js)).*\.js$|\./data)' | grep -v -P '(node_modules|browser_tests|mock-extension-apis.js|eslint)' | zip -@ chinese-dict.zip
EXT_PATH=$(pwd)

echo "Cleaning up tmp"

rm -rf /tmp/chinese-dict
mkdir -p /tmp/chinese-dict
cd /tmp/chinese-dict

echo "Generating manifest.json"

mkfifo manifest.json
cat $EXT_PATH/manifest.json | egrep -v '"key"' > /tmp/chinese-dict/manifest.json &

echo "Zipping manifest.json fifo"

zip --fifo $EXT_PATH/chinese-dict.zip manifest.json
rm -rf /tmp/chinese-dict
