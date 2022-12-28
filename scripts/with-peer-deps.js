#!/usr/bin/env node
import chalk from "chalk";
import { addOrUpgradePkgAndSyncPeerDeps } from "./add-or-upgrade-pkg-and-sync-peer-deps.js";
import { removePkgWithPeerDeps } from "./remove-pkg-with-peer-deps.js";

function withPeerDeps() {
  const command = process.argv[2];
  if(command !== 'add' && command !== 'remove') {
    console.log(`The command ${chalk.red(command)} should be ${chalk.green('add')} or ${chalk.green('remove')}`);
    process.exitCode = 1;
    return;
  }

  const packageName = process.argv[3];
  if (!packageName) {
    console.log(chalk.bgRed('The package name is required'));
    process.exitCode = 2;
    return;
  }

  const ignoreNodeModulesFlag = '--ignore-node-modules';
  const ignoreNodeModules = Boolean(process.argv.find((arg) => arg === ignoreNodeModulesFlag));

  const setResolutionFlag = '--set-resolution';
  const setResolution = Boolean(process.argv.find((arg) => arg === setResolutionFlag));

  const includePrereleasesFlag = '--include-prereleases';
  const includePrereleases = Boolean(process.argv.find((arg) => arg === includePrereleasesFlag));

  switch(command) {
    case 'add':
      addOrUpgradePkgAndSyncPeerDeps(packageName, ignoreNodeModules, setResolution, includePrereleases);
      break;
    case 'remove':
      removePkgWithPeerDeps(packageName);
      break;
  }
}

withPeerDeps();