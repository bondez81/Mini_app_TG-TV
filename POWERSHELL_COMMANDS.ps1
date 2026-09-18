# PowerShell команды для разрешения конфликта слияния
# Выполняйте эти команды в PowerShell

# ========================================
# СПОСОБ 1: Простое пересоздание package-lock.json
# ========================================

# 1. Переключитесь на ветку PR
git checkout telegram-tv-media-player-0590a

# 2. Удалите package-lock.json
Remove-Item package-lock.json

# 3. Пересоздайте его через npm install
npm install

# 4. Добавьте изменения
git add package-lock.json

# 5. Закоммитьте
git commit -m "Fix: regenerate package-lock.json to resolve merge conflict"

# 6. Отправьте в репозиторий
git push origin telegram-tv-media-player-0590a


# ========================================
# СПОСОБ 2: Если нужно слить main в вашу ветку
# ========================================

# 1. Переключитесь на ветку PR
git checkout telegram-tv-media-player-0590a

# 2. Обновите локальную ветку main
git fetch origin
git checkout main
git pull origin main

# 3. Вернитесь в ветку PR
git checkout telegram-tv-media-player-0590a

# 4. Попробуйте слить main
git merge main

# 5. Если возникнет конфликт в package-lock.json:
Remove-Item package-lock.json
npm install
git add package-lock.json
git commit -m "Merge branch 'main' - resolved package-lock.json conflict"
git push origin telegram-tv-media-player-0590a


# ========================================
# СПОСОБ 3: Принудительная перезапись (если ничего не помогает)
# ========================================

# 1. Переключитесь на ветку PR
git checkout telegram-tv-media-player-0590a

# 2. Удалите package-lock.json
Remove-Item package-lock.json

# 3. Пересоздайте его
npm install

# 4. Добавьте и закоммитьте
git add package-lock.json
git commit -m "Regenerate package-lock.json"

# 5. Отправьте с принудительным push
git push origin telegram-tv-media-player-0590a --force


# ========================================
# ПРОВЕРКА ПОСЛЕ РАЗРЕШЕНИЯ КОНФЛИКТА
# ========================================

# Проверьте, что нет маркеров конфликта
Select-String -Path "package-lock.json" -Pattern "<<<<<<<" -Quiet

# Если команда вернула $true - есть конфликт, если $false - всё чисто

# Проверьте сборку
npm install
npm run build

# Проверьте, что проект запускается
npm run dev


# ========================================
# ДОПОЛНИТЕЛЬНЫЕ КОМАНДЫ
# ========================================

# Посмотреть текущую ветку
git branch

# Посмотреть статус
git status

# Посмотреть логи коммитов
git log --oneline -10

# Отменить последний коммит (если нужно)
git reset --soft HEAD~1

# Посмотреть разницу между ветками
git diff main..telegram-tv-media-player-0590a


# ========================================
# ЕСЛИ ВСЁ СЛОЖНО - ПРОСТОЙ ПУТЬ
# ========================================

# Просто выполните эти 4 команды:
git checkout telegram-tv-media-player-0590a
Remove-Item package-lock.json
npm install
git add . ; git commit -m "Fix merge conflict" ; git push


# ========================================
# ПОЛЕЗНЫЕ ССЫЛКИ
# ========================================

# Открыть PR в браузере
Start-Process "https://github.com/bondez81/Mini_app_TG-TV/pull/1"

# Открыть репозиторий
Start-Process "https://github.com/bondez81/Mini_app_TG-TV"
