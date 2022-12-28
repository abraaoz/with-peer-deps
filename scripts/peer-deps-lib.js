import fs from "fs";
import chalk from "chalk";
import spawnargs from "spawn-args";
import { spawnSync } from "child_process";

export function runSync(cmd, verbose = true) {
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

export function isInstalled(packageName) {
  const npmList = runSync(`npm list ${packageName} --depth=0`, false);
  const notInstalled = npmList.stdout.trim().endsWith("`-- (empty)");
  return !notInstalled;
}

export function installPackages(packages, dev = false) {
  const packagesString = packages.join(" ");
  let command = `yarn add ${packagesString}`;
  if (dev) {
    command += " --dev";
  }
  return runSync(command);
}

export function installPackage(_package) {
  console.log(`Installing the package ${chalk.yellow(_package)}...`);
  installPackages([_package]);
}

export function getNameAndVersion(_package) {
  const hasVersion = new RegExp("^(.+)@(.+?)$");
  const hasVersionResult = hasVersion.exec(_package);
  if (hasVersionResult) {
    return {
      name: hasVersionResult[1],
      version: hasVersionResult[2],
    };
  }
  return {
    name: _package,
    version: null,
  };
}

export function removePackages(packages) {
  console.log("Checking the presence of the packages to be removed...");
  const packagesWithoutVersions = packages.map((_package) => {
    const { name } = getNameAndVersion(_package);
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

export function getPackageListWithoutVersions(packagesObj) {
  return Object.keys(packagesObj || {});
}

export function getPackageListWithVersions(packagesObj) {
  return Object.entries(packagesObj || {}).map(
    (_package) => `${_package[0]}@${_package[1]}`
  );
}

export function getCurrentPackageJson(packageName, verbose = true) {
  const currentPackageJsonPath = fs.realpathSync(
    `${process.cwd()}/node_modules/${packageName}/package.json`
  );
  if (verbose) {
    console.log(
      `Trying to read the file ${chalk.yellow(currentPackageJsonPath)}`
    );
  }
  return JSON.parse(fs.readFileSync(currentPackageJsonPath));
}

export function getMessage(messageArray) {
  switch (messageArray.length) {
    case 1:
      return `${messageArray[0]}...`;
    case 2:
      return `${messageArray[0]} ${messageArray[1]}...`;
    default:
      return (
        messageArray[0] +
        " " +
        messageArray.slice(1, -1).join(", ") +
        " and " +
        messageArray[messageArray.length - 1] +
        "..."
      );
  }
}

export function setResolution(_package, version) {
  console.log(
    `Setting resolution ${chalk.yellow(`${_package}: ${version}`)}`
  );
  const packageJsonPath = `${process.cwd()}/package.json`;
  const packageJsonObj = JSON.parse(
    fs.readFileSync(packageJsonPath, { encoding: "utf8" }) || '{}'
  );
  if (!packageJsonObj) {
    return;
  }
  packageJsonObj.resolutions = packageJsonObj.resolutions || {};
  packageJsonObj.resolutions[_package] = version;
  packageJsonStr = JSON.stringify(packageJsonObj, null, 2).replace(
    /\n/g,
    "\r\n"
  );
  fs.writeFileSync(packageJsonPath, packageJsonStr, { encoding: "utf8" });
}