# 🚀 Публикация на GitHub

## Быстрый старт

### 1. Создайте репозиторий на GitHub

1. Перейдите на https://github.com/new
2. Название: `teletv-player`
3. Описание: `TeleTV Player — Telegram Media for Android TV`
4. Сделайте публичным
5. **НЕ** инициализируйте с README

### 2. Загрузите проект

```bash
# В папке проекта
git init
git add .
git commit -m "Initial commit: TeleTV Player v1.1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/teletv-player.git
git push -u origin main
```

### 3. Дождитесь сборки APK

После push GitHub Actions автоматически:
- Соберёт веб-приложение
- Создаст Android проект
- Соберёт Debug APK
- Загрузит его в Artifacts

Скачать можно здесь:
`https://github.com/YOUR_USERNAME/teletv-player/actions`

### 4. Создайте первый релиз

```bash
git tag v1.1.0
git push origin v1.1.0
```

Это создаст:
- Release на странице `https://github.com/YOUR_USERNAME/teletv-player/releases`
- APK будет прикреплён к релизу
- Пользователи смогут скачать его напрямую

---

## Структура релизов

### Debug APK (при каждом push)
- Автоматически собирается
- Доступен в Artifacts (30 дней)
- Для тестирования

### Release APK (при создании тега)
- Собирается при `git tag v*`
- Публикуется в Releases (навсегда)
- Для пользователей

---

## Обновление версии

1. Обновите версию в `package.json`:
   ```json
   "version": "1.2.0"
   ```

2. Обновите версию в `android/variables.gradle`:
   ```gradle
   versionCode 2
   versionName "1.2.0"
   ```

3. Создайте тег:
   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```

---

## Подпись APK (опционально)

Для публикации в Google Play нужна подпись:

1. Создайте keystore:
   ```bash
   keytool -genkey -v -keystore release.keystore -alias teletv -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Создайте `android/keystore.properties`:
   ```properties
   storePassword=YOUR_PASSWORD
   keyPassword=YOUR_PASSWORD
   keyAlias=teletv
   storeFile=../release.keystore
   ```

3. Обновите `android/app/build.gradle`:
   ```gradle
   signingConfigs {
       release {
           def propsFile = rootProject.file('keystore.properties')
           if (propsFile.exists()) {
               def props = new Properties()
               props.load(new FileInputStream(propsFile))
               storeFile = file(props['storeFile'])
               storePassword = props['storePassword']
               keyAlias = props['keyAlias']
               keyPassword = props['keyPassword']
           }
       }
   }
   buildTypes {
       release {
           signingConfig signingConfigs.release
       }
   }
   ```

---

## GitHub Actions Secrets (для подписи)

Если хотите подписывать APK в CI:

1. Перейдите в Settings → Secrets → Actions
2. Добавьте:
   - `KEYSTORE_BASE64` — keystore в base64
   - `KEYSTORE_PASSWORD` — пароль
   - `KEY_ALIAS` — alias ключа
   - `KEY_PASSWORD` — пароль ключа

---

## Автоматическое обновление

Пользователи могут проверять обновления через:
- GitHub Releases API
- Встроенную проверку в приложении (можно добавить)

---

## FAQ

**Q: APK не устанавливается?**
A: Включите «Установка из неизвестных источников» в настройках TV.

**Q: Где скачать последний APK?**
A: Перейдите в Releases → последний релиз → Assets → APK.

**Q: Как собрать локально?**
A: См. раздел «Сборка из исходников» в README.

**Q: Можно опубликовать в Google Play?**
A: Да, но нужна подпись и аккаунт разработчика ($25).
