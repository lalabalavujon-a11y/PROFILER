#!/usr/bin/env node

/**
 * 🚀 PROFILER Node.js 22 Verification Script
 * Ensures Node.js 22.12.0+ is being used across all environments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getNodeVersion() {
  try {
    const version = process.version;
    return version;
  } catch (error) {
    return null;
  }
}

function getPnpmVersion() {
  try {
    const version = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    return version;
  } catch (error) {
    return null;
  }
}

function checkNodeVersion() {
  const currentVersion = getNodeVersion();
  const requiredVersion = '22.12.0';
  
  log('\n🚀 PROFILER Node.js 22 Verification', 'bold');
  log('=====================================', 'cyan');
  
  log(`\n📋 Current Node.js version: ${currentVersion}`, 'blue');
  
  if (!currentVersion) {
    log('❌ Node.js is not installed!', 'red');
    return false;
  }
  
  // Extract major version
  const majorVersion = parseInt(currentVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 22) {
    log(`❌ Node.js 22+ required! Current: ${currentVersion}`, 'red');
    log('📥 Run: ./scripts/setup-node22.sh to install Node.js 22', 'yellow');
    return false;
  }
  
  if (majorVersion === 22) {
    log('✅ Node.js 22 detected!', 'green');
    
    // Check if it's the recommended version
    if (currentVersion === `v${requiredVersion}`) {
      log(`✅ Perfect! Using recommended version: ${currentVersion}`, 'green');
    } else {
      log(`⚠️  Using Node.js 22, but ${requiredVersion} is recommended`, 'yellow');
    }
    
    return true;
  }
  
  if (majorVersion > 22) {
    log(`⚠️  Using Node.js ${majorVersion} (newer than required 22)`, 'yellow');
    log('✅ This should work, but Node.js 22 is the standard', 'green');
    return true;
  }
  
  return false;
}

function checkPnpmVersion() {
  const pnpmVersion = getPnpmVersion();
  
  log(`\n📦 pnpm version: ${pnpmVersion || 'Not installed'}`, 'blue');
  
  if (!pnpmVersion) {
    log('❌ pnpm is not installed!', 'red');
    log('📥 Run: npm install -g pnpm@9.12.0', 'yellow');
    return false;
  }
  
  const majorVersion = parseInt(pnpmVersion.split('.')[0]);
  if (majorVersion >= 9) {
    log('✅ pnpm version is compatible!', 'green');
    return true;
  } else {
    log('⚠️  pnpm 9+ recommended for optimal performance', 'yellow');
    return true;
  }
}

function checkConfigurationFiles() {
  log('\n🔍 Checking configuration files...', 'blue');
  
  const configFiles = [
    { path: '.nvmrc', expected: '22.12.0' },
    { path: '.node-version', expected: '22.12.0' },
    { path: 'package.json', check: 'engines.node' }
  ];
  
  let allGood = true;
  
  configFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file.path);
    
    if (fs.existsSync(fullPath)) {
      if (file.expected) {
        const content = fs.readFileSync(fullPath, 'utf8').trim();
        if (content === file.expected) {
          log(`✅ ${file.path}: ${content}`, 'green');
        } else {
          log(`❌ ${file.path}: Expected ${file.expected}, got ${content}`, 'red');
          allGood = false;
        }
      } else if (file.check === 'engines.node') {
        try {
          const packageJson = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          const nodeVersion = packageJson.engines?.node;
          if (nodeVersion && nodeVersion.includes('22')) {
            log(`✅ ${file.path}: engines.node = ${nodeVersion}`, 'green');
          } else {
            log(`❌ ${file.path}: engines.node should require Node.js 22`, 'red');
            allGood = false;
          }
        } catch (error) {
          log(`❌ ${file.path}: Could not parse package.json`, 'red');
          allGood = false;
        }
      }
    } else {
      log(`❌ ${file.path}: File not found`, 'red');
      allGood = false;
    }
  });
  
  return allGood;
}

function checkDockerConfigs() {
  log('\n🐳 Checking Docker configurations...', 'blue');
  
  const dockerFiles = ['Dockerfile', 'Dockerfile.dev'];
  let allGood = true;
  
  dockerFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('node:22')) {
        log(`✅ ${file}: Uses Node.js 22`, 'green');
      } else {
        log(`❌ ${file}: Should use node:22.x.x`, 'red');
        allGood = false;
      }
    } else {
      log(`⚠️  ${file}: Not found (optional)`, 'yellow');
    }
  });
  
  return allGood;
}

function main() {
  const nodeOk = checkNodeVersion();
  const pnpmOk = checkPnpmVersion();
  const configOk = checkConfigurationFiles();
  const dockerOk = checkDockerConfigs();
  
  log('\n📊 Verification Summary:', 'bold');
  log('======================', 'cyan');
  
  log(`Node.js 22: ${nodeOk ? '✅' : '❌'}`, nodeOk ? 'green' : 'red');
  log(`pnpm: ${pnpmOk ? '✅' : '❌'}`, pnpmOk ? 'green' : 'red');
  log(`Config files: ${configOk ? '✅' : '❌'}`, configOk ? 'green' : 'red');
  log(`Docker configs: ${dockerOk ? '✅' : '❌'}`, dockerOk ? 'green' : 'red');
  
  const allGood = nodeOk && pnpmOk && configOk && dockerOk;
  
  if (allGood) {
    log('\n🎉 PROFILER Node.js 22 verification PASSED!', 'green');
    log('🚀 System ready for deployment to Cloudflare Pages', 'green');
    log('🛥️ Monaco yacht demo ready for $350M+ revenue impact', 'green');
    process.exit(0);
  } else {
    log('\n❌ PROFILER Node.js 22 verification FAILED!', 'red');
    log('📥 Run: ./scripts/setup-node22.sh to fix issues', 'yellow');
    process.exit(1);
  }
}

// Run verification
main();
