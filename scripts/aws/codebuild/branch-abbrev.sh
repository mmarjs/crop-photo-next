#!/bin/bash

# Purpose
#   This script returns the abbreviated branch name from the git branch name
# Depends on
#   git command that will get current branch name

git_branch=$(git branch --show-current)

[[ -z ${git_branch+x} ]] && {
		echo 'Failed to get current Git branch name. '$git_branch
		exit 1
		}


case $git_branch in
		
  Development/Daisy)
   branch_abbrev='daisy'
    ;;
  Deployment/Production)
    branch_abbrev='prod'
    ;;
  Deployment/Staging)
    branch_abbrev='beta'
    ;;
  Deployment/Dev)
    branch_abbrev='dev'
    ;;
	*)
		branch_abbrev='unknown'
		exit 1	
		;;
esac

echo ${branch_abbrev}

exit 0;
