const chalk = require('chalk');
const { toJson } = require('really-relaxed-json');

const {
  runSync,
  getPackageListWithoutVersions,
  getPackageListWithVersions,
  removePackages,
  installPackage,
  installPackages,
  getNameAndVersion,
  getCurrentPackageJson,
  getMessage,
} = require('./peer-deps-lib');

function addOrUpgradePkgAndSyncPeerDeps(packageName, ignoreNodeModules) {
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

  const npmInfoPeerDeps = runSync(`npm info ${requestedPackageNameWithVersion} peerDependencies`);
  const peerDeps = JSON.parse(toJson(npmInfoPeerDeps.stdout || '{}'));

  const npmInfoPeerDevDeps = runSync(`npm info ${requestedPackageNameWithVersion} peerDevDependencies`);
  const peerDevDeps = JSON.parse(toJson(npmInfoPeerDevDeps.stdout || '{}'));

  try {
    let currentPackageJson;
    if(ignoreNodeModules) {
      const ownPackageJson = getCurrentPackageJson('..');
      const installedPackageVersion = (ownPackageJson.dependencies[packageName] || ownPackageJson.devDependencies[packageName] || '0.0.1').replace('^', '');
      const installedPackageNameWithVersion = `${packageName}@${installedPackageVersion}`;

      const _npmInfoPeerDeps = runSync(`npm info ${installedPackageNameWithVersion} peerDependencies`);
      const _peerDeps = JSON.parse(toJson(_npmInfoPeerDeps.stdout || '{}'));

      const _npmInfoPeerDevDeps = runSync(`npm info ${installedPackageNameWithVersion} peerDevDependencies`);
      const _peerDevDeps = JSON.parse(toJson(_npmInfoPeerDevDeps.stdout || '{}'));

      currentPackageJson = {
        version: installedPackageVersion,
        peerDependencies: _peerDeps,
        peerDevDependencies: _peerDevDeps,
      };
    } else {
      currentPackageJson = getCurrentPackageJson(packageName);
    }
    const currentPackageNameWithVersion = `${packageName}@${currentPackageJson.version}`;

    const packagesToInstallAsDepsWithoutVersions = getPackageListWithoutVersions(peerDeps);
    const currentPeerDeps = getPackageListWithoutVersions(currentPackageJson.peerDependencies);
    const depsToRemove = currentPeerDeps.filter((package) => !packagesToInstallAsDepsWithoutVersions.includes(package));

    const packagesToInstallAsDevDepsWithoutVersions = getPackageListWithoutVersions(peerDevDeps);
    const currentPeerDevDeps = getPackageListWithoutVersions(currentPackageJson.peerDevDependencies);
    const devDepsToRemove = currentPeerDevDeps.filter((package) => !packagesToInstallAsDevDepsWithoutVersions.includes(package));

    if (requestedPackageVersion === currentPackageJson.version) {
      console.log(`The package ${chalk.green(currentPackageNameWithVersion)} is already in the requested version`);
      const packagesToRemove = [...depsToRemove, ...devDepsToRemove];
      if(packagesToRemove.length > 0) {
        let messageArray = ['Removing'];
        if (depsToRemove.length > 0) {
          messageArray.push('inconsistent peerDependencies');
        }
        if (devDepsToRemove.length > 0) {
          messageArray.push('inconsistent peerDevDependencies');
        }
        console.log(getMessage(messageArray));
        removePackages(packagesToRemove);
      }
    } else {
      console.log(`A divergent version of the package ${chalk.red(currentPackageNameWithVersion)} has been detected`);
      let messageArray = ['Removing', 'the package'];
      if (depsToRemove.length > 0) {
        messageArray.push('inconsistent peerDependencies');
      }
      if (devDepsToRemove.length > 0) {
        messageArray.push('inconsistent peerDevDependencies');
      }
      console.log(getMessage(messageArray));
      removePackages([currentPackageNameWithVersion, ...depsToRemove, ...devDepsToRemove]);
      installPackage(requestedPackageNameWithVersion);
    }
  } catch {
    installPackage(requestedPackageNameWithVersion);
  } finally {
    const packagesToInstallAsDepsWithVersions = getPackageListWithVersions(peerDeps);
    if (packagesToInstallAsDepsWithVersions.length > 0) {
      console.log(`Installing package ${chalk.green(requestedPackageNameWithVersion)} peerDependencies as local dependencies...`);
      installPackages(packagesToInstallAsDepsWithVersions);
    }

    const packagesToInstallAsDevDepsWithVersions = getPackageListWithVersions(peerDevDeps);
    if (packagesToInstallAsDevDepsWithVersions.length > 0) {
      console.log(`Installing package ${chalk.green(requestedPackageNameWithVersion)} peerDevDependencies as local devDependencies...`);
      installPackages(packagesToInstallAsDevDepsWithVersions, true);
    }
  }
}

module.exports = {
  addOrUpgradePkgAndSyncPeerDeps
}
