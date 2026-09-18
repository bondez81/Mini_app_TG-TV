# 🚨 Решение конфликта слияния в PR #1

## Проблема
При попытке merge PR #1 возникает конфликт в файле `package-lock.json`.

## ✅ Решение (3 способа)

### Способ 1: Через GitHub UI (самый простой)

1. Откройте PR #1: https://github.com/bondez81/Mini_app_TG-TV/pull/1
2. Нажмите кнопку **"Resolve conflicts"** (Разрешить конфликты)
3. GitHub покажет файлы с конфликтами
4. Для файла `package-lock.json`:
   - **Удалите ВСЁ содержимое файла**
   - **Оставьте файл пустым**
5. Нажмите **"Mark as resolved"** (Пометить как решённый)
6. Нажмите **"Commit merge"** (Зафиксировать слияние)
7. GitHub автоматически пересоздаст `package-lock.json` при следующем push

### Способ 2: Локально через Git (рекомендуется)

```bash
# 1. Переключитесь на ветку PR
git checkout telegram-tv-media-player-0590a

# 2. Обновите локальную ветку main
git fetch origin
git checkout main
git pull origin main

# 3. Вернитесь в ветку PR
git checkout telegram-tv-media-player-0590a

# 4. Слейте main в вашу ветку
git merge main

# 5. Если возникнет конфликт в package-lock.json:
#    Удалите файл полностью
git rm package-lock.json

# 6. Пересоздайте package-lock.json
npm install

# 7. Добавьте изменения
git add .

# 8. Завершите merge
git commit -m "Merge branch 'main' into telegram-tv-media-player-0590a

- Resolved package-lock.json conflict
- Regenerated lock file with npm install
- All dependencies are up to date"

# 9. Отправьте изменения
git push origin telegram-tv-media-player-0590a
```

### Способ 3: Принудительная перезапись (если ничего не помогает)

```bash
# 1. Переключитесь на ветку PR
git checkout telegram-tv-media-player-0590a

# 2. Удалите package-lock.json
rm package-lock.json

# 3. Пересоздайте его
npm install

# 4. Добавьте и закоммитьте
git add package-lock.json
git commit -m "Regenerate package-lock.json to resolve merge conflict"

# 5. Отправьте с принудительным push
git push origin telegram-tv-media-player-0590a --force
```

## 🔍 Проверка после разрешения конфликта

После разрешения конфликта проверьте:

```bash
# Убедитесь, что нет маркеров конфликта
grep -r "<<<<<<<" . --exclude-dir=node_modules --exclude-dir=.git

# Проверьте сборку
npm install
npm run build

# Проверьте, что всё работает
npm run dev
```

## 📋 Что делать, если конфликт в других файлах

Если конфликт не только в `package-lock.json`, но и в других файлах:

### Для файлов исходного кода (src/, android/):
1. Откройте файл с конфликтом
2. Найдите маркеры:
   ```
   <<<<<<< HEAD
   ваш код
   =======
   код из main
   >>>>>>> main
   ```
3. Выберите, какую версию оставить (обычно вашу)
4. Удалите маркеры (`<<<<<<<`, `=======`, `>>>>>>>`)
5. Сохраните файл
6. Добавьте и закоммитьте

### Для конфигурационных файлов (package.json, vite.config.ts):
- Обычно нужно объединить изменения из обеих версий
- Убедитесь, что все зависимости есть
- Пересоздайте `package-lock.json` через `npm install`

## ✅ Финальная проверка

После разрешения конфликта:

1. ✅ `package-lock.json` пересоздан
2. ✅ `npm install` проходит без ошибок
3. ✅ `npm run build` успешно
4. ✅ Нет маркеров конфликта в коде
5. ✅ Все тесты проходят

## 🎯 Рекомендация

**Используйте Способ 2** (локально через Git) - он самый надёжный и даёт полный контроль.

Если не получается - используйте **Способ 1** (через GitHub UI) - он самый простой.

## 📞 Если ничего не помогает

1. Создайте новую ветку от актуальной main:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b telegram-tv-media-player-fixed
   ```

2. Скопируйте ваши изменения из старой ветки:
   ```bash
   git cherry-pick <коммиты из старой ветки>
   ```

3. Создайте новый PR

---

**Статус**: Готово к разрешению конфликта
**Время**: ~5-10 минут
**Сложность**: Низкая
