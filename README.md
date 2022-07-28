# with-peer-deps

This tool allows JavaScript developers to install and uninstall dependencies considering the `peerDependencies` and `peerDevDependencies` of the package to be installed/uninstalled **as if they were dependencies and devDependencies of the parent repository**.

**WARNING: This tool only works for projects whose dependencies have been installed by `yarn`, not `npm`**

## How to use

To **install a dependency** and its `peerDependencies` as local `dependencies` and its `peerDevDependencies` as local `devDependencies`:

```bash
npx with-peer-deps@latest add <anyPackageName>
```

To **upgrade or downgrade an already installed dependency** to a specific version and syncronize its `peerDependencies` as local `dependencies` and its `peerDevDependencies` as local `devDependencies`:

```bash
npx with-peer-deps@latest add <anyPackageName@desiredVersion>
```

If you are using `yarn link` for the installed dependencies, you must append `--ignore-node-modules` to resolve the installed version using only the package.json declared version (ignore link):

```bash
npx with-peer-deps@latest add <anyPackageName@desiredVersion> --ignore-node-modules
```

You can also append `--set-resolution` to save the specified package version in the package.json `resolutions` section.

To **uninstall a dependency**, its `peerDependencies` from local `dependencies` and its `peerDevDependencies` from local `devDependencies`:

```bash
npx with-peer-deps@latest remove <anyPackageName>
```

## Use case

When we want to install an X dependency that contains several peerDependencies in a Y project, we will also need those peerDependencies declared as local dependencies of the Y project.

`my-mobile-app` -> package.json:

```javascript
{
  "name": "my-mobile-app",
  "version": "0.0.1",
  "dependencies": {
    "my-design-system": "0.0.3",
    "react-native-svg": "^12.1.1" // <-- this will be automatically appended when you add my-design-system using `npx with-peer-deps@latest add my-design-system`
  },
  "devDependencies": {
    "react-native-svg-transformer": "^0.14.3" // <-- this will be automatically appended when you add my-design-system using `npx with-peer-deps@latest add my-design-system`
  }
}
```

`my-design-system` -> package.json:

```javascript
{
  "name": "my-design-system",
  "version": "0.0.3",
  "peerDependencies": {
    "react-native-svg": "^12.1.1"
  },
  "peerDevDependencies": {
    "react-native-svg-transformer": "^0.14.3"
  }
}
```
