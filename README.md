# 📺 TeleTV Player

**Telegram Media Player для Android TV**

Нативное приложение для просмотра видео и прослушивания аудио из Telegram на Android TV. Работает через прямое подключение к Telegram MTProto — без серверов и посредников.

![TeleTV Player](https://img.shields.io/badge/Platform-Android%20TV-blue) ![Version](https://img.shields.io/badge/Version-1.1.0-green) ![License](https://img.shields.io/badge/License-GPL--3.0-purple)

---

## ✨ Возможности

- 🎬 **Видеоплеер** — MKV, MP4, AVI, TS, MOV, FLV, 3GP
- 🎵 **Аудиоплеер** — MP3, FLAC, M4A, AAC, OGG
- 📂 **Просмотр чатов** — каналы, группы, сохранённые сообщения
- 📋 **Плейлисты** — создавайте списки воспроизведения
- 🔍 **Поиск** — по названию, типу файла
- 📱 **D-pad навигация** — полная поддержка пульта
- 🔐 **Приватность** — все данные локально, без серверов
- 🌐 **Telegram MTProto** — прямое подключение

---

## 📥 Скачать APK

### Из GitHub Releases (рекомендуется)

1. Перейдите на страницу [Releases](../../releases)
2. Скачайте последний `TeleTV-Player-vX.X.X.apk`
3. Установите на Android TV

### Сборка из исходников

См. раздел [Сборка из исходников](#-сборка-из-исходников)

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

### Способ 3: Через файловый менеджер на TV

1. Скачайте APK через браузер на TV
2. Откройте файловый менеджер
3. Найдите APK → Установить

> ⚠️ **Важно:** Включите «Установка из неизвестных источников» в настройках TV:
> Настройки → Безопасность → Неизвестные источники

---

## 🔧 Настройка приложения

### Получение API credentials

1. Перейдите на https://my.telegram.org/apps
2. Войдите с номером телефона
3. Создайте приложение (если ещё не создано)
4. Скопируйте **API ID** и **API Hash**

### Вход в приложение

1. Откройте TeleTV Player на TV
2. Введите **API ID** (число)
3. Введите **API Hash** (строка)
4. Введите номер телефона в международном формате (+7..., +1...)
5. Введите код подтверждения из Telegram
6. Если включена 2FA — введите облачный пароль

---

## 🏗️ Сборка из исходников

### Требования

- Node.js 20+
- npm 10+
- Android SDK (API 26-34)
- JDK 17
- Gradle 8+

### Шаги

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/YOUR_USERNAME/teletv-player.git
cd teletv-player

# 2. Установите зависимости
npm install

# 3. Соберите веб-приложение
npm run build

# 4. Добавьте Android платформу
npx cap add android

# 5. Синхронизируйте файлы
npx cap sync android

# 6. Откройте в Android Studio
npx cap open android

# 7. Или соберите APK через Gradle
cd android
./gradlew assembleDebug
```

APK будет в `android/app/build/outputs/apk/debug/`

### Автоматическая сборка через GitHub Actions

При каждом push в `main` автоматически собирается Debug APK.
При создании тега `v*` создаётся Release с APK.

```bash
# Создать релиз
git tag v1.1.0
git push origin v1.1.0
```

---

## 📂 Структура проекта

```
teletv-player/
├── src/                    # Исходный код (React + TypeScript)
│   ├── App.tsx            # Главный компонент
│   ├── telegram.ts        # Telegram MTProto клиент
│   ├── data.ts            # Моковые данные
│   └── index.css          # Стили
├── android/               # Android проект (Capacitor)
│   ├── app/
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       └── java/com/teletv/player/
│   │           └── MainActivity.java
│   ├── build.gradle
│   └── variables.gradle
├── .github/
│   └── workflows/
│       └── build-apk.yml  # CI/CD для сборки APK
├── capacitor.config.ts    # Конфигурация Capacitor
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
| Обёртка | Capacitor |
| Сборка | Vite |
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

## ⭐ Поддержать проект

Если приложение полезно — поставьте звезду на GitHub! Это мотивирует развивать проект.

---

**Made with ❤️ for Android TV community**
