# 📋 Таблица совместимости версий LVTodo

## ✅ Финальные версии (протестированы и совместимы)

### Gradle & Android

| Компонент | Версия | Файл |
|-----------|--------|------|
| Gradle Wrapper | 8.5 | `android/gradle/wrapper/gradle-wrapper.properties` |
| Android Gradle Plugin (AGP) | 8.2.2 | `android/build.gradle`, `android/settings.gradle` |
| Kotlin | 1.9.22 | `android/build.gradle`, `android/settings.gradle` |
| Java Target | 17 | `android/app/build.gradle` |
| compileSdk | 34 | `android/app/build.gradle` |
| minSdk | 21 | `android/app/build.gradle` |
| targetSdk | 34 | `android/app/build.gradle` |

### Firebase

| Пакет | Версия | Файл |
|-------|--------|------|
| Firebase BOM (Android) | 32.8.0 | `android/app/build.gradle` |
| firebase_core | ^2.25.4 | `pubspec.yaml` |
| firebase_auth | ^4.17.8 | `pubspec.yaml` |
| cloud_firestore | ^4.15.8 | `pubspec.yaml` |
| firebase_messaging | ^14.7.15 | `pubspec.yaml` |
| firebase_storage | ^11.6.9 | `pubspec.yaml` |
| Google Services Plugin | 4.4.0 | `android/build.gradle` |

### Flutter & Dart

| Компонент | Версия | Файл |
|-----------|--------|------|
| Flutter SDK | >=3.0.0 <4.0.0 | `pubspec.yaml` |
| Dart SDK | >=3.0.0 <4.0.0 | `pubspec.yaml` |

### Другие зависимости

| Пакет | Версия | Назначение |
|-------|--------|------------|
| provider | ^6.1.1 | State Management |
| flutter_local_notifications | ^16.3.0 | Локальные уведомления |
| confetti | ^0.7.0 | Анимация конфетти |
| lottie | ^2.7.0 | Анимации |
| intl | ^0.18.1 | Интернационализация |
| uuid | ^4.2.2 | Генерация UUID |
| multidex | 2.0.1 | Android MultiDex |

## 🔍 Проверенная совместимость

### ✅ Gradle 8.5
- Поддерживает Java 8-21
- Совместим с AGP 8.2.2
- Совместим с Kotlin 1.9.22
- **Минимальная версия для AGP 8.2+**

### ✅ Android Gradle Plugin 8.2.2
- Требует Gradle 8.2+
- Полностью совместим с Kotlin 1.9.22
- Поддерживает Java 17
- Исправляет баг с KotlinAndroidTarget

### ✅ Kotlin 1.9.22
- Совместим с AGP 8.2+
- Требует Gradle 8.0+
- Поддерживает Java 17

### ✅ Firebase BOM 32.8.0
- Последняя стабильная версия
- Автоматически управляет версиями всех Firebase библиотек
- Совместим с AGP 8.2+

## 🚫 Известные несовместимости

### ❌ НЕ совместимые комбинации:
- Gradle 7.x + Java 21 → **Ошибка: Unsupported class file major version 65**
- AGP 8.1.x + Kotlin 1.9.22 → **Ошибка: KotlinAndroidTarget**
- AGP 8.2+ + Gradle 7.x → **Требует Gradle 8.2+**
- Java 1.8 + AGP 8.2+ → **Рекомендуется Java 17+**

## 📱 Требования к системе

### Windows
- Java JDK: 17 или 21 (рекомендуется 17)
- Android Studio: Arctic Fox или новее
- Gradle: 8.5 (управляется wrapper)
- RAM: минимум 8GB (рекомендуется 16GB)

### macOS
- Xcode: 14.0 или новее
- CocoaPods: последняя версия
- Java JDK: 17 или 21
- RAM: минимум 8GB (рекомендуется 16GB)

### Linux
- Java JDK: 17 или 21
- Android SDK: последняя версия
- RAM: минимум 8GB (рекомендуется 16GB)

## 🔧 Gradle настройки

### gradle.properties
```properties
org.gradle.jvmargs=-Xmx4096M           # Heap для Gradle
kotlin.daemon.jvmargs=-Xmx2048M       # Heap для Kotlin daemon
android.useAndroidX=true              # Использовать AndroidX
android.enableJetifier=true           # Jetifier для миграции
```

## 📝 Обновление версий

### Перед обновлением любой версии:
1. Проверьте таблицу совместимости
2. Читайте changelog для breaking changes
3. Тестируйте на отдельной ветке
4. Очистите кэш: `flutter clean` и `rmdir build`

### Безопасные обновления (minor versions):
- Firebase пакеты (patch версии)
- Utility пакеты (provider, intl, etc.)

### Осторожно обновлять:
- Gradle (может потребовать обновление AGP)
- AGP (может потребовать обновление Kotlin)
- Kotlin (может потребовать обновление Gradle)
- Flutter SDK (тестируйте thoroughly)

## 🎯 Проверка совместимости

```bash
# Проверка Java версии
java -version
# Должно быть: version "17" или "21"

# Проверка Flutter
flutter doctor -v

# Проверка Gradle
cd android
./gradlew --version
# Gradle: 8.5
# Kotlin: 1.9.22
```

## 📚 Полезные ссылки

- [Android Gradle Plugin Release Notes](https://developer.android.com/studio/releases/gradle-plugin)
- [Kotlin Releases](https://kotlinlang.org/docs/releases.html)
- [Gradle Compatibility Matrix](https://docs.gradle.org/current/userguide/compatibility.html)
- [Firebase BoM Versions](https://firebase.google.com/support/release-notes/android)

---

**Последнее обновление:** 2025-01-20
**Статус:** ✅ Все версии протестированы и совместимы
