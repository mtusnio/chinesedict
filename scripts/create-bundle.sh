#!/usr/bin/env bash

set -e

if [[ -z $1 ]]; then
    echo "Needs one of the following parameters: chrome firefox"
    exit 1
fi
TYPE=$1
FILENAME=chinese-dict-$TYPE.zip

rm ./$FILENAME || true
echo "Zipping all files apart from manifest.json"
find . | grep -P '(\.png|\.html|\.css|(^(?!.*\.test\.js)).*\.js$|\./data)' | grep -v -P '(node_modules|browser_tests|mock-extension-apis.js|eslint)' | zip -@ $FILENAME
EXT_PATH=$(pwd)

echo "Cleaning up tmp"

rm -rf /tmp/chinese-dict
mkdir -p /tmp/chinese-dict
cd /tmp/chinese-dict

echo "Generating manifest.json"

mkfifo manifest.json
cat $EXT_PATH/manifest.json | egrep -v '"key"' > ./manifest-file.json

if [[ $TYPE == "firefox" ]]; then
    echo "Performing firefox substitution"
    jq 'del(.background.service_worker)' ./manifest-file.json | sponge ./manifest-file.json
    jq '.background.scripts = [ "worker.js" ]' ./manifest-file.json | sponge ./manifest-file.json

    # Extension names have to be 45 characters long in Firefox workshop
    jq '.name = "Chinese Popup Dictionary Mandarin & Cantonese"' ./manifest-file.json | sponge ./manifest-file.json
fi

cat ./manifest-file.json > ./manifest.json &

echo "Zipping manifest.json fifo"

zip --fifo $EXT_PATH/$FILENAME manifest.json
rm -rf /tmp/chinese-dict
