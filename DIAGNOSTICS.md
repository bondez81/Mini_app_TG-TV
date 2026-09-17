# Диагностика TeleTV Player

## Проблема: Чёрный экран при запуске

Если после установки APK вы видите чёрный экран, выполните следующие шаги:

### Шаг 1: Установите новый APK

1. Скачайте новый APK из GitHub Actions → Artifacts
2. Удалите старую версию приложения (если установлена)
3. Установите новый APK

### Шаг 2: Проверьте логи

Подключите TV к компьютеру через ADB и выполните:

```bash
# Очистите старые логи
adb logcat -c

# Запустите приложение на TV
# (или откройте его вручную)

# Смотрите логи в реальном времени
adb logcat -s TeleTV:I WebView:I chromium:I
```

### Шаг 3: Что должно быть в логах

Если всё работает правильно, вы увидите:

```
I/TeleTV: === TeleTV Player Starting ===
I/TeleTV: Creating MainActivity
I/TeleTV: Window configured
I/TeleTV: WebView created and set as content view
I/TeleTV: WebView settings configured
I/TeleTV: WebView clients configured
I/TeleTV: Attempting to load: file:///android_asset/test.html
I/TeleTV: === MainActivity onCreate Complete ===
I/TeleTV: === Page Loading Started ===
I/TeleTV: URL: file:///android_asset/test.html
I/TeleTV: === Page Loaded ===
I/TeleTV: URL: file:///android_asset/test.html
```

### Шаг 4: Что вы должны увидеть на экране

Если test.html загрузился успешно, вы увидите:

- 🎨 Градиентный фон (фиолетовый)
- 📺 Заголовок "TeleTV Player"
- ✅ Статус "WebView работает!"
- ✅ Статус "JavaScript: ✅ Работает"
- ✅ Статус "LocalStorage: ✅ Работает"
- 🕐 Текущее время (обновляется каждую секунду)
- 🔘 Две кнопки: "Тест LocalStorage" и "Загрузить React App"
- 📋 Лог с сообщениями

### Шаг 5: Что делать дальше

#### Если test.html работает (вы видите страницу):

1. Нажмите кнопку "Тест LocalStorage" - должно появиться сообщение в логе
2. Нажмите кнопку "Загрузить React App" - приложение попытается загрузить index.html
3. Если React app не загружается - проблема в JavaScript коде
4. Пришлите логи: `adb logcat -d > teletv_log.txt`

#### Если test.html НЕ работает (чёрный экран):

1. Проверьте логи: `adb logcat -s TeleTV:I`
2. Если нет логов "TeleTV" - приложение крашится до создания Activity
3. Если есть ошибка "WebView Error" - проблема с assets
4. Пришлите логи: `adb logcat -d > teletv_log.txt`

### Шаг 6: Переключение на React app

Если test.html работает, измените MainActivity.java:

```java
// Замените:
String assetPath = "file:///android_asset/test.html";

// На:
String assetPath = "file:///android_asset/index.html";
```

Затем пересоберите APK.

## Частые проблемы

### Проблема: Нет логов TeleTV

**Решение:** Приложение крашится при запуске. Проверьте:
```bash
adb logcat | grep -i "teletv\|androidruntime\|fatal"
```

### Проблема: WebView Error: net::ERR_FILE_NOT_FOUND

**Решение:** Файлы не скопированы в assets. Проверьте:
```bash
adb shell ls -la /data/data/com.teletv.player.debug/files/
```

### Проблема: JavaScript ошибки

**Решение:** Проверьте консоль браузера через Chrome DevTools:
1. Подключите TV через USB
2. Откройте Chrome на компьютере
3. Перейдите в `chrome://inspect`
4. Найдите WebView вашего приложения
5. Нажмите "inspect"

## Полезные команды ADB

```bash
# Очистить логи
adb logcat -c

# Смотреть логи в реальном времени
adb logcat -s TeleTV:I

# Сохранить логи в файл
adb logcat -d > teletv_log.txt

# Перезапустить приложение
adb shell am force-stop com.teletv.player.debug
adb shell am start -n com.teletv.player.debug/.MainActivity

# Удалить приложение
adb uninstall com.teletv.player.debug

# Установить APK
adb install teletv-player.apk

# Проверить файлы в assets
adb shell ls -la /data/data/com.teletv.player.debug/files/
```

## Контакты

Если проблема не решена, пришлите:
1. Полные логи: `adb logcat -d > teletv_log.txt`
2. Скриншот экрана (если есть)
3. Модель TV и версию Android
