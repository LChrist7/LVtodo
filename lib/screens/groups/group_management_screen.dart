import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/group_model.dart';
import '../../models/user_model.dart';
import '../../services/database_service.dart';
import '../../utils/constants.dart';
import '../../utils/helpers.dart';

class GroupManagementScreen extends StatefulWidget {
  final String userId;

  const GroupManagementScreen({Key? key, required this.userId})
      : super(key: key);

  @override
  State<GroupManagementScreen> createState() => _GroupManagementScreenState();
}

class _GroupManagementScreenState extends State<GroupManagementScreen> {
  final _databaseService = DatabaseService();

  void _showCreateGroupDialog() {
    final nameController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Создать группу'),
        content: TextField(
          controller: nameController,
          decoration: const InputDecoration(
            labelText: 'Название группы',
            hintText: 'Семья, Друзья, и т.д.',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (nameController.text.isEmpty) return;

              await _databaseService.createGroup(
                name: nameController.text,
                creatorId: widget.userId,
              );

              if (context.mounted) {
                Navigator.pop(context);
                Helpers.showSnackBar(context, 'Группа создана!');
              }
            },
            child: const Text('Создать'),
          ),
        ],
      ),
    );
  }

  void _showJoinGroupDialog() {
    final codeController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Присоединиться к группе'),
        content: TextField(
          controller: codeController,
          decoration: const InputDecoration(
            labelText: 'Код приглашения',
            hintText: 'ABC123',
          ),
          textCapitalization: TextCapitalization.characters,
          maxLength: 6,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (codeController.text.isEmpty) return;

              final group = await _databaseService.joinGroup(
                codeController.text.trim().toUpperCase(),
                widget.userId,
              );

              if (context.mounted) {
                Navigator.pop(context);
                if (group != null) {
                  Helpers.showSnackBar(
                      context, 'Вы присоединились к группе ${group.name}');
                } else {
                  Helpers.showSnackBar(
                    context,
                    'Группа не найдена',
                    isError: true,
                  );
                }
              }
            },
            child: const Text('Присоединиться'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Управление группами'),
        backgroundColor: AppColors.primary,
      ),
      body: StreamBuilder<List<GroupModel>>(
        stream: _databaseService.getUserGroups(widget.userId),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.group_add, size: 80, color: AppColors.textLight),
                  const SizedBox(height: 16),
                  Text(
                    'У вас нет групп',
                    style: AppTextStyles.heading3,
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _showCreateGroupDialog,
                    icon: const Icon(Icons.add),
                    label: const Text('Создать группу'),
                  ),
                  const SizedBox(height: 12),
                  OutlinedButton.icon(
                    onPressed: _showJoinGroupDialog,
                    icon: const Icon(Icons.group_add),
                    label: const Text('Присоединиться'),
                  ),
                ],
              ),
            );
          }

          final groups = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: groups.length + 1,
            itemBuilder: (context, index) {
              if (index == groups.length) {
                return Column(
                  children: [
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _showCreateGroupDialog,
                      icon: const Icon(Icons.add),
                      label: const Text('Создать группу'),
                    ),
                    const SizedBox(height: 8),
                    OutlinedButton.icon(
                      onPressed: _showJoinGroupDialog,
                      icon: const Icon(Icons.group_add),
                      label: const Text('Присоединиться к группе'),
                    ),
                  ],
                );
              }

              final group = groups[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ExpansionTile(
                  leading: const Icon(Icons.group),
                  title: Text(group.name),
                  subtitle: Text('${group.memberIds.length} участников'),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Invite code
                          Row(
                            children: [
                              Text(
                                'Код приглашения: ',
                                style: AppTextStyles.bodyMedium,
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  group.inviteCode ?? 'N/A',
                                  style: AppTextStyles.bodyLarge.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              IconButton(
                                icon: const Icon(Icons.copy, size: 20),
                                onPressed: () {
                                  if (group.inviteCode != null) {
                                    Clipboard.setData(ClipboardData(
                                        text: group.inviteCode!));
                                    Helpers.showSnackBar(
                                        context, 'Код скопирован');
                                  }
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Members
                          FutureBuilder<List<UserModel>>(
                            future:
                                _databaseService.getGroupMembers(group.id),
                            builder: (context, membersSnapshot) {
                              if (!membersSnapshot.hasData) {
                                return const CircularProgressIndicator();
                              }

                              final members = membersSnapshot.data!;
                              return Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Участники:',
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  ...members.map((member) => ListTile(
                                        dense: true,
                                        leading: CircleAvatar(
                                          child: Text(
                                            member.nickname[0].toUpperCase(),
                                          ),
                                        ),
                                        title: Text(member.nickname),
                                        subtitle:
                                            Text('Уровень ${member.level}'),
                                        trailing: Text(
                                          '${member.points} баллов',
                                          style: AppTextStyles.bodySmall,
                                        ),
                                      )),
                                ],
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
