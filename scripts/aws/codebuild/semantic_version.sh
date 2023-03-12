#!/bin/bash

script_home=$(dirname "$0")

branch=${BUILD_ENV:-$($script_home/branch-abbrev.sh)}


if [[ -z ${CODEBUILD_BUILD_NUMBER} || -z ${CODEBUILD_RESOLVED_SOURCE_VERSION} ]]  ; then 
		# The AWS CodenBuild is probbaly running in a local env hence these vars are not defined, so use dummy values
		CODEBUILD_BUILD_NUMBER=XXXX
		CODEBUILD_RESOLVED_SOURCE_VERSION=97dd2ae065771908ee9ae0fa08ccdb58b5a6b18f		
fi

# Syntax: <branch abbreviation>-<YYYYMMDD>-b<CodeBuild Build Number>-<Git Commit Short Hash>

build_date=$(date '+%Y%m%d')

# Since CodePipeline will not be able to run got command as it doesnt package the .git folder we just grab the first 8 chars
short_commit_hash=${CODEBUILD_RESOLVED_SOURCE_VERSION:0:8}
#short_commit_hash=$(git rev-parse --short "$CODEBUILD_RESOLVED_SOURCE_VERSION")

version="$branch"-"$build_date"-b"$CODEBUILD_BUILD_NUMBER"-"$short_commit_hash"
echo $version;
