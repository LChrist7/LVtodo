import 'package:flutter/material.dart';
import '../../models/achievement_model.dart';
import '../../services/database_service.dart';
import '../../utils/constants.dart';
import '../../widgets/achievement_badge.dart';

class AchievementsScreen extends StatelessWidget {
  final String userId;

  const AchievementsScreen({Key? key, required this.userId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final _databaseService = DatabaseService();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Достижения'),
        backgroundColor: AppColors.primary,
      ),
      body: StreamBuilder<List<UserAchievement>>(
        stream: _databaseService.getUserAchievements(userId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          final userAchievements = snapshot.data ?? [];
          final unlockedTypes =
              userAchievements.map((a) => a.type).toSet();

          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.85,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: Achievement.allAchievements.length,
            itemBuilder: (context, index) {
              final achievement = Achievement.allAchievements[index];
              final isUnlocked = unlockedTypes.contains(achievement.type);

              return AchievementBadge(
                achievement: achievement,
                isUnlocked: isUnlocked,
              );
            },
          );
        },
      ),
    );
  }
}
