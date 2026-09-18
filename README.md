# 📺 TeleTV Player

**Telegram Media Player для Android TV**

Нативное приложение для просмотра видео и прослушивания аудио из Telegram на Android TV. Работает через прямое подключение к Telegram MTProto — без серверов и посредников.

![Platform](https://img.shields.io/badge/Platform-Android%20TV-blue) ![Version](https://img.shields.io/badge/Version-1.1.0-green) ![License](https://img.shields.io/badge/License-GPL--3.0-purple) ![Build](https://img.shields.io/badge/Build-GitHub%20Actions-orange)

---

## ✨ Возможности

- 🎬 **Видеоплеер** — MKV, MP4, AVI, TS, MOV, FLV, 3GP
- 🎵 **Аудиоплеер** — MP3, FLAC, M4A, AAC, OGG
- 📂 **Просмотр чатов** — каналы, группы, сохранённые сообщения
- 📋 **Плейлисты** — создавайте списки воспроизведения
- 🔍 **Поиск** — по названию, типу файла
- 📱 **D-pad навигация** — полная поддержка пульта
- 🔐 **Приватность** — все данные локально, без серверов
- 🌐 **Telegram MTProto** — прямое подключение через gramjs

---

## 📥 Скачать APK

### Из GitHub Releases (рекомендуется)

1. Перейдите на страницу [Releases](../../releases)
2. Скачайте последний `TeleTV-Player-vX.X.X.apk`
3. Установите на Android TV

### Из GitHub Actions (для тестирования)

1. Перейдите в [Actions](../../actions)
2. Выберите последний workflow run
3. В разделе "Artifacts" скачайте `TeleTV-Player-debug`
4. Распакуйте и установите APK

---

## 📱 Установка на Android TV

### Способ 1: Через USB

1. Скачайте APK на компьютер
2. Скопируйте на USB-флешку
3. Вставьте в Android TV
4. Откройте файловый менеджер → APK → Установить

### Способ 2: Через ADB

```bash
adb connect <IP-адрес-TV>
adb install TeleTV-Player-v1.1.0.apk
```

> ⚠️ **Важно:** Включите «Установка из неизвестных источников» в настройках TV

---

## 🔧 Настройка приложения

### Получение API credentials

1. Перейдите на https://my.telegram.org/apps
2. Войдите с номером телефона
3. Создайте приложение
4. Скопируйте **API ID** и **API Hash**

### Вход в приложение

1. Откройте TeleTV Player на TV
2. Введите **API ID** (число)
3. Введите **API Hash** (строка)
4. Введите номер телефона (+7..., +1...)
5. Введите код подтверждения из Telegram
6. Если включена 2FA — введите облачный пароль

---

## 🏗️ Сборка из исходников

### Требования

- Node.js 20+
- npm 10+
- Android SDK (API 26-34)
- JDK 17

### Шаги

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/teletv-player.git
cd teletv-player

# 2. Установите зависимости
npm install

# 3. Соберите веб-приложение
npm run build

# 4. Скопируйте веб-ассеты в Android
mkdir -p android/app/src/main/assets
cp -r dist/* android/app/src/main/assets/

# 5. Соберите APK
cd android
chmod +x gradlew
./gradlew assembleDebug

# APK будет в android/app/build/outputs/apk/debug/
```

Или используйте скрипт:
```bash
chmod +x build-android.sh
./build-android.sh
```

---

## 📂 Структура проекта

```
teletv-player/
├── src/                    # Исходный код (React + TypeScript)
│   ├── App.tsx            # Главный компонент
│   ├── telegram.ts        # Telegram MTProto клиент (gramjs)
│   └── index.css          # Стили
├── android/               # Android проект (WebView)
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/teletv/player/
│   │       │   └── MainActivity.java
│   │       └── assets/    # Веб-приложение (копируется из dist/)
│   ├── build.gradle
│   └── gradlew
├── .github/
│   └── workflows/
│       └── build-apk.yml  # CI/CD для сборки APK
├── build-android.sh       # Скрипт локальной сборки
├── package.json
└── README.md
```

---

## 🛠️ Технологии

| Компонент | Технология |
|-----------|-----------|
| UI Framework | React 18 + TypeScript |
| Стилизация | Tailwind CSS |
| Telegram API | gramjs (MTProto 2.0) |
| Android | Нативный WebView |
| Сборка | Vite + Gradle |
| CI/CD | GitHub Actions |
| Мин. Android | 8.0 (API 26) |

---

## 📺 Поддерживаемые устройства

- ✅ Xiaomi Mi TV Stick / Mi Box
- ✅ NVIDIA Shield TV
- ✅ Chromecast with Google TV
- ✅ Sony Bravia (Android TV)
- ✅ Philips Android TV
- ✅ TCL Android TV
- ✅ Amazon Fire TV Stick
- ✅ Любые Android TV / Google TV боксы

---

## 🔄 Автоматическая сборка

При каждом push в `main` GitHub Actions автоматически:
1. Устанавливает зависимости
2. Собирает веб-приложение
3. Копирует веб-ассеты в Android проект
4. Собирает Debug APK
5. Загружает в Artifacts

При создании тега `v*`:
1. Собирается Release APK
2. Создаётся GitHub Release
3. APK прикрепляется к релизу

```bash
# Создать релиз
git tag v1.1.0
git push origin v1.1.0
```

---

## 🔐 Безопасность

- 🔒 Все данные хранятся локально на устройстве
- 🔒 Сессия Telegram зашифрована
- 🔒 Нет серверов и трекеров
- 🔒 Открытый исходный код
- 🔒 Прямое подключение к Telegram (MTProto)

---

## 🤝 Поддержка

- 📧 Email: support@teletv.app
- 💬 Telegram: @TeleTVSupport
- 🐛 Баги: [GitHub Issues](../../issues)

---

## 📄 Лицензия

GPL-3.0 — свободное использование, модификация и распространение.

---

**Made with ❤️ for Android TV community**
