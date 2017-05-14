#!/bin/bash

set -e
set -x

# Make sure ocaml is installed
# TODO: Use the .sh script which comses from the WebAssembly spec
brew install ocaml ocamlbuild

cd $(dirname ${BASH_SOURCE[0]})

rm -rf ./test/
mkdir ./test/

cd ./WebAssembly/spec/interpreter
make

cd ../../../

node prepareTests.js

# TODO: edit the python script to take an inputDir instead of ownDir always
cp ./WebAssembly/spec/test/core/run.py ./test/
./test/run.py --wasm `pwd`/WebAssembly/spec/interpreter/wasm
