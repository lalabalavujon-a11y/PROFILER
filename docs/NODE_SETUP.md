# Node.js 22 Standardization Guide

## 🎯 Overview

This project requires **Node.js 22.12.0** or higher across all environments. This document provides comprehensive setup instructions for developers, CI/CD, and deployment environments.

## 🚀 Quick Setup

### Automatic Setup

```bash
# Run the automated setup script
npm run setup

# Or check your current Node.js version
npm run check-node
```

### Manual Verification

```bash
node --version  # Should show v22.12.0 or higher
npm --version   # Should show v10.0.0 or higher
pnpm --version  # Should show v9.0.0 or higher
```

## 📋 Environment Requirements

| Environment | Node.js Version | npm Version | pnpm Version |
| ----------- | --------------- | ----------- | ------------ |
| Development | ≥22.12.0        | ≥10.0.0     | ≥9.0.0       |
| Testing     | ≥22.12.0        | ≥10.0.0     | ≥9.0.0       |
| Production  | ≥22.12.0        | ≥10.0.0     | ≥9.0.0       |
| Docker      | 22.12.0         | 10.8.2      | 9.12.0       |

## 🛠️ Installation Methods

### Method 1: Node Version Manager (Recommended)

#### nvm (macOS/Linux)

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.bashrc

# Install and use Node.js 22
nvm install 22.12.0
nvm use 22.12.0
nvm alias default 22.12.0

# Verify installation
node --version  # v22.12.0
```

#### volta (Cross-platform)

```bash
# Install volta
curl https://get.volta.sh | bash

# Install Node.js 22
volta install node@22.12.0

# Verify installation
node --version  # v22.12.0
```

#### fnm (Fast Node Manager)

```bash
# Install fnm
curl -fsSL https://fnm.vercel.app/install | bash

# Install and use Node.js 22
fnm install 22.12.0
fnm use 22.12.0
fnm default 22.12.0

# Verify installation
node --version  # v22.12.0
```

### Method 2: Direct Installation

#### macOS (Homebrew)

```bash
# Install Node.js 22
brew install node@22

# Link to make it default
brew link node@22 --force

# Verify installation
node --version  # v22.x.x
```

#### Ubuntu/Debian

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version  # v22.x.x
```

#### CentOS/RHEL/Fedora

```bash
# Add NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -

# Install Node.js
sudo yum install -y nodejs

# Verify installation
node --version  # v22.x.x
```

#### Windows (Chocolatey)

```powershell
# Install Node.js 22
choco install nodejs --version=22.12.0

# Verify installation
node --version  # v22.12.0
```

#### Windows (Scoop)

```powershell
# Install Node.js 22
scoop install nodejs@22.12.0

# Verify installation
node --version  # v22.12.0
```

### Method 3: Official Installer

