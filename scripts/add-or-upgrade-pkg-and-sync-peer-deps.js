#!/usr/bin/env node
const chalk = require('chalk');
const { toJson } = require('really-relaxed-json');

const {
  runSync, getPackageListWithVersions, removePackages, installPackage, installPackages, getNameAndVersion,
} = require('./peer-deps-lib');

function addOrUpgradePkgAndSyncPeerDeps() {
  let packageName = process.argv[2];

  if (!packageName) {
    console.log(chalk.bgRed('É necessário especificar o nome do pacote'));
    process.exitCode = 1;
    return;
  }

  const latestPackageVersion = runSync(`npm info ${packageName} version`).stdout.trim();
  if (latestPackageVersion === '') {
    console.log(chalk.bgRed(`O pacote ${packageName} não foi encontrado nos repositórios disponíveis`));
    process.exitCode = 2;
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
    const currentPackageJson = require(`${packageName}/package.json`);
    const currentPackageNameWithVersion = `${packageName}@${currentPackageJson.version}`;
    const packagesToRemove = getPackageListWithVersions(currentPackageJson.peerDependencies).filter((package) => !packagesToInstall.includes(package));
    if (requestedPackageVersion === currentPackageJson.version) {
      console.log(`O pacote ${chalk.green(currentPackageNameWithVersion)} já está na versão solicitada`);
      if (packagesToRemove.length > 0) {
        console.log('Removendo peerDependencies inconsistentes...');
        removePackages(packagesToRemove);
      }
    } else {
      let message = `Versão divergente do pacote ${chalk.red(currentPackageNameWithVersion)} detectada, removendo o pacote`;
      if (packagesToRemove.length > 0) {
        message += ' e peerDependencies inconsistentes...';
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
      console.log(`Instalando peerDependencies do pacote ${chalk.green(requestedPackageNameWithVersion)}...`);
      installPackages(packagesToInstall);
    }
  }
}

addOrUpgradePkgAndSyncPeerDeps();
