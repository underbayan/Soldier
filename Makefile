PATH  := node_modules/.bin:$(PATH)
SHELL := /bin/bash
.PHONY: clean compress pack api deploy test publish
tmpr := `date +"%y%m%d"`
# clean is default task
clean:
	npm prune && rm -rf ./build
api:
	NODE_ENV=production ./node_modules/webpack/bin/webpack.js  --config ./webpack.config.js --env.api true --bail --progress
all:clean
	make api
	make deploy
deploy:
	s3cmd sync ./build/* s3://frontdev.waylens.com/soldier/ --acl-public --recursive
test:
	karma start karma.config.js
