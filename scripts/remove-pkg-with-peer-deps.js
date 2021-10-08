#!/usr/bin/env node
const chalk = require('chalk');

const { removePackages } = require('./peer-deps-lib');

function removePkgWithPeerDeps() {
  const packageName = process.argv[2];

  if (!packageName) {
    console.log(chalk.bgRed('The package name is required'));
    process.exitCode = 1;
    return;
  }

  try {
    const currentPackageJson = require(`${packageName}/package.json`);
    const packagesToRemove = [
      packageName,
      ...Object.keys(currentPackageJson.peerDependencies),
    ];
    removePackages(packagesToRemove);
  } catch {
    console.log(`The package ${chalk.red(packageName)} was not found in the node_modules folder. Run the command ${chalk.yellow('yarn')} and try again.`);
  }
}

removePkgWithPeerDeps();
