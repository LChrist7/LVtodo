#!/bin/bash

echo "🔧 Исправление структуры Flutter проекта LVTodo"
echo "================================================"

# Проверка наличия Flutter
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter не найден. Установите Flutter: https://flutter.dev/docs/get-started/install"
    exit 1
fi

echo "✅ Flutter найден: $(flutter --version | head -1)"

# Текущая директория
PROJECT_DIR="/home/user/LVtodo"
cd "$PROJECT_DIR"

echo ""
echo "Выберите метод исправления:"
echo "1. Автоматическое создание платформенных файлов (рекомендуется)"
echo "2. Создать новый проект и скопировать код"
echo "3. Отмена"
read -p "Ваш выбор (1-3): " choice

case $choice in
    1)
        echo ""
        echo "📝 Метод 1: Автоматическое создание"
        echo "Создаю платформенные файлы..."

        # Создаем платформенные файлы
        flutter create --org com.example --platforms=android,ios . --overwrite

        echo "✅ Платформенные файлы созданы"

        # Получаем зависимости
        echo "📦 Получение зависимостей..."
        flutter pub get

        echo ""
        echo "✅ Готово! Проект исправлен."
        echo ""
        echo "Следующие шаги:"
        echo "1. Добавьте google-services.json в android/app/"
        echo "2. Добавьте GoogleService-Info.plist в ios/Runner через Xcode"
        echo "3. Запустите: flutter run"
        ;;

    2)
        echo ""
        echo "📝 Метод 2: Создание нового проекта"

        # Создаем резервную копию
        echo "💾 Создание резервной копии кода..."
        BACKUP_DIR="/home/user/LVtodo_backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        cp -r lib "$BACKUP_DIR/"
        cp -r functions "$BACKUP_DIR/" 2>/dev/null || true
        cp pubspec.yaml "$BACKUP_DIR/" 2>/dev/null || true
        cp firebase.json "$BACKUP_DIR/" 2>/dev/null || true
        cp firestore.* "$BACKUP_DIR/" 2>/dev/null || true
        cp README.md "$BACKUP_DIR/" 2>/dev/null || true

        echo "✅ Резервная копия создана: $BACKUP_DIR"

        # Создаем новый проект
        echo "🆕 Создание нового Flutter проекта..."
        cd /home/user
        flutter create --org com.example lvtodo_new

        # Копируем код обратно
        echo "📋 Копирование кода..."
        cd lvtodo_new
        rm -rf lib/*
        cp -r "$BACKUP_DIR/lib/"* lib/
        cp -r "$BACKUP_DIR/functions" . 2>/dev/null || true
        cp "$BACKUP_DIR/pubspec.yaml" . 2>/dev/null || true
        cp "$BACKUP_DIR/firebase.json" . 2>/dev/null || true
        cp "$BACKUP_DIR/firestore."* . 2>/dev/null || true
        cp "$BACKUP_DIR/README.md" . 2>/dev/null || true

        # Получаем зависимости
        echo "📦 Получение зависимостей..."
        flutter pub get

        echo ""
        echo "✅ Готово! Новый проект создан в /home/user/lvtodo_new"
        echo "Старый проект сохранен в: $BACKUP_DIR"
        echo ""
        echo "Следующие шаги:"
        echo "1. cd /home/user/lvtodo_new"
        echo "2. Добавьте google-services.json в android/app/"
        echo "3. Добавьте GoogleService-Info.plist в ios/Runner через Xcode"
        echo "4. Запустите: flutter run"
        ;;

    3)
        echo "Отменено."
        exit 0
        ;;

    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

echo ""
echo "🎉 Исправление завершено!"
