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

if [[ `git status --porcelain` ]]; then
    echo "Changes in local repository, repository needs to be clean. Aborting"
    exit 1
fi

if [[ `git branch --show-current` != "main" ]]; then
    echo "Local branch is not main. Aborting"
    exit 1
fi

git fetch origin

if [[ `git diff origin/main main` ]]; then
    echo "Local branch does not match origin main. Aborting"
    exit 1
fi

jq ".version = \"$RELEASE_TAG"" ./manifest.json | sponge ./manifest.json
