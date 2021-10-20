const fs = require("fs");
const chalk = require("chalk");
const { spawnSync } = require("child_process");
const spawnargs = require("spawn-args");

function runSync(cmd, verbose = true) {
  console.log(`Running ${chalk.yellow(cmd)}`);
  const args = spawnargs(cmd);
  const process = spawnSync(args[0], args.slice(1), {
    shell: true,
    encoding: "utf8",
  });
  if (verbose) {
    console.log(chalk.green(process.stdout));
  }
  return process;
}

function isInstalled(packageName) {
  const npmList = runSync(`npm list ${packageName} --depth=0`, false);
  const notInstalled = npmList.stdout.trim().endsWith("`-- (empty)");
  return !notInstalled;
}

function installPackages(packages, dev = false) {
  const packagesString = packages.join(" ");
  let command = `yarn add ${packagesString}`;
  if (dev) {
    command += " --dev";
  }
  return runSync(command);
}

function installPackage(package) {
  console.log(`Installing the package ${chalk.yellow(package)}...`);
  installPackages([package]);
}

function getNameAndVersion(package) {
  const hasVersion = new RegExp("^(.+)@(.+?)$");
  const hasVersionResult = hasVersion.exec(package);
  if (hasVersionResult) {
    return {
      name: hasVersionResult[1],
      version: hasVersionResult[2],
    };
  }
  return {
    name: package,
    version: null,
  };
}

function removePackages(packages) {
  console.log("Checking the presence of the packages to be removed...");
  const packagesWithoutVersions = packages.map((package) => {
    const { name } = getNameAndVersion(package);
    return name;
  });
  const installedPackages = packagesWithoutVersions.filter(isInstalled);
  if (installedPackages.length === 0) {
    console.log("All packages have already been removed");
    return;
  }
  const packagesString = installedPackages.join(" ");
  return runSync(`yarn remove ${packagesString}`);
}

function getPackageListWithVersions(packagesObj) {
  return Object.entries(packagesObj).map(
    (package) => `${package[0]}@${package[1]}`
  );
}

function getCurrentPackageJson(packageName, verbose = true) {
  const currentPackageJsonPath = `${process.cwd()}/node_modules/${packageName}/package.json`;
  if (verbose) {
    console.log(
      `Trying to read the file ${chalk.yellow(currentPackageJsonPath)}`
    );
  }
  return JSON.parse(fs.readFileSync(currentPackageJsonPath));
}

module.exports = {
  runSync,
  isInstalled,
  installPackages,
  installPackage,
  getNameAndVersion,
  removePackages,
  getPackageListWithVersions,
  getCurrentPackageJson,
};
