#!/usr/bin/env bash

set -e

rm ./chinese-dict.zip || true
find . | grep -P '(manifest.json|\.png|\.html|\.css|(^(?!.*\.test\.js)).*\.js$|\./data)' | grep -v -P '(node_modules|browser_tests|mock-extension-apis.js|eslint)' | zip -@ chinese-dict.zip
