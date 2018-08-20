#!/bin/bash
# Create package script

PACKAGE_NAME=$1
AUTHOR=$2
DESCRIPTION=$3

echo "Creating $PACKAGE_NAME"

cd packages

mkdir $PACKAGE_NAME
cd $PACKAGE_NAME
mkdir src
touch package.json
touch src/index.js

cat <<EOM >package.json
{
  "name": "$PACKAGE_NAME",
  "version": "0.1.0",
  "description": "$DESCRIPTION",
  "main": "dist/$PACKAGE_NAME.js",
  "scripts": {
    "test": "ava"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ballercat/walt.git"
  },
  "keywords": [
    "wasm",
    "wast",
    "javascript",
    "webassembly",
    "compiler"
  ],
  "author": "$AUTHOR",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/ballercat/walt/issues"
  },
  "homepage": "https://github.com/ballercat/walt#readme",
  "dependencies": {
  },
  "devDependencies": {
    "ava": "0.24.0",
    "babel-cli": "6.26.0",
    "babel-eslint": "^8.1.1",
    "babel-plugin-external-helpers": "6.22.0",
    "babel-plugin-transform-object-rest-spread": "6.26.0",
    "babel-plugin-transform-runtime": "6.23.0",
    "babel-preset-env": "1.6.0",
    "babel-register": "^6.26.0",
    "cross-env": "5.1.3",
    "eslint": "^5.0.0",
    "husky": "0.14.3",
    "lint-staged": "6.0.0",
    "pirates": "^3.0.2",
    "prettier": "1.9.2",
    "rollup": "0.52.2",
    "rollup-plugin-babel": "3.0.2",
    "rollup-plugin-commonjs": "8.0.2",
    "rollup-plugin-eslint": "4.0.0",
    "rollup-plugin-node-builtins": "2.1.2",
    "rollup-plugin-node-resolve": "3.0.0",
    "rollup-plugin-replace": "2.0.0",
    "rollup-plugin-string": "^2.0.2",
    "rollup-plugin-uglify": "2.0.1"
  },
  "prettier": {
    "trailingComma": "es5",
    "singleQuote": true
  },
  "ava": {
    "files": [
      "src/**/*[sS]pec.js"
    ],
    "source": [
      "src/**/*.js",
      "src/**/*.walt"
    ],
    "failFast": true,
    "failWithoutAssertions": false,
    "tap": false,
    "powerAssert": false,
    "require": [
      "babel-register"
    ],
    "babel": "inherit"
  },
  "lint-staged": {
    "src/**/*.js": [
      "prettier --write",
      "git add"
    ]
  }
}
EOM

pwd
cp ../walt-compiler/.babelrc ./
cp ../walt-compiler/.eslintrc ./

