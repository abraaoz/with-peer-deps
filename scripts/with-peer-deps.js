#!/usr/bin/env node
const chalk = require("chalk");
const { addOrUpgradePkgAndSyncPeerDeps } = require("./add-or-upgrade-pkg-and-sync-peer-deps");
const { debug } = require("./peer-deps-lib");
const { removePkgWithPeerDeps } = require("./remove-pkg-with-peer-deps");

function withPeerDeps() {
  debug();

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

  switch(command) {
    case 'add':
      addOrUpgradePkgAndSyncPeerDeps(packageName);
      break;
    case 'remove':
      removePkgWithPeerDeps(packageName);
      break;
  }
}

withPeerDeps();