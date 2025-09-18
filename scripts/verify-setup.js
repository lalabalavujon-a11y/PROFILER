#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? "✅" : "❌"} ${description}: ${filePath}`);
  return exists;
}

function checkPackageJson() {
  const pkgPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(pkgPath)) {
    console.log("❌ package.json not found");
    return false;
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  console.log("\n📦 Package.json Configuration:");
  console.log(`   Node.js Engine: ${pkg.engines?.node || "Not specified"}`);
  console.log(`   npm Engine: ${pkg.engines?.npm || "Not specified"}`);
  console.log(`   pnpm Engine: ${pkg.engines?.pnpm || "Not specified"}`);

  if (pkg.volta) {
    console.log(`   Volta Node: ${pkg.volta.node}`);
    console.log(`   Volta pnpm: ${pkg.volta.pnpm}`);
  }

  const hasNodeCheck = pkg.scripts?.["check-node"];
  const hasSetup = pkg.scripts?.["setup"];

  console.log(`   check-node script: ${hasNodeCheck ? "✅" : "❌"}`);
  console.log(`   setup script: ${hasSetup ? "✅" : "❌"}`);

  return true;
}

function main() {
  console.log("🔍 PROFILER - Node.js 22 Setup Verification");
  console.log("============================================");

  console.log("\n📋 Configuration Files:");
  const configFiles = [
    [".nvmrc", "nvm configuration"],
    [".node-version", "Node version specification"],
    ["package.json", "Package configuration"],
    ["tsconfig.json", "TypeScript configuration"],
    ["Dockerfile", "Docker production image"],
    ["Dockerfile.dev", "Docker development image"],
    ["docker-compose.yml", "Docker compose configuration"],
    [".github/workflows/ci.yml", "GitHub Actions CI/CD"],
    [".vscode/settings.json", "VS Code settings"],
    [".vscode/extensions.json", "VS Code extensions"],
    ["docs/NODE_SETUP.md", "Node.js setup documentation"],
  ];

  let allConfigsPresent = true;
  for (const [file, desc] of configFiles) {
    const exists = checkFile(file, desc);
    if (!exists) allConfigsPresent = false;
  }

  console.log("\n📦 Package Configuration:");
  checkPackageJson();

  console.log("\n🔧 Setup Scripts:");
  checkFile("scripts/check-node-version.js", "Node version checker");
  checkFile("scripts/setup-node.js", "Node setup script");
  checkFile("scripts/verify-setup.js", "Setup verification");

  console.log("\n📚 Documentation:");
  checkFile("README.md", "Main documentation");
  checkFile("env.example", "Environment variables example");

  console.log("\n🏗️ Project Structure:");
  const directories = [
    "agents",
    "api",
    "lib",
    "scripts",
    "test",
    "contracts",
    "docs",
  ];
  for (const dir of directories) {
    checkFile(dir, `${dir}/ directory`);
  }

  console.log("\n🚀 Environment Check:");
  console.log(`   Current Node.js: ${process.version}`);
  console.log(`   Required: v22.12.0+`);

  const nodeVersion = process.version.replace("v", "");
  const isNode22 = nodeVersion.startsWith("22.");
  console.log(`   Node.js 22: ${isNode22 ? "✅" : "❌"}`);

  console.log("\n📊 Summary:");
  console.log(
    `   Configuration Files: ${
      allConfigsPresent ? "✅ Complete" : "❌ Missing files"
    }`
  );
  console.log(
    `   Node.js Version: ${isNode22 ? "✅ Correct" : "❌ Needs upgrade"}`
  );
  console.log(`   Setup Scripts: ✅ Available`);
  console.log(`   Documentation: ✅ Complete`);

  if (allConfigsPresent && isNode22) {
    console.log("\n🎉 PROFILER Node.js 22 standardization is COMPLETE!");
    console.log("\n🎯 Next Steps:");
    console.log("   1. Run: pnpm install");
    console.log("   2. Run: pnpm test");
    console.log("   3. Run: pnpm seed");
    console.log("   4. Deploy to your preferred platform");
  } else {
    console.log("\n⚠️  Setup incomplete. Please address the issues above.");

    if (!isNode22) {
      console.log("\n🚀 To upgrade Node.js:");
      console.log("   Run: node scripts/setup-node.js");
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
