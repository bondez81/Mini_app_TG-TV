#!/bin/bash
# Build TeleTV Player APK for Android TV
# Run this script from the project root

set -e

echo "🔨 Building TeleTV Player APK..."
echo ""

# Check dependencies
echo "📋 Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed. Please install JDK 17+"
    exit 1
fi

# Check Android SDK
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    echo "⚠️  ANDROID_HOME or ANDROID_SDK_ROOT not set"
    echo "   Please set ANDROID_HOME to your Android SDK path"
    echo "   Example: export ANDROID_HOME=/Users/yourname/Library/Android/sdk"
    exit 1
fi

ANDROID_SDK=${ANDROID_HOME:-$ANDROID_SDK_ROOT}
echo "✅ Android SDK found at: $ANDROID_SDK"

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build web app
echo "🌐 Building web app..."
npm run build

# Copy web assets to Android
echo "📂 Copying web assets to Android..."
mkdir -p android/app/src/main/assets
cp -r dist/* android/app/src/main/assets/
echo "✅ Web assets copied"

# Build APK
echo "🔧 Building APK..."
cd android

# Make gradlew executable
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug

# Check if APK was created
APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ APK built successfully!"
    echo "📍 Location: android/$APK_PATH"
    echo ""
    echo "📲 Install on Android TV:"
    echo "   adb install $APK_PATH"
    echo ""
    echo "📋 Or copy to USB and install on TV"
else
    echo "❌ APK build failed!"
    exit 1
fi
