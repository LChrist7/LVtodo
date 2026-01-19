import 'package:flutter/material.dart';

class AppColors {
  // Primary colors - vibrant and game-like
  static const primary = Color(0xFF6C63FF);
  static const secondary = Color(0xFFFF6B9D);
  static const accent = Color(0xFFFFC107);

  // Background colors
  static const background = Color(0xFFF5F7FA);
  static const cardBackground = Colors.white;
  static const darkBackground = Color(0xFF1E1E2E);

  // Task difficulty colors
  static const easyTask = Color(0xFF4CAF50);
  static const hardTask = Color(0xFFFF5722);

  // Status colors
  static const success = Color(0xFF00C853);
  static const warning = Color(0xFFFFAB00);
  static const error = Color(0xFFFF1744);
  static const info = Color(0xFF2196F3);

  // Progress colors
  static const xpGreen = Color(0xFF4CAF50);
  static const pointsGold = Color(0xFFFFD700);

  // Text colors
  static const textPrimary = Color(0xFF2D3436);
  static const textSecondary = Color(0xFF636E72);
  static const textLight = Color(0xFFB2BEC3);

  // Time warning colors
  static const timeGood = Color(0xFF4CAF50);
  static const timeMedium = Color(0xFFFF9800);
  static const timeLow = Color(0xFFFF5722);
  static const timeCritical = Color(0xFFD32F2F);
}

class AppTextStyles {
  static const heading1 = TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  static const heading2 = TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  static const heading3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );

  static const bodyLarge = TextStyle(
    fontSize: 16,
    color: AppColors.textPrimary,
  );

  static const bodyMedium = TextStyle(
    fontSize: 14,
    color: AppColors.textSecondary,
  );

  static const bodySmall = TextStyle(
    fontSize: 12,
    color: AppColors.textLight,
  );

  static const button = TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: Colors.white,
  );
}

class AppConstants {
  // Task points
  static const int easyTaskPoints = 10;
  static const int hardTaskPoints = 25;

  // Reminder percentages
  static const List<double> reminderPercentages = [0.80, 0.50, 0.30, 0.05];

  // Animation durations
  static const Duration shortAnimation = Duration(milliseconds: 300);
  static const Duration mediumAnimation = Duration(milliseconds: 500);
  static const Duration longAnimation = Duration(milliseconds: 800);

  // Level calculation
  static const double levelMultiplier = 1.5;
  static const int baseXpPerLevel = 100;
}

class AppStrings {
  // Auth
  static const appName = 'LVTodo';
  static const login = 'Вход';
  static const register = 'Регистрация';
  static const email = 'Email';
  static const password = 'Пароль';
  static const nickname = 'Никнейм';
  static const forgotPassword = 'Забыли пароль?';

  // Tasks
  static const tasks = 'Задания';
  static const myTasks = 'Мои задания';
  static const createdTasks = 'Созданные задания';
  static const createTask = 'Создать задание';
  static const taskDescription = 'Описание задания';
  static const deadline = 'Срок выполнения';
  static const difficulty = 'Сложность';
  static const easy = 'Легкое';
  static const hard = 'Сложное';
  static const assignee = 'Исполнитель';
  static const complete = 'Выполнить';
  static const dispute = 'Оспорить';
  static const accept = 'Принять';

  // Profile
  static const profile = 'Профиль';
  static const level = 'Уровень';
  static const points = 'Баллы';
  static const experience = 'Опыт';
  static const statistics = 'Статистика';
  static const achievements = 'Достижения';

  // Wishes
  static const wishes = 'Желания';
  static const createWish = 'Создать желание';
  static const wishDescription = 'Описание желания';
  static const cost = 'Стоимость';
  static const purchase = 'Купить';

  // Groups
  static const groups = 'Группы';
  static const createGroup = 'Создать группу';
  static const joinGroup = 'Присоединиться к группе';
  static const groupName = 'Название группы';
  static const inviteCode = 'Код приглашения';
  static const members = 'Участники';

  // History
  static const history = 'История';
  static const completedTasks = 'Выполненные задания';
  static const totalTasks = 'Всего заданий';
  static const completedOnTime = 'Вовремя';
  static const averageTime = 'Среднее время';

  // Common
  static const save = 'Сохранить';
  static const cancel = 'Отмена';
  static const delete = 'Удалить';
  static const edit = 'Редактировать';
  static const loading = 'Загрузка...';
  static const error = 'Ошибка';
  static const success = 'Успешно';
}
