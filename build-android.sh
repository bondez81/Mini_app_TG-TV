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

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build web app
echo "🌐 Building web app..."
npm run build

# Check if Android platform exists
if [ ! -d "android" ]; then
    echo "📱 Adding Android platform..."
    npx cap add android
fi

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

# Build APK
echo "🔧 Building APK..."
cd android

# Make gradlew executable
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug --no-daemon

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
