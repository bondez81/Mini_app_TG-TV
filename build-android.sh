#!/bin/bash
# Build TeleTV Player APK
# Run this script from the project root

set -e

echo "🔨 Building TeleTV Player APK..."

# Check dependencies
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v gradle &> /dev/null; then
    echo "❌ Gradle is not installed"
    echo "   Install: brew install gradle (macOS) or apt install gradle (Linux)"
    exit 1
fi

if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "❌ ANDROID_HOME or ANDROID_SDK_ROOT is not set"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build web app
echo "🌐 Building web app..."
npm run build

# Copy web assets to Android
echo "📂 Copying web assets to Android..."
mkdir -p android/app/src/main/assets
cp -r dist/* android/app/src/main/assets/

# Build APK
echo "🔧 Building APK..."
cd android
gradle assembleDebug

echo "✅ Build complete!"
echo "📱 APK location: android/app/build/outputs/apk/debug/app-debug.apk"
