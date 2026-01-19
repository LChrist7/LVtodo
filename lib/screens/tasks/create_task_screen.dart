import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../models/task_model.dart';
import '../../services/database_service.dart';
import '../../utils/constants.dart';
import '../../utils/helpers.dart';

class CreateTaskScreen extends StatefulWidget {
  final String userId;
  final String groupId;

  const CreateTaskScreen({
    Key? key,
    required this.userId,
    required this.groupId,
  }) : super(key: key);

  @override
  State<CreateTaskScreen> createState() => _CreateTaskScreenState();
}

class _CreateTaskScreenState extends State<CreateTaskScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descriptionController = TextEditingController();
  final _databaseService = DatabaseService();
  TaskDifficulty _difficulty = TaskDifficulty.easy;
  DateTime? _deadline;
  String? _selectedAssigneeId;
  List<UserModel> _members = [];
  List<String> _suggestions = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadMembers();
    _loadSuggestions();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    super.dispose();
  }

  Future<void> _loadMembers() async {
    final members = await _databaseService.getGroupMembers(widget.groupId);
    setState(() {
      _members = members.where((m) => m.id != widget.userId).toList();
      if (_members.isNotEmpty) {
        _selectedAssigneeId = _members.first.id;
      }
    });
  }

  Future<void> _loadSuggestions() async {
    final suggestions = await _databaseService.getTaskSuggestions(
      widget.userId,
      widget.groupId,
    );
    setState(() => _suggestions = suggestions);
  }

  Future<void> _handleCreate() async {
    if (!_formKey.currentState!.validate()) return;
    if (_deadline == null) {
      Helpers.showSnackBar(context, 'Выберите срок выполнения', isError: true);
      return;
    }
    if (_selectedAssigneeId == null) {
      Helpers.showSnackBar(context, 'Выберите исполнителя', isError: true);
      return;
    }

    setState(() => _isLoading = true);

    try {
      await _databaseService.createTask(
        groupId: widget.groupId,
        creatorId: widget.userId,
        assigneeId: _selectedAssigneeId!,
        description: _descriptionController.text.trim(),
        difficulty: _difficulty,
        deadline: _deadline!,
      );

      if (mounted) {
        Helpers.showSnackBar(context, 'Задание создано!');
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Новое задание'),
        backgroundColor: AppColors.primary,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Description
              TextFormField(
                controller: _descriptionController,
                decoration: InputDecoration(
                  labelText: 'Описание задания',
                  hintText: 'Например: Пропылесосить дом',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  prefixIcon: const Icon(Icons.description_outlined),
                ),
                maxLines: 3,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Введите описание';
                  }
                  return null;
                },
              ),

              // Suggestions
              if (_suggestions.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text(
                  'Недавние задания:',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _suggestions.take(5).map((suggestion) {
                    return ActionChip(
                      label: Text(
                        suggestion,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      onPressed: () {
                        _descriptionController.text = suggestion;
                      },
                    );
                  }).toList(),
                ),
              ],

              const SizedBox(height: 24),

              // Assignee
              DropdownButtonFormField<String>(
                value: _selectedAssigneeId,
                decoration: InputDecoration(
                  labelText: 'Исполнитель',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  prefixIcon: const Icon(Icons.person_outlined),
                ),
                items: _members.map((member) {
                  return DropdownMenuItem(
                    value: member.id,
                    child: Row(
                      children: [
                        Text(member.nickname),
                        const SizedBox(width: 8),
                        Text(
                          'Lvl ${member.level}',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textLight,
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
                onChanged: (value) {
                  setState(() => _selectedAssigneeId = value);
                },
              ),

              const SizedBox(height: 24),

              // Difficulty
              Text(
                'Сложность',
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildDifficultyCard(
                      TaskDifficulty.easy,
                      'Легкое',
                      '${AppConstants.easyTaskPoints} баллов',
                      Icons.star,
                      AppColors.easyTask,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _buildDifficultyCard(
                      TaskDifficulty.hard,
                      'Сложное',
                      '${AppConstants.hardTaskPoints} баллов',
                      Icons.stars,
                      AppColors.hardTask,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Deadline
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: ListTile(
                  leading: const Icon(Icons.calendar_today),
                  title: const Text('Срок выполнения'),
                  subtitle: Text(
                    _deadline != null
                        ? Helpers.formatDateTime(_deadline!)
                        : 'Выберите дату и время',
                  ),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: _pickDeadline,
                ),
              ),

              const SizedBox(height: 32),

              // Create button
              ElevatedButton(
                onPressed: _isLoading ? null : _handleCreate,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(
                        'Создать задание',
                        style: AppTextStyles.button,
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDifficultyCard(
    TaskDifficulty difficulty,
    String title,
    String points,
    IconData icon,
    Color color,
  ) {
    final isSelected = _difficulty == difficulty;

    return InkWell(
      onTap: () => setState(() => _difficulty = difficulty),
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? color.withOpacity(0.1) : Colors.transparent,
          border: Border.all(
            color: isSelected ? color : Colors.grey[300]!,
            width: isSelected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 32,
              color: isSelected ? color : Colors.grey,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: AppTextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.bold,
                color: isSelected ? color : AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              points,
              style: AppTextStyles.bodySmall.copyWith(
                color: isSelected ? color : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickDeadline() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (date == null) return;

    if (!mounted) return;

    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );

    if (time == null) return;

    setState(() {
      _deadline = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      );
    });
  }
}
