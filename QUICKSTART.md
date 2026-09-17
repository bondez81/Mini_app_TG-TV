# 🚀 Быстрый старт — Как получить APK

## Шаг 1: Загрузите проект на GitHub

```bash
# 1. Создайте репозиторий на https://github.com/new
#    Название: teletv-player
#    Публичный
#    НЕ инициализируйте с README

# 2. В папке проекта выполните:
git init
git add .
git commit -m "Initial commit: TeleTV Player v1.1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/teletv-player.git
git push -u origin main
```

## Шаг 2: Дождитесь сборки APK

После push GitHub Actions автоматически:
- ✅ Соберёт веб-приложение
- ✅ Создаст Android проект
- ✅ Соберёт Debug APK
- ✅ Загрузит в Artifacts

**Где скачать:**
1. Перейдите в ваш репозиторий на GitHub
2. Нажмите **Actions** (вверху)
3. Выберите последний workflow run
4. Прокрутите вниз до **Artifacts**
5. Скачайте `TeleTV-Player-debug`
6. Распакуйте ZIP → получите APK

## Шаг 3: Создайте первый релиз (для пользователей)

```bash
# Создайте тег версии
git tag v1.1.0
git push origin v1.1.0
```

Это создаст:
- 📦 Release на странице Releases
- 📱 APK прикреплён к релизу
- 🔗 Прямая ссылка для скачивания

**Ссылка на релиз:**
```
https://github.com/YOUR_USERNAME/teletv-player/releases/latest
```

## Шаг 4: Установите APK на Android TV

### Метод 1: USB-флешка
1. Скачайте APK из Releases
2. Скопируйте на USB
3. Вставьте в TV
4. Установите через файловый менеджер

### Метод 2: ADB
```bash
adb connect <IP-TV>
adb install TeleTV-Player-v1.1.0.apk
```

## Шаг 5: Настройте приложение

1. Получите API credentials: https://my.telegram.org/apps
2. Откройте TeleTV Player на TV
3. Введите API ID и Hash
4. Войдите с номером телефона
5. Готово! 🎉

---

## 📋 Что дальше?

### Обновление версии

```bash
# 1. Внесите изменения в код
# 2. Обновите версию в package.json
# 3. Создайте новый тег
git tag v1.2.0
git push origin v1.2.0
```

### Локальная сборка (если нужно)

```bash
# Установите зависимости
npm install

# Соберите веб-приложение
npm run build

# Добавьте Android платформу (если ещё не добавлена)
npx cap add android

# Синхронизируйте файлы
npx cap sync android

# Соберите APK
cd android
./gradlew assembleDebug

# APK будет в: android/app/build/outputs/apk/debug/
```

Или используйте скрипт:
```bash
chmod +x build-android.sh
./build-android.sh
```

---

## 🎯 Итого

✅ Проект готов к публикации на GitHub  
✅ GitHub Actions автоматически собирает APK  
✅ При создании тега создаётся Release с APK  
✅ Пользователи могут скачать APK из Releases  

**Замените `YOUR_USERNAME` на ваше имя пользователя GitHub во всех ссылках!**

---

## 📚 Документация

- [README.md](README.md) — основная информация
- [INSTALL.md](INSTALL.md) — подробная инструкция по установке
- [DEPLOYMENT.md](DEPLOYMENT.md) — детали публикации и обновления

---

**Удачи с проектом! 🚀**
