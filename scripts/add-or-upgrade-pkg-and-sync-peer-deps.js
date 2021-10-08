const fs = require('fs');
const chalk = require('chalk');
const { toJson } = require('really-relaxed-json');

const {
  runSync, getPackageListWithVersions, removePackages, installPackage, installPackages, getNameAndVersion,
} = require('./peer-deps-lib');

function addOrUpgradePkgAndSyncPeerDeps(packageName) {
  const latestPackageVersion = runSync(`npm info ${packageName} version`).stdout.trim();
  if (latestPackageVersion === '') {
    console.log(chalk.bgRed(`The package ${packageName} was not found in the available repositories`));
    process.exitCode = 3;
    return;
  }

  const { name, version } = getNameAndVersion(packageName);
  let requestedPackageVersion;
  if (version) {
    packageName = name;
    requestedPackageVersion = version;
  } else {
    requestedPackageVersion = latestPackageVersion;
  }

  const requestedPackageNameWithVersion = `${packageName}@${requestedPackageVersion}`;
  const npmInfo = runSync(`npm info ${requestedPackageNameWithVersion} peerDependencies`);
  const peerDeps = JSON.parse(toJson(npmInfo.stdout));
  const packagesToInstall = getPackageListWithVersions(peerDeps);
  try {
    const currentPackageJsonPath = `${process.cwd()}/node_modules/${packageName}/package.json`;
    console.log(`Trying to read the file ${chalk.yellow(currentPackageJsonPath)}`);
    const currentPackageJson = JSON.parse(fs.readFileSync(currentPackageJsonPath));
    const currentPackageNameWithVersion = `${packageName}@${currentPackageJson.version}`;
    const packagesToRemove = getPackageListWithVersions(currentPackageJson.peerDependencies).filter((package) => !packagesToInstall.includes(package));
    if (requestedPackageVersion === currentPackageJson.version) {
      console.log(`The package ${chalk.green(currentPackageNameWithVersion)} is already in the requested version`);
      if (packagesToRemove.length > 0) {
        console.log('Removing inconsistent peerDependencies...');
        removePackages(packagesToRemove);
      }
    } else {
      let message = `A divergent version of the package ${chalk.red(currentPackageNameWithVersion)} has been detected, removing the package`;
      if (packagesToRemove.length > 0) {
        message += ' and inconsistent peerDependencies...';
      }
      console.log(message);
      packagesToRemove.push(currentPackageNameWithVersion);
      removePackages(packagesToRemove);
      installPackage(requestedPackageNameWithVersion);
    }
  } catch {
    installPackage(requestedPackageNameWithVersion);
  } finally {
    if (packagesToInstall.length > 0) {
      console.log(`Installing package ${chalk.green(requestedPackageNameWithVersion)} peerDependencies...`);
      installPackages(packagesToInstall);
    }
  }
}

module.exports = {
  addOrUpgradePkgAndSyncPeerDeps
}
