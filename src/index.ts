#!/usr/bin/env ts-node

import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import commandExists from 'command-exists'


function handleExit (signal: string) {
  console.log(`\nProcess closed by ${signal}. Exiting...`);
  process.exit();
}

process.on('SIGINT', () => handleExit('SIGINT'));
process.on('SIGTERM', () => handleExit('SIGTERM'));

async function main () {
  try {
    // Dynamically import inquirer to handle ESM
    const inquirer = await import('inquirer');

    // Prompt user to confirm using pnpm
    const { proceed } = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'This package uses pnpm to create the project, proceed?',
        default: true,
      },
    ]);

    if (!proceed) {
      console.log('Process aborted by user.');
      return;
    }

    // Check if pnpm is installed
    const isPnpmInstalled = await commandExists('pnpm').then(() => true).catch(() => false)

    if (!isPnpmInstalled) {
      console.log('pnpm is not installed.');
      const { installPnpm } = await inquirer.default.prompt([
        {
          type: 'confirm',
          name: 'installPnpm',
          message: 'pnpm is not installed. Would you like to install it globally using npm?',
          default: true,
        },
      ]);

      if (!installPnpm) {
        console.log('Process aborted by user.');
        return;
      }

      // Install pnpm globally
      execSync('npm install -g pnpm', { stdio: 'inherit' });
      console.log('pnpm installed successfully. From now on in all future projects always use pnpm instead of npm and pnpx instead of npx');
    }

    // Prompt for the project name
    const { projectNameInput } = await inquirer.default.prompt([
      {
        type: 'input',
        name: 'projectNameInput',
        message: 'Enter your project name (leave blank to use current folder):',
      },
    ]);

    // Use current folder if project name is empty
    const projectName = projectNameInput.trim() || path.basename(process.cwd());

    // Step 1: Create Vite project with React and TypeScript template using pnpm
    execSync(`pnpx create-vite@latest ${projectName} --template react-ts`, { stdio: 'inherit' });
    console.log('Auto running tailwind install script , do not press anything');

    // Navigate into the newly created Vite project
    process.chdir(projectName);





    // Step 2: Install Tailwind CSS and its dependencies using pnpm
    execSync('pnpm install -D tailwindcss postcss autoprefixer @types/node', { stdio: 'inherit' });
    execSync('pnpx tailwindcss init -p', { stdio: 'inherit' });

    // Step 3: Update tailwind.config.js
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
    fs.writeFileSync(path.join(process.cwd(), 'tailwind.config.js'), tailwindConfig);

    // Step 4: Update CSS file
    const cssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;
    `;
    fs.writeFileSync(path.join(process.cwd(), 'src/index.css'), cssContent);

    console.log('Vite project setup with React, TypeScript, and Tailwind CSS is complete.');
    const { uiLibSet } = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'uiLibSet',
        message: 'set ui library ShadCN/NextUI Y/N',
      },
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
      }`
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
      `
    if (uiLibSet) {
      const { uiLibType } = await inquirer.default.prompt([
        {
          type: 'input',
          name: 'uiLibType',
          message: 'set \n1 ShadCN \n2 NextUI \n1/2: ',
        },
      ]);

      console.log('your selection is:' + uiLibType.trim(), typeof uiLibType.trim())
      if (uiLibType.trim() == 1) {
        console.log('\n****Installing ShadCN****\n');
        fs.writeFileSync(path.join(process.cwd(), 'tsconfig.json'), tsConfigTemplate);
        fs.writeFileSync(path.join(process.cwd(), 'vite.config.ts'), viteConfigTemplate);
        console.log('\nremember to use default settings \ntypescript:yes, \nreact server components:no, \ncomponents.json:yes, \nglobal css location: src/index.css\n')
        execSync('pnpx shadcn-ui@latest init', { stdio: 'inherit' });
        console.log('\nshadcn installed sucessfully, use \npnpx shadcn-ui@latest add button\nreplace button with your componet choice and use it anywhere ')
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
