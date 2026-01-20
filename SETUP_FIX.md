# Исправление структуры проекта Flutter

## Проблема
Проект содержит только код приложения, но не имеет полной структуры Flutter проекта для Android/iOS.

## Решение

### Метод 1: Автоматическое создание (РЕКОМЕНДУЕТСЯ)

```bash
cd /home/user/LVtodo

# Создайте платформенные файлы автоматически
flutter create --org com.example --platforms=android,ios .

# Когда спросит о перезаписи файлов:
# - Нажмите 'a' (all) для перезаписи всех файлов в android/ и ios/
# - Или выборочно: 'y' для android/ios файлов, 'n' для lib/ файлов

# Получите зависимости
flutter pub get

# Запустите
flutter run
```

### Метод 2: Создание нового проекта (если Метод 1 не работает)

```bash
# 1. Создайте резервную копию кода
cd /home/user
cp -r LVtodo/lib LVtodo_code_backup
cp -r LVtodo/functions LVtodo_code_backup/
cp LVtodo/pubspec.yaml LVtodo_code_backup/
cp LVtodo/firebase.json LVtodo_code_backup/
cp LVtodo/firestore.* LVtodo_code_backup/

# 2. Создайте новый Flutter проект
flutter create --org com.example lvtodo_fixed

# 3. Скопируйте код обратно
cd lvtodo_fixed
rm -rf lib/*
cp -r ../LVtodo_code_backup/lib/* lib/
cp -r ../LVtodo_code_backup/functions .
cp ../LVtodo_code_backup/pubspec.yaml .
cp ../LVtodo_code_backup/firebase.json .
cp ../LVtodo_code_backup/firestore.* .

# 4. Получите зависимости
flutter pub get

# 5. Запустите
flutter run
```

### Метод 3: Клонирование с GitHub и замена кода

```bash
# 1. Клонируйте ваш репозиторий
cd /home/user
git clone <URL_вашего_репозитория> LVtodo_from_git
cd LVtodo_from_git

# 2. Переключитесь на рабочую ветку
git checkout claude/cross-platform-mobile-app-3vxpy

# 3. Создайте новый Flutter проект поверх
flutter create --org com.example .

# Когда спросит о перезаписи - выберите 'n' для lib/ файлов

# 4. Получите зависимости
flutter pub get

# 5. Запустите
flutter run
```

## Проверка после исправления

После любого из методов выполните:

```bash
# Проверьте структуру проекта
ls -la android/
ls -la ios/

# Должны быть:
# android/app/build.gradle
# android/build.gradle
# android/settings.gradle
# ios/Podfile
# ios/Runner.xcodeproj/

# Проверьте Flutter
flutter doctor

# Запустите
flutter run
```

## Настройка Firebase после исправления

### Android:
```bash
# Поместите google-services.json в:
# android/app/google-services.json

# Обновите android/app/build.gradle
# Убедитесь что в конце есть:
# apply plugin: 'com.google.gms.google-services'
```

### iOS:
```bash
# 1. Откройте проект
open ios/Runner.xcworkspace

# 2. В Xcode добавьте GoogleService-Info.plist
# Перетащите файл в Runner папку

# 3. Установите pods
cd ios
pod install
cd ..
```

## Если все еще не работает

Обратитесь к официальной документации Flutter:
https://docs.flutter.dev/get-started/install

Или создайте Issue на GitHub с описанием ошибки.
