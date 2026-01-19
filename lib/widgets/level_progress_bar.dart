import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';

class LevelProgressBar extends StatelessWidget {
  final UserModel user;
  final bool showDetails;

  const LevelProgressBar({
    Key? key,
    required this.user,
    this.showDetails = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: Helpers.getLevelGradient(user.level),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Level and points
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Level
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.emoji_events,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Уровень ${user.level}',
                        style: AppTextStyles.heading3.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (showDetails)
                        Text(
                          '${user.experience} / ${user.xpForNextLevel} XP',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Colors.white.withOpacity(0.9),
                          ),
                        ),
                    ],
                  ),
                ],
              ),

              // Points
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 16,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  children: [
                    Icon(
                      Icons.stars,
                      color: AppColors.pointsGold,
                      size: 20,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${user.points}',
                      style: AppTextStyles.bodyLarge.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          if (showDetails) ...[
            const SizedBox(height: 16),

            // Progress bar
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: LinearProgressIndicator(
                value: user.levelProgress,
                backgroundColor: Colors.white.withOpacity(0.3),
                valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                minHeight: 12,
              ),
            ),

            const SizedBox(height: 8),

            // Progress text
            Text(
              '${(user.levelProgress * 100).toStringAsFixed(0)}% до следующего уровня',
              style: AppTextStyles.bodySmall.copyWith(
                color: Colors.white.withOpacity(0.9),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
