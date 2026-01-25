# 🚀 Автоматический деплой из GitHub в Firebase Hosting

Эта инструкция поможет настроить автоматическое развертывание вашего приложения при каждом push в GitHub.

---

## 📋 Что будет происходить автоматически:

1. Вы делаете изменения в коде
2. Выполняете `git push`
3. GitHub Actions автоматически:
   - Устанавливает зависимости
   - Собирает приложение
   - Деплоит на Firebase Hosting
4. Ваше приложение обновляется на https://lvtodo.web.app

---

## ⚙️ Настройка (один раз)

### Шаг 1: Создайте Firebase Service Account

1. **Откройте терминал (Command Prompt)**

2. **Войдите в Firebase (если еще не вошли):**
   ```bash
   firebase login
   ```

3. **Перейдите в папку проекта:**
   ```bash
   cd C:\Users\user\LVtodo-main
   ```

4. **Создайте Service Account ключ:**
   ```bash
   firebase init hosting:github
   ```

5. **Ответьте на вопросы:**

   **"For which GitHub repository would you like to set up a GitHub workflow?"**
   ```
   LChrist7/LVtodo
   ```
   (Введите ваш username/repository)

   **"Set up the workflow to run a build script before every deploy?"**
   ```
   Yes
   ```

   **"What script should be run before every deploy?"**
   ```
   cd pwa && npm ci && npm run build
   ```

   **"Set up automatic deployment to your site's live channel when a PR is merged?"**
   ```
   Yes
   ```

   **"What is the name of the GitHub branch associated with your site's live channel?"**
   ```
   main
   ```
   (Или ваша основная ветка)

6. **GitHub откроется в браузере** - разрешите доступ Firebase к вашему репозиторию

7. Firebase автоматически:
   - Создаст Service Account
   - Добавит секрет `FIREBASE_SERVICE_ACCOUNT` в GitHub
   - Создаст workflow файлы

---

### Шаг 2: Добавьте Firebase конфигурацию в GitHub Secrets

Теперь нужно добавить переменные окружения из вашего `.env` файла в GitHub:

1. **Откройте ваш репозиторий на GitHub:**
   ```
   https://github.com/LChrist7/LVtodo
   ```

2. **Перейдите в Settings → Secrets and variables → Actions**

3. **Нажмите "New repository secret"** и добавьте каждый секрет:

   | Name | Value |
   |------|-------|
   | `VITE_FIREBASE_API_KEY` | `AIzaSyBvxQ-PHevq129tA2Tlc5s4ZHLoh-GBvVo` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `lvtodo.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `lvtodo` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `lvtodo.firebasestorage.app` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `529943620436` |
   | `VITE_FIREBASE_APP_ID` | `1:529943620436:web:3c7cfa771bd438b712f6c1` |

   Для каждого:
   - Нажмите **"New repository secret"**
   - Name: название из таблицы
   - Secret: значение из таблицы
   - **"Add secret"**

---

### Шаг 3: Запушьте workflow файл в GitHub

```bash
cd C:\Users\user\LVtodo-main

git add .github/workflows/firebase-hosting.yml
git add firebase.json
git add .firebaserc
git add GITHUB_DEPLOY_SETUP.md

git commit -m "Add GitHub Actions workflow for automatic Firebase deployment"

git push
```

---

## ✅ Готово! Проверка работы

### 1. Посмотрите GitHub Actions

1. Откройте: `https://github.com/LChrist7/LVtodo/actions`
2. Вы должны увидеть запущенный workflow "Deploy to Firebase Hosting"
3. Кликните на него, чтобы увидеть процесс

### 2. Дождитесь завершения

⏱️ Обычно занимает 2-5 минут

Этапы:
- ✓ Checkout code
- ✓ Setup Node.js
- ✓ Install dependencies
- ✓ Create .env file
- ✓ Build project
- ✓ Deploy to Firebase Hosting

### 3. Проверьте деплой

Откройте: https://lvtodo.web.app

Приложение должно быть обновлено!

---

## 🔄 Как использовать теперь

### Простой workflow:

1. **Внесите изменения в код**

2. **Закоммитьте и запушьте:**
   ```bash
   git add .
   git commit -m "Описание изменений"
   git push
   ```

