# with-peer-deps

This tool allows JavaScript developers to install and uninstall dependencies considering the peerDependencies of the package to be installed/uninstalled **as if they were dependencies of the parent repository**.

**WARNING: This tool only works for projects whose dependencies have been installed by `yarn`, not `npm`**

## How to use

To **install a dependency** and its peerDependencies as local dependencies:

```bash
npx -p with-peer-deps@latest add <anyPackageName>
```

To **upgrade or downgrade an already installed dependency** to a specific version and syncronize its peerDependencies as local dependencies:

```bash
npx -p with-peer-deps@latest add <anyPackageName@desiredVersion>
```

To **uninstall a dependency** and its peerDependencies from local dependencies:

```bash
npx -p with-peer-deps@latest remove <anyPackageName>
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
    "react-native-linear-gradient": "2.5.6" // <-- this will be automatically appended when you add my-design-system using `npx -p with-peer-deps@latest add my-design-system`
  }
}
```

`my-design-system` -> package.json:

```javascript
{
  "name": "my-design-system",
  "version": "0.0.3",
  "peerDependencies": {
    "react-native-linear-gradient": "2.5.6"
  }
}
```
