#!/bin/bash

# 버전 정보 추출
VERSION=$(grep '"version"' package.json | sed -E 's/.*"version": "(.*)".*/\1/')
echo "Building version $VERSION..."

# 빌드 디렉토리 생성
BUILD_DIR="./package"
mkdir -p $BUILD_DIR

# 필요한 모듈 설치
echo "Installing dependencies..."
yarn install

# Wine 설치 확인 및 설치
check_wine() {
    if ! command -v wine &> /dev/null; then
        echo "Wine is not installed. Please install wine using the following commands:"
        echo "sudo dpkg --add-architecture i386"
        echo "sudo apt update"
        echo "sudo apt install -y wine64 wine32"
        exit 1
    fi
}

# Android Studio 환경 체크 함수
check_android_env() {
    if [ ! -d "$ANDROID_HOME" ]; then
        echo "Error: ANDROID_HOME environment variable is not set"
        echo "Please install Android Studio and set ANDROID_HOME in your environment"
        echo "Example: export ANDROID_HOME=$HOME/Android/Sdk"
        exit 1
    fi

    if [ ! -d "$ANDROID_HOME/platform-tools" ]; then
        echo "Error: Android SDK platform-tools not found"
        echo "Please install platform-tools using Android Studio SDK Manager"
        exit 1
    fi

    if [ ! -d "$ANDROID_HOME/build-tools" ]; then
        echo "Error: Android SDK build-tools not found"
        echo "Please install build-tools using Android Studio SDK Manager"
        exit 1
    fi
}

# Linux 버드 함수
build_linux() {
    echo "Building Linux version..."
    quasar build -m electron -T linux
    if [ $? -eq 0 ]; then
        echo "Linux build completed successfully"
        mv dist/electron/Packaged/*.AppImage "$BUILD_DIR/QCalc-$VERSION-linux.AppImage"
    else
        echo "Linux build failed"
        exit 1
    fi
}

# Windows 빌드 함수
build_windows() {
    echo "Building Windows version..."
    check_wine
    export WINEARCH=win64
    export WINEPREFIX=~/.wine64

    quasar build -m electron -T win32
    if [ $? -eq 0 ]; then
        echo "Windows build completed successfully"
        mv dist/electron/Packaged/*.exe "$BUILD_DIR/QCalc-$VERSION-win32.exe"
    else
        echo "Windows build failed"
        exit 1
    fi
}

# Android 빌드 함수
build_android() {
    echo "Building Android version..."
    check_android_env

    quasar build -m capacitor -T android
    if [ $? -eq 0 ]; then
        echo "Android build completed successfully"
        
        KEYSTORE_PATH="src-capacitor/android/app/my-release-key.jks"
        if [ ! -f "$KEYSTORE_PATH" ]; then
            echo "Warning: Keystore file not found at $KEYSTORE_PATH"
            echo "Android app will be unsigned"
        else
            echo "Building signed APK..."
            cd src-capacitor/android
            ./gradlew assembleRelease
            cd ../..
            cp src-capacitor/android/app/build/outputs/apk/release/app-release.apk "$BUILD_DIR/QCalc-$VERSION-android.apk"
        fi
    else
        echo "Android build failed"
        exit 1
    fi
}

# 인수 처리
BUILD_TYPE=${1:-all}  # 인수가 없으면 'all'을 기본값으로 사용

case $BUILD_TYPE in
    "all")
        build_linux
        build_windows
        build_android
        ;;
    "linux")
        build_linux
        ;;
    "win")
        build_windows
        ;;
    "android")
        build_android
        ;;
    *)
        echo "Invalid build type. Available options: all, linux, win, android"
        exit 1
        ;;
esac

echo "Build completed!"
echo "You can find the build files in the $BUILD_DIR directory"