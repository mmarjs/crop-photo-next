# This is a regular comment, that will not be displayed

## ----------------------------------------------------------------------
## This is a help comment. The purpose of this Makefile is to demonstrate
## a simple help mechanism that uses comments defined alongside the rules
## they describe without the need of additional help files or echoing of
## descriptions. Help comments are displayed in the order defined within
## the Makefile.
##

.DEFAULT_GOAL := help
.PHONY: help

help:
	@echo make codebuild - Starts the code build process locally. You must have codebuild.sh downloaded before running this command.
	@echo make run-create-env-local-file - Executes the "create-build-env-local-file.js" file which converts the .env.production into .env.local.
	@echo make docker-build-test - Builds the docker image for local testing purpose.
	@echo make dbt - Alias to "docker-build-test"

# Code build related tasks
codebuild:##Run the codebuild command without any AWS profile dependency.
	~/bin/codebuild_build.sh -c -b buildspec-web-application.yml -i public.ecr.aws/k8x9x6i3/evolphin-pico/aws-codebuild-env:1.0 -a ../out/

#run-create-env-local-file:
## Starts the create-build-env-local-file.js files which reads the .env.production and
## creates an .env.local files after feathering the updated values from AWS Parameter store
#	node .\scripts\aws\codebuild\create-build-env-local-file.js



docker docker-build db:
	$(eval AWS_CODEBUILD_VERSION=$(shell git rev-parse --short HEAD)-devel)
	docker build \
		--build-arg AWS_CODEBUILD_VERSION=$(AWS_CODEBUILD_VERSION) \
		--label org.label-schema.version=$(AWS_CODEBUILD_VERSION) \
		-t pico/pico-frontend:${AWS_CODEBUILD_VERSION} .

docker-clean dclean:
	docker rmi pico/pico-frontend:${AWS_CODEBUILD_VERSION}


drun:
	docker run --rm -p 3006:3006 pico/pico-frontend:local


head:
	git log --oneline -1

branch/diff:
	git log --pretty=format:%h,%an,%ae,%s ${BRANCH1}..HEAD > branch-diff.csv