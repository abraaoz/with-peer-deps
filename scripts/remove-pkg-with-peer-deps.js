const chalk = require('chalk');

const {
  removePackages,
  getPackageListWithoutVersions,
  getCurrentPackageJson,
} = require('./peer-deps-lib');

function removePkgWithPeerDeps(packageName) {
  try {
    const currentPackageJson = getCurrentPackageJson(packageName);
    const currentPeerDeps = getPackageListWithoutVersions(currentPackageJson.peerDependencies);
    const currentPeerDevDeps = getPackageListWithoutVersions(currentPackageJson.peerDevDependencies);

    const packagesToRemove = [
      packageName,
      ...currentPeerDeps,
      ...currentPeerDevDeps,
    ];
    removePackages(packagesToRemove);
  } catch {
    console.log(`The package ${chalk.red(packageName)} was not found in the node_modules folder. Run the command ${chalk.yellow('yarn')} and try again.`);
  }
}

module.exports = {
  removePkgWithPeerDeps
}
