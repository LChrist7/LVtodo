import 'package:flutter/material.dart';
import 'package:confetti/confetti.dart';
import '../../models/task_model.dart';
import '../../models/user_model.dart';
import '../../services/database_service.dart';
import '../../services/game_service.dart';
import '../../utils/constants.dart';
import '../../utils/helpers.dart';

class TaskDetailScreen extends StatefulWidget {
  final TaskModel task;
  final UserModel currentUser;

  const TaskDetailScreen({
    Key? key,
    required this.task,
    required this.currentUser,
  }) : super(key: key);

  @override
  State<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends State<TaskDetailScreen> {
  final _databaseService = DatabaseService();
  late GameService _gameService;
  late ConfettiController _confettiController;
  final _disputeReasonController = TextEditingController();
  DateTime? _newDeadline;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _gameService = GameService(_databaseService);
    _confettiController = ConfettiController(duration: const Duration(seconds: 3));
  }

  @override
  void dispose() {
    _confettiController.dispose();
    _disputeReasonController.dispose();
    super.dispose();
  }

  Future<void> _handleComplete() async {
    final confirmed = await Helpers.showConfirmDialog(
      context,
      title: 'Завершить задание?',
      message: 'Вы уверены, что выполнили это задание?',
      confirmText: 'Да, выполнено',
    );

    if (!confirmed) return;

    setState(() => _isLoading = true);

    try {
      // Complete task
      await _databaseService.completeTask(widget.task.id);

      // Get updated task
      final updatedTask = widget.task.copyWith(
        status: TaskStatus.completed,
        completedAt: DateTime.now(),
      );

      // Process game rewards
      final reward = await _gameService.processTaskCompletion(
        task: updatedTask,
        user: widget.currentUser,
      );

      // Show confetti
      _confettiController.play();

      if (mounted) {
        // Show reward dialog
        await showDialog(
          context: context,
          builder: (context) => _buildRewardDialog(reward),
        );

        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(context, 'Ошибка: $e', isError: true);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleDispute() async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => _buildDisputeDialog(),
    );

    if (result != true || _newDeadline == null) return;

    setState(() => _isLoading = true);

    try {
      await _databaseService.disputeTask(
        widget.task.id,
        _disputeReasonController.text,
        _newDeadline!,
      );

      if (mounted) {
        Helpers.showSnackBar(context, 'Задание оспорено');
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(context, 'Ошибка: $e', isError: true);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleAcceptDispute() async {
    final confirmed = await Helpers.showConfirmDialog(
      context,
      title: 'Принять оспаривание?',
      message: 'Задание будет возвращено в активные с новым сроком.',
      confirmText: 'Принять',
    );

    if (!confirmed) return;

    setState(() => _isLoading = true);

    try {
      await _databaseService.acceptDispute(widget.task.id);

      if (mounted) {
        Helpers.showSnackBar(context, 'Оспаривание принято');
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(context, 'Ошибка: $e', isError: true);
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAssignee = widget.task.assigneeId == widget.currentUser.id;
    final isCreator = widget.task.creatorId == widget.currentUser.id;
    final timePercentage = widget.task.timeRemainingPercentage;
    final timeColor = Helpers.getTimeColor(timePercentage);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Детали задания'),
        backgroundColor: AppColors.primary,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Task card
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Difficulty badge
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: widget.task.difficulty == TaskDifficulty.easy
                                    ? AppColors.easyTask
                                    : AppColors.hardTask,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    widget.task.difficulty == TaskDifficulty.easy
                                        ? Icons.star
                                        : Icons.stars,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '${widget.task.points} баллов',
                                    style: AppTextStyles.bodyLarge.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const Spacer(),
                            if (widget.task.status == TaskStatus.disputed)
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.warning,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'Оспорено',
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 20),

                        // Description
                        Text(
                          widget.task.description,
                          style: AppTextStyles.heading2,
                        ),
                        const SizedBox(height: 24),

                        // Time info
                        _buildInfoRow(
                          Icons.access_time,
                          'Срок выполнения',
                          Helpers.formatDateTime(widget.task.deadline),
                          timeColor,
                        ),
                        const SizedBox(height: 12),
                        _buildInfoRow(
                          Icons.calendar_today,
                          'Создано',
                          Helpers.formatDateTime(widget.task.createdAt),
                        ),

                        // Progress bar
                        if (widget.task.status == TaskStatus.active) ...[
                          const SizedBox(height: 20),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: LinearProgressIndicator(
                              value: 1 - timePercentage,
                              backgroundColor: Colors.grey[200],
                              valueColor: AlwaysStoppedAnimation<Color>(timeColor),
                              minHeight: 12,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            Helpers.getTimeRemainingText(widget.task.deadline),
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: timeColor,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],

                        // Dispute reason
                        if (widget.task.status == TaskStatus.disputed &&
                            widget.task.disputeReason != null) ...[
                          const SizedBox(height: 20),
                          const Divider(),
                          const SizedBox(height: 12),
                          Text(
                            'Причина оспаривания:',
                            style: AppTextStyles.bodyMedium.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            widget.task.disputeReason!,
                            style: AppTextStyles.bodyMedium,
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Actions
                if (isAssignee && widget.task.status == TaskStatus.active) ...[
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _handleComplete,
                    icon: const Icon(Icons.check_circle),
                    label: const Text('Выполнено'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.success,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _isLoading ? null : _handleDispute,
                    icon: const Icon(Icons.report_problem_outlined),
                    label: const Text('Оспорить'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ],

                if (isCreator && widget.task.status == TaskStatus.disputed) ...[
                  ElevatedButton.icon(
                    onPressed: _isLoading ? null : _handleAcceptDispute,
                    icon: const Icon(Icons.check),
                    label: const Text('Принять оспаривание'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Confetti
          Align(
            alignment: Alignment.topCenter,
            child: ConfettiWidget(
              confettiController: _confettiController,
              blastDirectionality: BlastDirectionality.explosive,
              colors: const [
                Colors.green,
                Colors.blue,
                Colors.pink,
                Colors.orange,
                Colors.purple,
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value, [Color? color]) {
    return Row(
      children: [
        Icon(icon, size: 20, color: color ?? AppColors.textSecondary),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              color: color ?? AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRewardDialog(dynamic reward) {
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            reward.wasOnTime ? Icons.celebration : Icons.warning,
            size: 80,
            color: reward.wasOnTime ? AppColors.success : AppColors.error,
          ),
          const SizedBox(height: 16),
          Text(
            reward.wasOnTime ? 'Поздравляем!' : 'Просрочено',
            style: AppTextStyles.heading2,
          ),
          const SizedBox(height: 8),
          Text(
            reward.wasOnTime
                ? 'Задание выполнено вовремя!'
                : 'Задание выполнено с опозданием',
            style: AppTextStyles.bodyMedium,
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          _buildRewardItem(
            '${reward.pointsEarned > 0 ? '+' : ''}${reward.pointsEarned}',
            'баллов',
            reward.pointsEarned > 0 ? AppColors.success : AppColors.error,
          ),
          if (reward.wasOnTime) ...[
            const SizedBox(height: 12),
            _buildRewardItem(
              '+${reward.xpEarned}',
              'опыта',
              AppColors.xpGreen,
            ),
          ],
          if (reward.didLevelUp) ...[
            const SizedBox(height: 12),
            _buildRewardItem(
              'Уровень ${reward.newLevel}',
              'Повышение уровня!',
              AppColors.accent,
            ),
          ],
          if (reward.newAchievements.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            Text(
              'Новые достижения:',
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            ...reward.newAchievements.map((achievement) => Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    '${achievement.emoji} ${achievement.title}',
                    style: AppTextStyles.bodyLarge,
                  ),
                )),
          ],
        ],
      ),
      actions: [
        ElevatedButton(
          onPressed: () => Navigator.of(context).pop(),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
          ),
          child: const Text('Отлично!'),
        ),
      ],
    );
  }

  Widget _buildRewardItem(String value, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            value,
            style: AppTextStyles.heading3.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            label,
            style: AppTextStyles.bodyMedium.copyWith(color: color),
          ),
        ],
      ),
    );
  }

  Widget _buildDisputeDialog() {
    return AlertDialog(
      title: const Text('Оспорить задание'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _disputeReasonController,
            decoration: const InputDecoration(
              labelText: 'Причина',
              hintText: 'Почему нужно больше времени?',
              border: OutlineInputBorder(),
            ),
            maxLines: 3,
          ),
          const SizedBox(height: 16),
          ListTile(
            title: const Text('Новый срок'),
            subtitle: Text(
              _newDeadline != null
                  ? Helpers.formatDateTime(_newDeadline!)
                  : 'Выберите дату',
            ),
            trailing: const Icon(Icons.calendar_today),
            onTap: () async {
              final date = await showDatePicker(
                context: context,
                initialDate: widget.task.deadline.add(const Duration(days: 1)),
                firstDate: DateTime.now(),
                lastDate: DateTime.now().add(const Duration(days: 365)),
              );
              if (date != null) {
                final time = await showTimePicker(
                  context: context,
                  initialTime: TimeOfDay.fromDateTime(widget.task.deadline),
                );
                if (time != null) {
                  setState(() {
                    _newDeadline = DateTime(
                      date.year,
                      date.month,
                      date.day,
                      time.hour,
                      time.minute,
                    );
                  });
                }
              }
            },
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(false),
          child: const Text('Отмена'),
        ),
        ElevatedButton(
          onPressed: _newDeadline != null
              ? () => Navigator.of(context).pop(true)
              : null,
          child: const Text('Оспорить'),
        ),
      ],
    );
  }
}
