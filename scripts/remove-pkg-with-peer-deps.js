const chalk = require('chalk');

const { removePackages } = require('./peer-deps-lib');

function removePkgWithPeerDeps(packageName) {
  try {
    const currentPackageJsonPath = `${process.cwd()}/node_modules/${packageName}/package.json`;
    console.log(`Trying to read the file ${chalk.yellow(currentPackageJsonPath)}`);
    const currentPackageJson = JSON.parse(fs.readFileSync(currentPackageJsonPath));
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
