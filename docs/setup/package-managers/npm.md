---
outline: deep
---

# <img src="/logos/npmlogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> npm

npm is the default package manager for Node.js and the world's largest software registry, hosting over two million packages of open-source JavaScript code.

## Installation

Get the desired version for your platform, using `nvm` with `npm` at https://nodejs.org/en/download and follow the instructions.

## Initialization

- `npm init`: If you're working on a fresh project, to use npm you need a package.json file. This file acts as the "manifest" for your project, listing your metadata and dependencies.

- `npm ci`: If you're working on an imported/existing project, you need to sync/install locally the required libraries listed in an existing `package.json`.


## Package Management

- `npm install <package_name>`: Downloads a package and adds it to your project.
- `npm update`: Updates packages to the latest version allowed by your version ranges.
- `npm uninstall <package>`: Removes a package from your project and the package.json.

When you install a package, two major things happen in your project folder:

- The actual code for your downloaded packages lives in the `node_modules` folder.

::: warning
Never manually edit files in this folder. Also, add node_modules to your .gitignore file; you don't want to upload thousands of third-party files to GitHub!
:::


- The `package.json` file gets automatically generated. It records the exact version of every installed package to ensure that if someone else downloads your project, they get the exact same setup you have.

## Lifecycle

When you type `npm run <name>`, npm looks into your `package.json` under the "scripts" key and executes the string associated with that name.

- `npm run lint`: Analyze the code for syntax errors, style violations and best practice warnings

::: tip
You can fix basic formatting issues automatically by running `npm run lint -- --fix` instead.
:::

- `npm run dev`: Live preview your code
- `npm run build`: Turn your code into a high-performance bundle (for production)
