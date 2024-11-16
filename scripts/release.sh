#!/usr/bin/env bash

if [[ -z $1 ]]; then
    echo "Needs a release tag"
    exit 1
fi

RELEASE_TAG=$1

echo $RELEASE_TAG | \
     grep -P '^(?P<major>0|[1-9]\d*)\.(?P<minor>0|[1-9]\d*)\.(?P<patch>0|[1-9]\d*)(?:-(?P<prerelease>(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+(?P<buildmetadata>[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$' \
     > /dev/null

if [[ $? -ne 0 ]]; then
    echo "Release tag is not a valid semver"
    exit 1
fi

set -e

if [[ `git diff --cached -- manifest.json` ]]; then
    echo "Manifest.json in the index cannot be modified. Aborting"
    exit 1
fi

if [[ `git diff -- manifest.json` ]]; then
    echo "Manifest.json in the working directory is already modified. Aborting"
    exit 1
fi

if [[ `git rev-parse --abbrev-ref HEAD` != "main" ]]; then
    echo "Local branch is not main. Aborting"
    exit 1
fi

git fetch origin

if [[ `git diff origin/main main -- manifest.json` ]]; then
    echo "Local manifest.json does not match origin main. Aborting"
    exit 1
fi

jq ".version = \"$RELEASE_TAG\"" ./manifest.json | sponge ./manifest.json

git add manifest.json
git commit -m "Manifest release version $RELEASE_TAG"


