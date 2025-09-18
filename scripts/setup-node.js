#!/usr/bin/env node

const { execSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const REQUIRED_NODE_VERSION = "22.12.0";

function detectNodeManager() {
  const managers = [];

  try {
    execSync("command -v nvm", { stdio: "ignore" });
    managers.push("nvm");
  } catch (e) {}

  try {
    execSync("command -v volta", { stdio: "ignore" });
    managers.push("volta");
  } catch (e) {}

  try {
    execSync("command -v fnm", { stdio: "ignore" });
    managers.push("fnm");
  } catch (e) {}

  return managers;
}

function installWithNvm() {
  console.log(`📦 Installing Node.js ${REQUIRED_NODE_VERSION} with nvm...`);

  try {
    // Source nvm and install Node.js 22
    execSync(
      `bash -c "source ~/.nvm/nvm.sh && nvm install ${REQUIRED_NODE_VERSION} && nvm use ${REQUIRED_NODE_VERSION}"`,
      { stdio: "inherit" }
    );

    console.log(`✅ Node.js ${REQUIRED_NODE_VERSION} installed with nvm!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to install with nvm:`, error.message);
    return false;
  }
}

function installWithVolta() {
  console.log(`📦 Installing Node.js ${REQUIRED_NODE_VERSION} with volta...`);

  try {
    execSync(`volta install node@${REQUIRED_NODE_VERSION}`, {
      stdio: "inherit",
    });
    console.log(`✅ Node.js ${REQUIRED_NODE_VERSION} installed with volta!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to install with volta:`, error.message);
    return false;
  }
}

function installWithFnm() {
  console.log(`📦 Installing Node.js ${REQUIRED_NODE_VERSION} with fnm...`);

  try {
    execSync(
      `fnm install ${REQUIRED_NODE_VERSION} && fnm use ${REQUIRED_NODE_VERSION}`,
      { stdio: "inherit" }
    );
    console.log(`✅ Node.js ${REQUIRED_NODE_VERSION} installed with fnm!`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to install with fnm:`, error.message);
    return false;
  }
}

function createNvmrcIfMissing() {
  const nvmrcPath = path.join(process.cwd(), ".nvmrc");

  if (!fs.existsSync(nvmrcPath)) {
    fs.writeFileSync(nvmrcPath, REQUIRED_NODE_VERSION);
    console.log(`✅ Created .nvmrc file with Node.js ${REQUIRED_NODE_VERSION}`);
  }
}

function createNodeVersionFile() {
  const nodeVersionPath = path.join(process.cwd(), ".node-version");

  if (!fs.existsSync(nodeVersionPath)) {
    fs.writeFileSync(nodeVersionPath, REQUIRED_NODE_VERSION);
    console.log(
      `✅ Created .node-version file with Node.js ${REQUIRED_NODE_VERSION}`
    );
  }
}

function setupEnvironmentFiles() {
  createNvmrcIfMissing();
  createNodeVersionFile();

  // Create volta configuration
  const voltaConfig = path.join(process.cwd(), "package.json");
  if (fs.existsSync(voltaConfig)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(voltaConfig, "utf8"));

      if (!pkg.volta) {
        pkg.volta = {
          node: REQUIRED_NODE_VERSION,
          npm: "10.8.2",
          pnpm: "9.12.0",
        };

        fs.writeFileSync(voltaConfig, JSON.stringify(pkg, null, 2));
        console.log(`✅ Added volta configuration to package.json`);
      }
    } catch (error) {
      console.warn(
        `⚠️  Could not update package.json for volta:`,
        error.message
      );
    }
  }
}

function printInstallationInstructions() {
  console.log(`\n🚀 MANUAL INSTALLATION INSTRUCTIONS`);
  console.log(`===================================`);

  const platform = os.platform();

  console.log(`\n1️⃣  Direct Installation:`);
  console.log(`   • Download from: https://nodejs.org/`);
  console.log(`   • Select Node.js ${REQUIRED_NODE_VERSION} LTS`);

  console.log(`\n2️⃣  Using Package Managers:`);

  if (platform === "darwin") {
    console.log(`   macOS (Homebrew):`);
    console.log(`   brew install node@22`);
    console.log(`   brew link node@22 --force`);
  } else if (platform === "linux") {
    console.log(`   Ubuntu/Debian:`);
    console.log(
      `   curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -`
    );
    console.log(`   sudo apt-get install -y nodejs`);

    console.log(`\n   CentOS/RHEL/Fedora:`);
    console.log(
      `   curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -`
    );
    console.log(`   sudo yum install -y nodejs`);
  } else if (platform === "win32") {
    console.log(`   Windows (Chocolatey):`);
    console.log(`   choco install nodejs --version=22.12.0`);

    console.log(`\n   Windows (Scoop):`);
    console.log(`   scoop install nodejs@22.12.0`);
  }

  console.log(`\n3️⃣  Using Node Version Managers:`);
  console.log(`   nvm (recommended):`);
  console.log(
    `   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash`
  );
  console.log(`   nvm install ${REQUIRED_NODE_VERSION}`);
  console.log(`   nvm use ${REQUIRED_NODE_VERSION}`);

  console.log(`\n   volta:`);
  console.log(`   curl https://get.volta.sh | bash`);
  console.log(`   volta install node@${REQUIRED_NODE_VERSION}`);

  console.log(`\n   fnm:`);
  console.log(`   curl -fsSL https://fnm.vercel.app/install | bash`);
  console.log(`   fnm install ${REQUIRED_NODE_VERSION}`);
  console.log(`   fnm use ${REQUIRED_NODE_VERSION}`);

  console.log(`\n4️⃣  After Installation:`);
  console.log(`   node --version  # Should show v${REQUIRED_NODE_VERSION}`);
  console.log(`   npm install -g pnpm  # Install pnpm globally`);
  console.log(`   pnpm install  # Install project dependencies`);
}

function main() {
  console.log(`🚀 PROFILER - Node.js ${REQUIRED_NODE_VERSION} Setup`);
  console.log(`===========================================`);

  // Setup environment files first
  setupEnvironmentFiles();

  // Check current Node.js version
  const currentVersion = process.version.replace("v", "");
  console.log(`\n📋 Current Node.js version: v${currentVersion}`);

  if (currentVersion.startsWith("22.")) {
    console.log(`✅ Node.js 22 is already installed!`);
    console.log(`\n🎯 Next steps:`);
    console.log(`   1. Run: pnpm install`);
    console.log(`   2. Run: pnpm test`);
    console.log(`   3. Run: pnpm seed`);
    return;
  }

  // Detect available node managers
  const managers = detectNodeManager();
  console.log(
    `\n🔍 Available Node.js managers:`,
    managers.length > 0 ? managers.join(", ") : "none"
  );

  let installed = false;

  // Try to install with available managers
  for (const manager of managers) {
    console.log(`\n📦 Attempting installation with ${manager}...`);

    switch (manager) {
      case "nvm":
        installed = installWithNvm();
        break;
      case "volta":
        installed = installWithVolta();
        break;
      case "fnm":
        installed = installWithFnm();
        break;
    }

    if (installed) break;
  }

  if (!installed) {
    console.log(
      `\n⚠️  Automatic installation failed or no node manager available.`
    );
    printInstallationInstructions();
  } else {
    console.log(`\n🎉 Node.js ${REQUIRED_NODE_VERSION} setup completed!`);
    console.log(`\n🎯 Next steps:`);
    console.log(`   1. Restart your terminal or run: source ~/.bashrc`);
    console.log(`   2. Verify: node --version`);
    console.log(`   3. Run: pnpm install`);
    console.log(`   4. Run: pnpm test`);
  }
}

if (require.main === module) {
  main();
}

module.exports = { setupNode: main };