1. Visit [nodejs.org](https://nodejs.org/)
2. Download Node.js 22.12.0 LTS
3. Run the installer
4. Verify installation: `node --version`

## 📦 Package Manager Setup

### Install pnpm (Recommended)

```bash
# Install pnpm globally
npm install -g pnpm@9.12.0

# Verify installation
pnpm --version  # 9.12.0
```

### Project Dependencies

```bash
# Install project dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## 🐳 Docker Setup

### Development Environment

```bash
# Build and run development container
docker-compose --profile dev up --build

# Access the container
docker-compose exec profiler-dev sh
```

### Production Environment

```bash
# Build and run production container
docker-compose up --build

# Check container health
docker-compose ps
```

### Custom Docker Build

```bash
# Build production image
docker build -t profiler:node22 .

# Run container
docker run -p 3000:3000 profiler:node22
```

## ⚙️ Configuration Files

The project includes several configuration files to ensure Node.js 22 consistency:

### `.nvmrc`

```
22.12.0
```

### `.node-version`

```
22.12.0
```

### `package.json` engines

```json
{
  "engines": {
    "node": ">=22.12.0",
    "npm": ">=10.0.0",
    "pnpm": ">=9.0.0"
  }
}
```

### `volta` configuration (in package.json)

```json
{
  "volta": {
    "node": "22.12.0",
    "npm": "10.8.2",
    "pnpm": "9.12.0"
  }
}
```

## 🔧 IDE Configuration

### VS Code

The project includes VS Code settings for Node.js 22:

- Automatic TypeScript version detection
- Integrated terminal with Node.js 22
- Recommended extensions for Node.js development

### WebStorm/IntelliJ

1. Go to Settings → Languages & Frameworks → Node.js
2. Set Node interpreter to Node.js 22.12.0 path
3. Enable Node.js core library

## 🚀 CI/CD Configuration

### GitHub Actions

The project includes a complete CI/CD pipeline that:

- Tests on Node.js 22.12.0 and 22.x
- Builds Docker images with Node.js 22
- Deploys with Node.js 22 runtime

### Other CI Platforms

#### GitLab CI

```yaml
image: node:22.12.0-alpine

before_script:
  - npm install -g pnpm@9.12.0
  - pnpm install
```

#### CircleCI

```yaml
version: 2.1
jobs:
  build:
    docker:
      - image: node:22.12.0
    steps:
      - run: npm install -g pnpm@9.12.0
      - run: pnpm install
```

## 🌐 Deployment Environments

### Cloudflare Workers

```toml
# wrangler.toml
compatibility_date = "2024-09-18"
node_compat = true

[env.production]
compatibility_flags = ["nodejs_compat"]
```

### Vercel

```json
{
  "functions": {
    "app/**/*.js": {
      "runtime": "nodejs22.x"
    }
  }
}
```

### AWS Lambda

```yaml
# serverless.yml
provider:
  runtime: nodejs22.x
```

### Heroku

```
# .nvmrc (Heroku reads this automatically)
22.12.0
```

## 🔍 Troubleshooting

### Common Issues

#### "Unsupported engine" warning

```bash
# Solution: Upgrade to Node.js 22
nvm install 22.12.0 && nvm use 22.12.0
```

#### TypeScript compilation errors

```bash
# Solution: Ensure TypeScript supports Node.js 22
pnpm add -D typescript@latest
```

#### Package compatibility issues

```bash
# Solution: Clear cache and reinstall
pnpm store prune
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Version Verification Script

```bash
# Run comprehensive environment check
node scripts/check-node-version.js
```

### Environment Reset

```bash
# Complete environment reset
rm -rf node_modules pnpm-lock.yaml
nvm use 22.12.0
pnpm install
```

## 📞 Support

If you encounter issues with Node.js 22 setup:

1. **Check the troubleshooting section above**
2. **Run the environment check**: `npm run check-node`
3. **Review the error logs** in the console
4. **Contact the development team** with:
   - Your operating system
   - Current Node.js version (`node --version`)
   - Error message and stack trace
   - Steps to reproduce the issue

## 🔄 Migration from Node.js 18

If you're upgrading from Node.js 18:

1. **Backup your current environment**
2. **Install Node.js 22** using one of the methods above
3. **Clear node_modules**: `rm -rf node_modules pnpm-lock.yaml`
4. **Reinstall dependencies**: `pnpm install`
5. **Run tests**: `pnpm test`
6. **Update deployment configurations** to use Node.js 22

## ✅ Verification Checklist

- [ ] Node.js version is 22.12.0 or higher
- [ ] pnpm is installed and working
- [ ] Project dependencies install without errors
- [ ] Tests pass successfully
- [ ] Application builds without errors
- [ ] Docker containers use Node.js 22
- [ ] CI/CD pipeline uses Node.js 22
- [ ] Deployment environment supports Node.js 22

---

**Note**: This standardization ensures consistent behavior across all development, testing, and production environments. Node.js 22 provides improved performance, security, and modern JavaScript features that benefit the Lead Recon system.
