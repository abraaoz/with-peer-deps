const chalk = require('chalk');

const { removePackages } = require('./peer-deps-lib');

function removePkgWithPeerDeps(packageName) {
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

module.exports = {
  removePkgWithPeerDeps
}
