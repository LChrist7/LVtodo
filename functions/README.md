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
4. Скопируйте 16-символьный пароль (без пробелов)

**Создайте .env файл для локального тестирования:**

```bash
# В папке functions/ создайте .env файл
cp .env.example .env
```

Отредактируйте `.env` файл:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=awzieqprixfxkjzw
```

**Для продакшена установите секрет:**

```bash
# Firebase CLI спросит пароль интерактивно
firebase functions:secrets:set SMTP_PASSWORD --project lvtodo
```

При запросе введите ваш App Password (без пробелов).

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

Firebase Functions v2 автоматически читает `.env` файл!

1. Убедитесь что `.env` файл создан (см. шаг 2 выше)

2. Запустите эмулятор:

```bash
cd ..
npm run emulator
```

3. Создайте задание через эмулятор - email отправится реально!

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

Обновите `.env`:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

Для продакшена:
```bash
firebase functions:secrets:set SMTP_PASSWORD --project lvtodo
# Введите ваш SendGrid API key
```

### Mailgun

Обновите `.env`:
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

Для продакшена:
```bash
firebase functions:secrets:set SMTP_PASSWORD --project lvtodo
# Введите ваш Mailgun password
```

Подробная документация: [EMAIL_SETUP.md](../EMAIL_SETUP.md)

## ❗ Важно

- ✅ Firebase Functions требуют **Blaze plan** (pay-as-you-go)
- ✅ Бесплатный tier: 2M вызовов/месяц, 400K GB-sec
- ✅ Для маленьких проектов - **бесплатно**!
- ⚠️ Никогда не коммитьте `.env` файлы в Git

## 🐛 Проблемы?

Смотрите [EMAIL_SETUP.md](../EMAIL_SETUP.md) раздел "Troubleshooting"
