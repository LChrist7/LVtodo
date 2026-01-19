import 'package:flutter/material.dart';
import '../models/task_model.dart';
import '../models/user_model.dart';
import '../utils/constants.dart';
import '../utils/helpers.dart';

class TaskCard extends StatelessWidget {
  final TaskModel task;
  final UserModel? creator;
  final UserModel? assignee;
  final VoidCallback? onTap;
  final bool showAssignee;

  const TaskCard({
    Key? key,
    required this.task,
    this.creator,
    this.assignee,
    this.onTap,
    this.showAssignee = true,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final timePercentage = task.timeRemainingPercentage;
    final timeColor = Helpers.getTimeColor(timePercentage);
    final isOverdue = task.isOverdue;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: isOverdue ? AppColors.error : Colors.transparent,
          width: 2,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header with difficulty badge
              Row(
                children: [
                  // Difficulty badge
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: task.difficulty == TaskDifficulty.easy
                          ? AppColors.easyTask
                          : AppColors.hardTask,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          task.difficulty == TaskDifficulty.easy
                              ? Icons.star
                              : Icons.stars,
                          color: Colors.white,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '${task.points} баллов',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Spacer(),
                  // Status indicator
                  if (task.status == TaskStatus.disputed)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.warning,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'Оспорено',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 12),

              // Task description
              Text(
                task.description,
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),

              // Progress bar
              if (!isOverdue) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: 1 - timePercentage,
                    backgroundColor: Colors.grey[200],
                    valueColor: AlwaysStoppedAnimation<Color>(timeColor),
                    minHeight: 8,
                  ),
                ),
                const SizedBox(height: 8),
              ],

              // Time remaining and assignee
              Row(
                children: [
                  Icon(
                    isOverdue ? Icons.warning : Icons.access_time,
                    size: 16,
                    color: isOverdue ? AppColors.error : timeColor,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    isOverdue
                        ? 'Просрочено'
                        : Helpers.getTimeRemainingText(task.deadline),
                    style: AppTextStyles.bodySmall.copyWith(
                      color: isOverdue ? AppColors.error : timeColor,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (showAssignee && assignee != null) ...[
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.person,
                            size: 14,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            assignee!.nickname,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),

              // Deadline
              const SizedBox(height: 4),
              Text(
                'До: ${Helpers.formatDateTime(task.deadline)}',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textLight,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
