#!/bin/bash

set -xe

if [ "$1" == "stop" ]; then
	docker container stop $(docker container ps -q)
fi

docker-compose build
docker-compose up -d --remove-orphans
