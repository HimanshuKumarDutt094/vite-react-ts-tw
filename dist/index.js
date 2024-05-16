#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_child_process = require("child_process");
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var import_command_exists = __toESM(require("command-exists"));
function handleExit(signal) {
  console.log(`
Process closed by ${signal}. Exiting...`);
  process.exit();
}
process.on("SIGINT", () => handleExit("SIGINT"));
process.on("SIGTERM", () => handleExit("SIGTERM"));
function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currentPath = path.join(folderPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        deleteFolderRecursive(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}
function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`${filePath} deleted successfully.`);
  } else {
    console.log(`${filePath} does not exist.`);
  }
}
var assetsPath = path.join(process.cwd(), "src", "assets");
deleteFolderRecursive(assetsPath);
async function main() {
  try {
    const inquirer = await import("inquirer");
    const { proceed } = await inquirer.default.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: "This package uses pnpm to create the project, proceed?",
        default: true
      }
    ]);
    if (!proceed) {
      console.log("Process aborted by user.");
      return;
    }
    const isPnpmInstalled = await (0, import_command_exists.default)("pnpm").then(() => true).catch(() => false);
    if (!isPnpmInstalled) {
      console.log("pnpm is not installed.");
      const { installPnpm } = await inquirer.default.prompt([
        {
          type: "confirm",
          name: "installPnpm",
          message: "pnpm is not installed. Would you like to install it globally using npm?",
          default: true
        }
      ]);
      if (!installPnpm) {
        console.log("Process aborted by user.");
        return;
      }
      (0, import_child_process.execSync)("npm install -g pnpm", { stdio: "inherit" });
      console.log("pnpm installed successfully. From now on in all future projects always use pnpm instead of npm and pnpx instead of npx");
    }
    const { projectNameInput } = await inquirer.default.prompt([
      {
        type: "input",
        name: "projectNameInput",
        message: "Enter your project name (leave blank to use current folder):"
      }
    ]);
    const projectName = projectNameInput.trim() || path.basename(process.cwd());
    (0, import_child_process.execSync)(`pnpx create-vite@latest ${projectName} --template react-ts`, { stdio: "inherit" });
    console.log("Auto running tailwind install script , do not press anything");
    process.chdir(projectName);
    (0, import_child_process.execSync)("pnpm install -D tailwindcss postcss autoprefixer @types/node", { stdio: "inherit" });
    (0, import_child_process.execSync)("pnpx tailwindcss init -p", { stdio: "inherit" });
    const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src//*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
    `;
    fs.writeFileSync(path.join(process.cwd(), "tailwind.config.js"), tailwindConfig);
    const cssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;
    `;
    fs.writeFileSync(path.join(process.cwd(), "src/index.css"), cssContent);
    deleteFile("./src/App.css");
    deleteFolderRecursive("./src/assets");
    const appTsxContent = `
    const App = () => {
      return (
        <>
          <div className="text-4xl flex shadow-lg rounded-md ">
            React + Vite +Tailwind
          </div>
        </>
      );
    };
    export default App;
    
    `;
    fs.writeFileSync(path.join(process.cwd(), "src", "App.tsx"), appTsxContent);
    console.log("Vite project setup with React, TypeScript, and Tailwind CSS is complete.");
    const { uiLibSet } = await inquirer.default.prompt([
      {
        type: "confirm",
        name: "uiLibSet",
        message: "set ui library ShadCN/NextUI Y/N"
      }
    ]);
    const tsConfigTemplate = `{
        "compilerOptions": {
          "target": "ES2020",
          "useDefineForClassFields": true,
          "lib": [
            "ES2020",
            "DOM",
            "DOM.Iterable"
          ],
          "module": "ESNext",
          "skipLibCheck": true,
          "baseUrl": ".",
          "paths": {
            "@/*": [
              "./src/*"
            ]
          },
          /* Bundler mode */
          "moduleResolution": "bundler",
          "allowImportingTsExtensions": true,
          "resolveJsonModule": true,
          "isolatedModules": true,
          "noEmit": true,
          "jsx": "react-jsx",
          /* Linting */
          "strict": true,
          "noUnusedLocals": true,
          "noUnusedParameters": true,
          "noFallthroughCasesInSwitch": true
        },
        "include": [
          "src"
        ],
        "references": [
          {
            "path": "./tsconfig.node.json"
          }
        ]
      }`;
    const viteConfigTemplate = `import path from "path"
      import react from "@vitejs/plugin-react"
      import { defineConfig } from "vite"
      
      export default defineConfig({
        plugins: [react()],
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "./src"),
          },
        },
      })
      `;
    if (uiLibSet) {
      const { uiLibType } = await inquirer.default.prompt([
        {
          type: "input",
          name: "uiLibType",
          message: "set \n1 ShadCN \n2 NextUI \n1/2: "
        }
      ]);
      console.log("your selection is:" + uiLibType.trim(), typeof uiLibType.trim());
      if (uiLibType.trim() == 1) {
        console.log("\n****Installing ShadCN****\n");
        fs.writeFileSync(path.join(process.cwd(), "tsconfig.json"), tsConfigTemplate);
        fs.writeFileSync(path.join(process.cwd(), "vite.config.ts"), viteConfigTemplate);
        console.log("\nremember to use default settings \ntypescript:yes, \nreact server components:no, \ncomponents.json:yes, \nglobal css location: src/index.css\n");
        (0, import_child_process.execSync)("pnpx shadcn-ui@latest init", { stdio: "inherit" });
        console.log("\nshadcn installed sucessfully, use \npnpx shadcn-ui@latest add button\nreplace button with your componet choice and use it anywhere ");
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
main();
