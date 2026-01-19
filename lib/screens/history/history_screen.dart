import 'package:flutter/material.dart';
import '../../models/task_history_model.dart';
import '../../services/database_service.dart';
import '../../utils/constants.dart';
import '../../utils/helpers.dart';

class HistoryScreen extends StatelessWidget {
  final String userId;
  final String groupId;

  const HistoryScreen({
    Key? key,
    required this.userId,
    required this.groupId,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final _databaseService = DatabaseService();

    return Scaffold(
      appBar: AppBar(
        title: const Text('История'),
        backgroundColor: AppColors.primary,
      ),
      body: Column(
        children: [
          // Statistics
          FutureBuilder<Map<String, dynamic>>(
            future: _databaseService.getUserStatistics(userId, groupId),
            builder: (context, snapshot) {
              if (!snapshot.hasData) {
                return const LinearProgressIndicator();
              }

              final stats = snapshot.data!;
              return Container(
                padding: const EdgeInsets.all(16),
                color: AppColors.primary.withOpacity(0.1),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem(
                      'Всего',
                      '${stats['totalTasks']}',
                      Icons.task_alt,
                    ),
                    _buildStatItem(
                      'Вовремя',
                      '${stats['completedOnTime']}',
                      Icons.check_circle,
                    ),
                    _buildStatItem(
                      'Среднее время',
                      Helpers.formatDuration(
                          stats['averageCompletionTime'] as Duration),
                      Icons.timer,
                    ),
                  ],
                ),
              );
            },
          ),

          // History list
          Expanded(
            child: StreamBuilder<List<TaskHistoryModel>>(
              stream: _databaseService.getTaskHistory(userId, groupId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.history, size: 80, color: AppColors.textLight),
                        const SizedBox(height: 16),
                        Text(
                          'История пуста',
                          style: AppTextStyles.heading3.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  );
                }

                final history = snapshot.data!;
                return ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: history.length,
                  itemBuilder: (context, index) {
                    final item = history[index];
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: item.wasOnTime
                              ? AppColors.success.withOpacity(0.2)
                              : AppColors.error.withOpacity(0.2),
                          child: Icon(
                            item.wasOnTime ? Icons.check : Icons.close,
                            color: item.wasOnTime
                                ? AppColors.success
                                : AppColors.error,
                          ),
                        ),
                        title: Text(
                          item.description,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        subtitle: Text(
                          '${Helpers.formatDateTime(item.completedAt)} • ${Helpers.formatDuration(item.completionTime)}',
                          style: AppTextStyles.bodySmall,
                        ),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: item.pointsEarned > 0
                                ? AppColors.success.withOpacity(0.2)
                                : AppColors.error.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${item.pointsEarned > 0 ? '+' : ''}${item.pointsEarned}',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: item.pointsEarned > 0
                                  ? AppColors.success
                                  : AppColors.error,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: AppColors.primary),
        const SizedBox(height: 4),
        Text(
          value,
          style: AppTextStyles.heading3,
        ),
        Text(
          label,
          style: AppTextStyles.bodySmall,
        ),
      ],
    );
  }
}
