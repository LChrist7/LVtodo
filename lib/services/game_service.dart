import '../models/user_model.dart';
import '../models/task_model.dart';
import '../models/achievement_model.dart';
import 'database_service.dart';

class GameService {
  final DatabaseService _databaseService;

  GameService(this._databaseService);

  // Process task completion
  Future<GameReward> processTaskCompletion({
    required TaskModel task,
    required UserModel user,
  }) async {
    final wasOnTime = DateTime.now().isBefore(task.deadline);
    final pointsDelta = wasOnTime ? task.points : -task.points;
    final xpDelta = wasOnTime ? task.points : 0;

    // Update user progress
    await _databaseService.updateUserProgress(
      user.id,
      pointsDelta,
      xpDelta,
    );

    // Add to history
    await _databaseService.addTaskToHistory(task);

    // Check for achievements
    final newAchievements = await _checkAchievements(user, task);

    // Check for level up
    final newLevel = _calculateNewLevel(user.level, user.experience + xpDelta);
    final didLevelUp = newLevel > user.level;

    return GameReward(
      pointsEarned: pointsDelta,
      xpEarned: xpDelta,
      didLevelUp: didLevelUp,
      newLevel: newLevel,
      newAchievements: newAchievements,
      wasOnTime: wasOnTime,
    );
  }

  // Calculate new level
  int _calculateNewLevel(int currentLevel, int totalXp) {
    int level = currentLevel;
    int remainingXp = totalXp;

    while (remainingXp >= (level * 100 * 1.5).round()) {
      remainingXp -= (level * 100 * 1.5).round();
      level++;
    }

    return level;
  }

  // Check for new achievements
  Future<List<Achievement>> _checkAchievements(
    UserModel user,
    TaskModel task,
  ) async {
    final newAchievements = <Achievement>[];
    final userAchievements = await _databaseService
        .getUserAchievements(user.id)
        .first;

    final unlockedTypes = userAchievements.map((a) => a.type).toSet();

    // Get statistics
    final stats = await _databaseService.getUserStatistics(user.id, task.groupId);
    final totalTasks = stats['totalTasks'] as int;

    // Check task count achievements
    if (!unlockedTypes.contains(AchievementType.firstTask) && totalTasks >= 1) {
      await _databaseService.unlockAchievement(
        user.id,
        AchievementType.firstTask,
        totalTasks,
      );
      newAchievements.add(
        Achievement.allAchievements.firstWhere((a) => a.type == AchievementType.firstTask),
      );
    }

    if (!unlockedTypes.contains(AchievementType.tasks10) && totalTasks >= 10) {
      await _databaseService.unlockAchievement(
        user.id,
        AchievementType.tasks10,
        totalTasks,
      );
      newAchievements.add(
        Achievement.allAchievements.firstWhere((a) => a.type == AchievementType.tasks10),
      );
    }

    if (!unlockedTypes.contains(AchievementType.tasks50) && totalTasks >= 50) {
      await _databaseService.unlockAchievement(
        user.id,
        AchievementType.tasks50,
        totalTasks,
      );
      newAchievements.add(
        Achievement.allAchievements.firstWhere((a) => a.type == AchievementType.tasks50),
      );
    }

    if (!unlockedTypes.contains(AchievementType.tasks100) && totalTasks >= 100) {
      await _databaseService.unlockAchievement(
        user.id,
        AchievementType.tasks100,
        totalTasks,
      );
      newAchievements.add(
        Achievement.allAchievements.firstWhere((a) => a.type == AchievementType.tasks100),
      );
    }

    // Check speed runner achievement
    if (!unlockedTypes.contains(AchievementType.speedRunner)) {
      final completionTime = task.completedAt!.difference(task.createdAt);
      final totalTime = task.deadline.difference(task.createdAt);
      final completionPercentage = completionTime.inMilliseconds / totalTime.inMilliseconds;

      if (completionPercentage <= 0.2) {
        await _databaseService.unlockAchievement(
          user.id,
          AchievementType.speedRunner,
          1,
        );
        newAchievements.add(
          Achievement.allAchievements.firstWhere((a) => a.type == AchievementType.speedRunner),
        );
      }
    }

    // Check level achievements
    if (!unlockedTypes.contains(AchievementType.levelUp5) && user.level >= 5) {
      await _databaseService.unlockAchievement(
        user.id,
        AchievementType.levelUp5,
        user.level,
      );
      newAchievements.add(
        Achievement.allAchievements.firstWhere((a) => a.type == AchievementType.levelUp5),
      );
    }

    if (!unlockedTypes.contains(AchievementType.levelUp10) && user.level >= 10) {
      await _databaseService.unlockAchievement(
        user.id,
        AchievementType.levelUp10,
        user.level,
      );
      newAchievements.add(
        Achievement.allAchievements.firstWhere((a) => a.type == AchievementType.levelUp10),
      );
    }

    // Check points collector achievement
    if (!unlockedTypes.contains(AchievementType.pointsCollector) && user.points >= 1000) {
      await _databaseService.unlockAchievement(
        user.id,
        AchievementType.pointsCollector,
        user.points,
      );
      newAchievements.add(
        Achievement.allAchievements.firstWhere((a) => a.type == AchievementType.pointsCollector),
      );
    }

    return newAchievements;
  }

  // Get level progress info
  static LevelInfo getLevelInfo(int level, int experience) {
    final xpForNextLevel = (level * 100 * 1.5).round();
    final progress = experience / xpForNextLevel;

    return LevelInfo(
      level: level,
      experience: experience,
      xpForNextLevel: xpForNextLevel,
      progress: progress.clamp(0.0, 1.0),
    );
  }
}

class GameReward {
  final int pointsEarned;
  final int xpEarned;
  final bool didLevelUp;
  final int newLevel;
  final List<Achievement> newAchievements;
  final bool wasOnTime;

  GameReward({
    required this.pointsEarned,
    required this.xpEarned,
    required this.didLevelUp,
    required this.newLevel,
    required this.newAchievements,
    required this.wasOnTime,
  });
}

class LevelInfo {
  final int level;
  final int experience;
  final int xpForNextLevel;
  final double progress;

  LevelInfo({
    required this.level,
    required this.experience,
    required this.xpForNextLevel,
    required this.progress,
  });
}
