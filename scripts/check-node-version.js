#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const REQUIRED_NODE_VERSION = "22.12.0";
const MIN_NODE_MAJOR = 22;

function getCurrentNodeVersion() {
  return process.version.replace("v", "");
}

function getMajorVersion(version) {
  return parseInt(version.split(".")[0]);
}

function compareVersions(version1, version2) {
  const v1parts = version1.split(".").map(Number);
  const v2parts = version2.split(".").map(Number);

  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;

    if (v1part < v2part) return -1;
    if (v1part > v2part) return 1;
  }
  return 0;
}

function checkNodeVersion() {
  const currentVersion = getCurrentNodeVersion();
  const currentMajor = getMajorVersion(currentVersion);

  console.log(`🔍 Current Node.js version: v${currentVersion}`);
  console.log(`✅ Required Node.js version: v${REQUIRED_NODE_VERSION}+`);

  if (currentMajor < MIN_NODE_MAJOR) {
    console.error(`❌ UNSUPPORTED NODE.JS VERSION`);
    console.error(`   Current: v${currentVersion}`);
    console.error(`   Required: v${REQUIRED_NODE_VERSION} or higher`);
    console.error(``);
    console.error(`🚀 UPGRADE INSTRUCTIONS:`);
    console.error(`   1. Install Node.js 22: https://nodejs.org/`);
    console.error(`   2. Or use nvm: nvm install 22 && nvm use 22`);
    console.error(`   3. Or use volta: volta install node@22`);
    console.error(``);
    process.exit(1);
  }

  if (compareVersions(currentVersion, REQUIRED_NODE_VERSION) < 0) {
    console.warn(`⚠️  Node.js version is older than recommended`);
    console.warn(`   Current: v${currentVersion}`);
    console.warn(`   Recommended: v${REQUIRED_NODE_VERSION}+`);
    console.warn(`   Continuing anyway...`);
  } else {
    console.log(`✅ Node.js version requirement satisfied!`);
  }
}

function checkPackageManagers() {
  console.log(`\n📦 Checking package managers...`);

  try {
    const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
    console.log(`   npm: v${npmVersion}`);
  } catch (error) {
    console.warn(`   npm: not available`);
  }

  try {
    const pnpmVersion = execSync("pnpm --version", { encoding: "utf8" }).trim();
    console.log(`   pnpm: v${pnpmVersion} ✅`);
  } catch (error) {
    console.warn(`   pnpm: not available - install with: npm install -g pnpm`);
  }

  try {
    const yarnVersion = execSync("yarn --version", { encoding: "utf8" }).trim();
    console.log(`   yarn: v${yarnVersion}`);
  } catch (error) {
    console.log(`   yarn: not available`);
  }
}

function main() {
  console.log(`🚀 PROFILER - Node.js Environment Check`);
  console.log(`=====================================`);

  checkNodeVersion();
  checkPackageManagers();

  console.log(`\n✅ Environment check completed!`);
}

if (require.main === module) {
  main();
}

module.exports = { checkNodeVersion, getCurrentNodeVersion };
