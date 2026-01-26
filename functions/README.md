# LVTodo Cloud Functions

Firebase Cloud Functions для отправки email уведомлений в приложении LVTodo.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd functions
npm install
```

### 2. Настройка SMTP (Gmail для тестирования)

**Получите App Password от Gmail:**
1. Откройте https://myaccount.google.com/apppasswords
2. Включите 2-Step Verification если еще не включена
3. Создайте App Password для "Mail" → "Other (LVTodo)"
4. Скопируйте 16-символьный пароль

**Установите переменные окружения:**

```bash
firebase functions:config:set \
  smtp.host="smtp.gmail.com" \
  smtp.port="587" \
  smtp.user="your-email@gmail.com" \
  smtp.password="your-16-char-app-password"
```

### 3. Деплой функций

```bash
# Из корневой директории
npm run deploy:functions

# ИЛИ из папки functions
firebase deploy --only functions --project lvtodo
```

### 4. Проверка

Создайте задание в приложении - исполнитель получит email! 📧

## 📋 Доступные функции

### sendTaskNotification
**Триггер:** Создание нового задания в Firestore
**Действие:** Отправляет email исполнителю (assignedTo) с деталями задания

### sendWishApprovalNotification
**Триггер:** Обновление желания со статусом "active" (одобрено)
**Действие:** Отправляет email создателю желания с утвержденной стоимостью

## 🔧 Локальное тестирование

1. Создайте файл `.env` в папке `functions/`:

```bash
cp .env.example .env
# Отредактируйте .env своими данными
```

2. Установите dotenv:

```bash
npm install dotenv
```

3. Обновите `index.js` (в начале файла):

```javascript
require('dotenv').config();
```

4. Запустите эмулятор:

```bash
cd ..
npm run emulator
```

5. Создайте задание через эмулятор - email отправится!

## 📊 Мониторинг

Просмотр логов:

```bash
# Все логи
firebase functions:log --project lvtodo

# Только новые логи (real-time)
firebase functions:log --project lvtodo --only sendTaskNotification

# За последний час
firebase functions:log --project lvtodo --since 1h
```

## 🌍 Другие SMTP сервисы

### SendGrid (рекомендуется для продакшена)

```bash
firebase functions:config:set \
  smtp.host="smtp.sendgrid.net" \
  smtp.port="587" \
  smtp.user="apikey" \
  smtp.password="your-sendgrid-api-key"
```

### Mailgun

```bash
firebase functions:config:set \
  smtp.host="smtp.mailgun.org" \
  smtp.port="587" \
  smtp.user="postmaster@your-domain.mailgun.org" \
  smtp.password="your-mailgun-password"
```

Подробная документация: [EMAIL_SETUP.md](../EMAIL_SETUP.md)

## ❗ Важно

- ✅ Firebase Functions требуют **Blaze plan** (pay-as-you-go)
- ✅ Бесплатный tier: 2M вызовов/месяц, 400K GB-sec
- ✅ Для маленьких проектов - **бесплатно**!
- ⚠️ Никогда не коммитьте `.env` файлы в Git

## 🐛 Проблемы?

Смотрите [EMAIL_SETUP.md](../EMAIL_SETUP.md) раздел "Troubleshooting"