3. **Всё!** GitHub Actions автоматически:
   - Соберет приложение
   - Задеплоит на Firebase
   - Обновит https://lvtodo.web.app

4. **Следите за процессом:**
   https://github.com/LChrist7/LVtodo/actions

---

## 📊 Мониторинг

### Просмотр логов деплоя:
1. GitHub → Actions → выберите конкретный workflow run
2. Кликните на job "build_and_deploy"
3. Раскройте каждый step для просмотра логов

### История деплоев:
https://console.firebase.google.com/project/lvtodo/hosting

---

## 🎯 Триггеры автоматического деплоя

Деплой запускается при:

✅ **Push в ветки:**
- `main`
- `claude/cross-platform-mobile-app-3vxpy`

✅ **Изменения в файлах:**
- Любые файлы в папке `pwa/`
- Сам workflow файл

❌ **Не запускается при:**
- Изменениях только в README.md
- Изменениях вне папки `pwa/`

---

## ⚙️ Кастомизация

### Изменить ветки для деплоя

Отредактируйте `.github/workflows/firebase-hosting.yml`:

```yaml
on:
  push:
    branches:
      - main           # Добавьте/уберите ветки здесь
      - develop
```

### Добавить тесты перед деплоем

Добавьте step перед "Build project":

```yaml
- name: Run tests
  working-directory: ./pwa
  run: npm test
```

### Уведомления в Telegram/Slack

Добавьте step после деплоя для отправки уведомлений.

---

## 🔒 Безопасность

### GitHub Secrets (✓ Безопасно)
- Секреты зашифрованы
- Не видны в логах
- Не доступны в fork'ах
- Можно изменить в любой момент

### Service Account (✓ Безопасно)
- Минимальные права (только Hosting)
- Можно отозвать в Firebase Console
- Привязан к конкретному проекту

---

## ❓ Проблемы и решения

### ❌ Ошибка: "FIREBASE_SERVICE_ACCOUNT secret not found"

**Решение:**
1. Выполните `firebase init hosting:github` еще раз
2. Или добавьте секрет вручную:
   - `firebase login:ci` → скопируйте токен
   - GitHub → Settings → Secrets → Add secret
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: вставьте токен

### ❌ Ошибка: "Error: Unable to find firebase.json"

**Решение:**
Убедитесь, что `firebase.json` и `.firebaserc` есть в корне репозитория:
```bash
git add firebase.json .firebaserc
git commit -m "Add Firebase config"
git push
```

### ❌ Ошибка при сборке (Build failed)

**Решение:**
1. Проверьте, что все GitHub Secrets добавлены
2. Посмотрите логи в GitHub Actions
3. Попробуйте собрать локально: `npm run build`

### ❌ Деплой успешен, но на сайте старая версия

**Решение:**
1. Очистите кеш браузера (Ctrl+Shift+R)
2. Проверьте Firebase Console → Hosting → Release history
3. Убедитесь, что деплой был на правильный проект

---

## 📝 Альтернативные методы деплоя

### Метод 1: Автоматический (рекомендуется) ✅
```bash
git push
```
GitHub Actions всё сделает автоматически

### Метод 2: Ручной деплой
```bash
cd pwa
npm run build
cd ..
firebase deploy --only hosting
```

### Метод 3: Preview каналы (для тестирования)
```bash
firebase hosting:channel:deploy preview-feature-name
```

---

## 🎉 Готово!

Теперь при каждом push в GitHub ваше приложение будет автоматически обновляться на Firebase Hosting!

**Ваша ссылка:** https://lvtodo.web.app

**GitHub Actions:** https://github.com/LChrist7/LVtodo/actions

**Firebase Console:** https://console.firebase.google.com/project/lvtodo/hosting

---

## 📚 Дополнительно

### Preview для Pull Request

При создании PR, GitHub Actions автоматически создаст preview URL:
```
https://lvtodo--pr123-xxxx.web.app
```

Это позволяет протестировать изменения до мержа!

### Откат к предыдущей версии

Firebase Console → Hosting → Release history → Rollback

---

Удачи с автоматическим деплоем! 🚀
