# Настройка Email уведомлений

Этот документ объясняет, как настроить отправку email уведомлений при создании новых заданий.

## Обзор

Cloud Functions автоматически отправляют email уведомления:
- **sendTaskNotification** - при создании нового задания исполнителю
- **sendWishApprovalNotification** - при одобрении желания создателю

## Шаг 1: Установка зависимостей

```bash
cd functions
npm install
```

## Шаг 2: Настройка SMTP (Email сервер)

Вам нужно выбрать один из вариантов отправки email:

### Вариант 1: Gmail (рекомендуется для тестирования)

1. **Включите 2-Step Verification** в вашем Google аккаунте
2. **Создайте App Password**:
   - Откройте https://myaccount.google.com/apppasswords
   - Выберите "Mail" и "Other (Custom name)"
   - Введите "LVTodo" и нажмите "Generate"
   - Скопируйте сгенерированный пароль (16 символов)

3. **Установите переменные окружения** в Firebase:

```bash
firebase functions:config:set smtp.host="smtp.gmail.com" smtp.port="587" smtp.user="your-email@gmail.com" smtp.password="your-app-password"
```

Замените:
- `your-email@gmail.com` - ваш Gmail адрес
- `your-app-password` - сгенерированный App Password

### Вариант 2: SendGrid (рекомендуется для продакшена)

1. **Создайте аккаунт** на https://sendgrid.com (бесплатный план - 100 писем/день)
2. **Создайте API Key**:
   - Settings → API Keys → Create API Key
   - Full Access
   - Скопируйте ключ

3. **Установите переменные окружения**:

```bash
firebase functions:config:set smtp.host="smtp.sendgrid.net" smtp.port="587" smtp.user="apikey" smtp.password="your-sendgrid-api-key"
```

### Вариант 3: Mailgun

1. **Создайте аккаунт** на https://mailgun.com
2. **Получите SMTP credentials** из раздела Sending → Domain Settings → SMTP credentials
3. **Установите переменные окружения**:

```bash
firebase functions:config:set smtp.host="smtp.mailgun.org" smtp.port="587" smtp.user="postmaster@your-domain.mailgun.org" smtp.password="your-mailgun-password"
```

### Вариант 4: Другой SMTP сервер

Для любого другого SMTP сервера:

```bash
firebase functions:config:set smtp.host="smtp.example.com" smtp.port="587" smtp.user="your-username" smtp.password="your-password"
```

## Шаг 3: Обновление кода (если нужно)

Если вы не используете переменные окружения Firebase, отредактируйте `functions/index.js`:

```javascript
const EMAIL_CONFIG = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
};
```

## Шаг 4: Деплой Cloud Functions

```bash
# Из корневой директории проекта
npm run deploy:functions

# ИЛИ напрямую
cd functions
firebase deploy --only functions --project lvtodo
```

## Шаг 5: Проверка

1. Создайте новое задание в приложении
2. Проверьте email исполнителя
3. Проверьте логи функций:

```bash
firebase functions:log --project lvtodo
```

## Локальное тестирование

Для локального тестирования с эмулятором:

1. **Создайте файл `.env`** в папке `functions/`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

2. **Обновите `functions/index.js`** для чтения .env файла:

```javascript
// В начале файла
require('dotenv').config();
```

3. **Установите dotenv**:

```bash
cd functions
npm install dotenv
```

4. **Запустите эмулятор**:

```bash
npm run emulator
```

5. **Создайте задание** в эмуляторе - email будет отправлен реально!

## Структура Email уведомлений

### Уведомление о новом задании

Содержит:
- Название задания
- Описание
- Заказчик (кто создал)
- Группа
- Срок выполнения
- Сложность (легкая/сложная)
- Награда (баллы)
- Кнопка "Открыть задание"

### Уведомление об одобрении желания

Содержит:
- Название желания
- Описание
- Стоимость (в баллах)
- Группа
- Кнопка "Посмотреть желание"

## Ограничения бесплатных планов

| Сервис | Бесплатный лимит |
|--------|------------------|
| Gmail | 500 писем/день |
| SendGrid | 100 писем/день |
| Mailgun | 100 писем/день (первый месяц 5000) |

## Мониторинг

Проверить статус отправки:

```bash
# Логи функций
firebase functions:log --project lvtodo

# Логи за последний час
firebase functions:log --project lvtodo --since 1h

# Только ошибки
firebase functions:log --project lvtodo --only sendTaskNotification
```

## Отключение уведомлений

Чтобы временно отключить:

1. **Закомментируйте функции** в `functions/index.js`
2. **Или удалите деплой**:

```bash
firebase functions:delete sendTaskNotification --project lvtodo
firebase functions:delete sendWishApprovalNotification --project lvtodo
```

## Troubleshooting

### Проблема: "Invalid login" с Gmail

**Решение**: Убедитесь, что вы используете App Password, а не обычный пароль аккаунта.

### Проблема: "Connection timeout"

**Решение**: Проверьте порт (587 для TLS, 465 для SSL) и настройки `secure`.

### Проблема: Email не приходят

**Решение**:
1. Проверьте папку "Спам"
2. Проверьте логи: `firebase functions:log`
3. Убедитесь, что SMTP credentials правильные
4. Проверьте, что у пользователя есть email в Firestore

### Проблема: "Missing or insufficient permissions"

**Решение**: Firebase Functions требуют правильного IAM permissions. Проверьте, что сервисный аккаунт имеет права на чтение Firestore.

## Дополнительные возможности

### Добавить больше уведомлений

Вы можете добавить уведомления для:
- Подтверждение задания заказчиком
- Напоминание о приближающемся дедлайне
- Достижение нового уровня
- Приглашение в группу

Пример функции напоминания о дедлайне:

```javascript
// Scheduled function that runs every hour
exports.sendDeadlineReminders = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const in24Hours = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 24 * 60 * 60 * 1000)
    );

    const tasksSnapshot = await admin.firestore()
      .collection('tasks')
      .where('status', '==', 'in_progress')
      .where('deadline', '>', now)
      .where('deadline', '<', in24Hours)
      .get();

    // Send reminder emails...
  });
```

### Настроить HTML шаблоны

Email шаблоны можно вынести в отдельные файлы для лучшей организации:

```
functions/
  ├── index.js
  ├── templates/
  │   ├── task-notification.html
  │   └── wish-approval.html
  └── utils/
      └── email.js
```

## Безопасность

**ВАЖНО:**
- Никогда не коммитьте `.env` файлы в Git
- Используйте Firebase environment config для продакшена
- Ограничьте SMTP credentials только для отправки писем
- Регулярно ротируйте API ключи

## Цены Cloud Functions

Firebase Cloud Functions имеют бесплатный tier:
- 2 миллиона вызовов/месяц
- 400,000 GB-секунд, 200,000 GHz-секунд compute time
- 5 GB исходящего трафика

Для небольших проектов это бесплатно!

## Поддержка

Если у вас возникли проблемы:
1. Проверьте логи: `firebase functions:log`
2. Проверьте Firebase Console → Functions
3. Убедитесь, что Billing включен (Functions требуют Blaze plan)
