#!/bin/bash

# Coolify Nixpacks Deploy the repair script
# Used to solve common deployment issues

echo "🚀 Start fixing Coolify Nixpacks deployment issues..."

# 1. Check required files
echo "📋 Check required files..."

if [ ! -f "nixpacks.toml" ]; then
    echo "❌ Missing nixpacks.toml file"
    echo "✅ Creating nixpacks.toml file..."
    cat > nixpacks.toml << 'EOF'
[variables]
NIXPACKS_NODE_VERSION = "20"
NIXPACKS_PNPM_VERSION = "9"

[phases.setup]
nixPkgs = ["nodejs_20", "pnpm"]

[phases.install]
cmds = ["pnpm install --frozen-lockfile"]

[phases.build]
cmds = ["SKIP_ENV_VALIDATION=true pnpm run build"]

[start]
cmd = "pnpm start"
EOF
else
    echo "✅ nixpacks.toml file exists"
fi

# 2. Check package.json build scripts
echo "📋 Check package.json build scripts..."

if ! grep -q '"build:docker"' package.json; then
    echo "⚠️  Missing build:docker script, adding..."
    # This needs to be added manually because JSON editing is more complicated
    echo "Please manually add the following to the scripts section of package.json:"
    echo '"build:docker": "SKIP_ENV_VALIDATION=true next build",'
else
    echo "✅ build:docker script exists"
fi

# 3. Check environment variable template
echo "📋 Check environment variable template..."

if [ ! -f ".env.example" ]; then
    echo "❌ Missing .env.example file"
else
    echo "✅ .env.example file exists"
fi

# 4. Check build cache
echo "🧹 Check build cache..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf dist

# 5. Check dependencies
echo "📦 Check dependencies..."
if command -v pnpm &> /dev/null; then
    echo "✅ pnpm is installed"
    pnpm install --frozen-lockfile
else
    echo "❌ pnpm is not installed, please install pnpm first"
    exit 1
fi

# 6. Check build
echo "🔨 Check build..."
SKIP_ENV_VALIDATION=true pnpm run build

if [ $? -eq 0 ]; then
    echo "✅ Build succeeded"
else
    echo "❌ Build failed, please check the error messages"
    exit 1
fi

echo ""
echo "🎉 Fix completed!"
echo ""
echo "📝 Next steps in Coolify:"
echo "1. Make sure to select 'nixpacks' as the build package"
echo "2. Add all required environment variables"
echo "3. Redeploy the project"
echo ""
echo "🔗 Detailed deployment guide: docs/COOLIFY_DEPLOYMENT.md"