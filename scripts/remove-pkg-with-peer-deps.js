import chalk from 'chalk';

import {
  removePackages,
  getPackageListWithoutVersions,
  getCurrentPackageJson,
} from './peer-deps-lib.js';

export function removePkgWithPeerDeps(packageName) {
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