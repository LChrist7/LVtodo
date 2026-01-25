# ✅ Чек-лист настройки LVTodo

## Шаги, которые нужно выполнить в Firebase Console

Откройте: https://console.firebase.google.com/project/lvtodo

### 1. ✅ Authentication (Аутентификация)

**Меню слева → Authentication → Sign-in method**

- [ ] **Email/Password** - должен быть **ВКЛЮЧЕН** (зеленый переключатель)

  Если выключен:
  1. Нажмите "Email/Password"
  2. Включите переключатель "Enable"
  3. Нажмите "Save"

---

### 2. ✅ Firestore Database (База данных)

**Меню слева → Firestore Database**

- [ ] **База данных создана** - должна быть видна консоль с вкладками "Data", "Rules", "Indexes"

  Если не создана:
  1. Нажмите "Create database"
  2. Выберите "Start in production mode"
  3. Регион: **europe-west1** (Бельгия) или ближайший
  4. Нажмите "Enable"

- [ ] **Правила безопасности настроены**

  1. Перейдите на вкладку **"Rules"**
  2. **Замените** весь текст правил на:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow write: if isOwner(userId);
    }

    // Tasks collection
    match /tasks/{taskId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
        (resource.data.assignedTo == request.auth.uid ||
         resource.data.assignedBy == request.auth.uid);
    }

    // Groups collection
    match /groups/{groupId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
        request.auth.uid in resource.data.memberIds;
    }

    // Wishes collection
    match /wishes/{wishId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() &&
        (resource.data.createdBy == request.auth.uid ||
         request.auth.uid in resource.data.groupMemberIds);
    }

    // Achievements collection
    match /achievements/{achievementId} {
      allow read: if isSignedIn();
      allow write: if isSignedIn();
    }
  }
}
```

  3. Нажмите **"Publish"**

---

### 3. ✅ Storage (Хранилище)

**Меню слева → Storage**

- [ ] **Storage включен** - должно быть "gs://lvtodo.firebasestorage.app"

  Если не включен:
  1. Нажмите "Get started"
  2. "Start in production mode"
  3. Регион: тот же, что для Firestore
  4. "Done"

---

### 4. ⚙️ Опционально: Cloud Messaging (Уведомления)

**Меню слева → Cloud Messaging**

Для push-уведомлений (можно настроить позже):
1. Настройки проекта (⚙️) → вкладка "Cloud Messaging"
2. Сгенерируйте Web Push certificates

---

## После настройки Firebase - запуск приложения

### 1. Установите зависимости
```bash
cd pwa
npm install
```

### 2. Запустите локально
```bash
npm run dev
```

Откройте: **http://localhost:5173**

### 3. Проверьте работу
1. Зарегистрируйтесь (имя, email, пароль)
2. Создайте группу
3. Создайте задачу
4. Выполните задачу - получите баллы!

---

## Проверка настроек

### Как проверить, что Firebase настроен правильно?

1. **Authentication работает?**
   - Попробуйте зарегистрироваться
   - Проверьте в Firebase Console → Authentication → Users
   - Должен появиться новый пользователь

2. **Firestore работает?**
   - Создайте группу в приложении
   - Проверьте в Firebase Console → Firestore Database → Data
   - Должна появиться коллекция "groups" с документом

3. **Правила безопасности работают?**
   - Если видите ошибки "permission denied" - правила не настроены
   - Вернитесь к шагу 2 и настройте Rules

---

## Частые проблемы

### ❌ "Firebase: Error (auth/invalid-api-key)"
- Проверьте файл `pwa/.env` - правильный ли API ключ?
- Перезапустите dev сервер: Ctrl+C, потом `npm run dev`

### ❌ "Missing or insufficient permissions"
- Firestore Rules не настроены
- Скопируйте правила из шага 2 выше

### ❌ "Failed to fetch"
- Проверьте интернет-соединение
- Firestore Database создана в Firebase Console?

### ❌ Приложение не запускается
```bash
cd pwa
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Всё готово! 🎉

После выполнения всех шагов выше приложение должно работать полностью.

**Тестовый сценарий:**
1. Регистрация → ✅
2. Создание группы → ✅
3. Создание задачи → ✅
4. Выполнение задачи → ✅
5. Получение баллов → ✅

Удачи! 🚀
