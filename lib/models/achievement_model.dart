import 'package:cloud_firestore/cloud_firestore.dart';

enum AchievementType {
  firstTask,
  tasks10,
  tasks50,
  tasks100,
  perfectWeek,
  speedRunner,
  levelUp5,
  levelUp10,
  pointsCollector,
}

class Achievement {
  final AchievementType type;
  final String title;
  final String description;
  final String emoji;
  final int requiredProgress;

  const Achievement({
    required this.type,
    required this.title,
    required this.description,
    required this.emoji,
    required this.requiredProgress,
  });

  static const List<Achievement> allAchievements = [
    Achievement(
      type: AchievementType.firstTask,
      title: 'Первый шаг',
      description: 'Выполните первое задание',
      emoji: '🎯',
      requiredProgress: 1,
    ),
    Achievement(
      type: AchievementType.tasks10,
      title: 'Начинающий',
      description: 'Выполните 10 заданий',
      emoji: '⭐',
      requiredProgress: 10,
    ),
    Achievement(
      type: AchievementType.tasks50,
      title: 'Опытный',
      description: 'Выполните 50 заданий',
      emoji: '🏆',
      requiredProgress: 50,
    ),
    Achievement(
      type: AchievementType.tasks100,
      title: 'Мастер',
      description: 'Выполните 100 заданий',
      emoji: '👑',
      requiredProgress: 100,
    ),
    Achievement(
      type: AchievementType.perfectWeek,
      title: 'Идеальная неделя',
      description: 'Выполните все задания за неделю вовремя',
      emoji: '💯',
      requiredProgress: 1,
    ),
    Achievement(
      type: AchievementType.speedRunner,
      title: 'Скоростной режим',
      description: 'Выполните задание за первые 20% времени',
      emoji: '⚡',
      requiredProgress: 1,
    ),
    Achievement(
      type: AchievementType.levelUp5,
      title: 'Уровень 5',
      description: 'Достигните 5 уровня',
      emoji: '🌟',
      requiredProgress: 5,
    ),
    Achievement(
      type: AchievementType.levelUp10,
      title: 'Уровень 10',
      description: 'Достигните 10 уровня',
      emoji: '💫',
      requiredProgress: 10,
    ),
    Achievement(
      type: AchievementType.pointsCollector,
      title: 'Коллекционер баллов',
      description: 'Накопите 1000 баллов',
      emoji: '💰',
      requiredProgress: 1000,
    ),
  ];
}

class UserAchievement {
  final String id;
  final String userId;
  final AchievementType type;
  final DateTime unlockedAt;
  final int progress;

  UserAchievement({
    required this.id,
    required this.userId,
    required this.type,
    required this.unlockedAt,
    required this.progress,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'type': type.name,
      'unlockedAt': Timestamp.fromDate(unlockedAt),
      'progress': progress,
    };
  }

  factory UserAchievement.fromMap(Map<String, dynamic> map) {
    return UserAchievement(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      type: AchievementType.values.firstWhere(
        (e) => e.name == map['type'],
        orElse: () => AchievementType.firstTask,
      ),
      unlockedAt: (map['unlockedAt'] as Timestamp).toDate(),
      progress: map['progress'] ?? 0,
    );
  }
}
