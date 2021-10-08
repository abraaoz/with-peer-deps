#!/usr/bin/env node
const chalk = require('chalk');

const { removePackages } = require('./peer-deps-lib');

function removePkgWithPeerDeps() {
  const packageName = process.argv[2];

  if (!packageName) {
    console.log(chalk.bgRed('É necessário especificar o nome do pacote'));
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
    console.log(`O pacote ${chalk.red(packageName)} não foi encontrado na pasta node_modules. Execute o comando ${chalk.yellow('yarn')} e tente novamente.`);
  }
}

removePkgWithPeerDeps();
