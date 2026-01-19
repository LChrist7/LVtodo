import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../../models/user_model.dart';
import '../../models/task_model.dart';
import '../../models/group_model.dart';
import '../../services/auth_service.dart';
import '../../services/database_service.dart';
import '../../utils/constants.dart';
import '../../widgets/task_card.dart';
import '../../widgets/level_progress_bar.dart';
import '../tasks/create_task_screen.dart';
import '../tasks/task_detail_screen.dart';
import '../profile/profile_screen.dart';
import '../wishes/wishes_shop_screen.dart';
import '../history/history_screen.dart';
import '../achievements/achievements_screen.dart';
import '../groups/group_management_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  final _authService = AuthService();
  final _databaseService = DatabaseService();
  late TabController _tabController;
  int _selectedIndex = 0;
  String? _selectedGroupId;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final currentUserId = _authService.currentUser?.uid;
    if (currentUserId == null) return const SizedBox();

    return Scaffold(
      body: _selectedIndex == 0
          ? _buildHomeTab(currentUserId)
          : _selectedIndex == 1
              ? ProfileScreen(userId: currentUserId)
              : _selectedIndex == 2
                  ? WishesShopScreen(userId: currentUserId)
                  : AchievementsScreen(userId: currentUserId),
      floatingActionButton: _selectedIndex == 0 && _selectedGroupId != null
          ? FloatingActionButton.extended(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => CreateTaskScreen(
                      userId: currentUserId,
                      groupId: _selectedGroupId!,
                    ),
                  ),
                );
              },
              backgroundColor: AppColors.primary,
              icon: const Icon(Icons.add),
              label: const Text('Задание'),
            )
          : null,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textLight,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Задания',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Профиль',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.card_giftcard),
            label: 'Желания',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.emoji_events),
            label: 'Награды',
          ),
        ],
      ),
    );
  }

  Widget _buildHomeTab(String userId) {
    return StreamBuilder<UserModel?>(
      stream: _databaseService.getUserStream(userId),
      builder: (context, userSnapshot) {
        if (!userSnapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }

        final user = userSnapshot.data!;

        return StreamBuilder<List<GroupModel>>(
          stream: _databaseService.getUserGroups(userId),
          builder: (context, groupsSnapshot) {
            if (!groupsSnapshot.hasData) {
              return const Center(child: CircularProgressIndicator());
            }

            final groups = groupsSnapshot.data!;
            if (groups.isEmpty) {
              return _buildNoGroupsView(user);
            }

            // Set default group if not selected
            if (_selectedGroupId == null && groups.isNotEmpty) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                setState(() => _selectedGroupId = groups.first.id);
              });
            }

            return CustomScrollView(
              slivers: [
                // App bar
                SliverAppBar(
                  expandedHeight: 200,
                  pinned: true,
                  backgroundColor: AppColors.primary,
                  flexibleSpace: FlexibleSpaceBar(
                    title: Text(
                      AppStrings.appName,
                      style: AppTextStyles.heading3.copyWith(
                        color: Colors.white,
                      ),
                    ),
                    background: Container(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          LevelProgressBar(user: user, showDetails: false),
                        ],
                      ),
                    ),
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.history),
                      onPressed: () {
                        if (_selectedGroupId != null) {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => HistoryScreen(
                                userId: userId,
                                groupId: _selectedGroupId!,
                              ),
                            ),
                          );
                        }
                      },
                    ),
                    IconButton(
                      icon: const Icon(Icons.group),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => GroupManagementScreen(userId: userId),
                          ),
                        );
                      },
                    ),
                  ],
                ),

                // Group selector
                if (groups.length > 1)
                  SliverToBoxAdapter(
                    child: Container(
                      height: 60,
                      margin: const EdgeInsets.symmetric(vertical: 8),
                      child: ListView.builder(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: groups.length,
                        itemBuilder: (context, index) {
                          final group = groups[index];
                          final isSelected = group.id == _selectedGroupId;

                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text(group.name),
                              selected: isSelected,
                              onSelected: (selected) {
                                if (selected) {
                                  setState(() => _selectedGroupId = group.id);
                                }
                              },
                              selectedColor: AppColors.primary,
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : null,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                // Tabs
                SliverToBoxAdapter(
                  child: TabBar(
                    controller: _tabController,
                    labelColor: AppColors.primary,
                    unselectedLabelColor: AppColors.textLight,
                    indicatorColor: AppColors.primary,
                    tabs: const [
                      Tab(text: 'Мои задания'),
                      Tab(text: 'Созданные'),
                    ],
                  ),
                ),

                // Tasks list
                if (_selectedGroupId != null)
                  SliverFillRemaining(
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        _buildMyTasksList(userId, user),
                        _buildCreatedTasksList(userId, user),
                      ],
                    ),
                  ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildMyTasksList(String userId, UserModel user) {
    return StreamBuilder<List<TaskModel>>(
      stream: _databaseService.getActiveTasksForUser(userId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.inbox_outlined,
                  size: 80,
                  color: AppColors.textLight,
                ),
                const SizedBox(height: 16),
                Text(
                  'Нет активных заданий',
                  style: AppTextStyles.heading3.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          );
        }

        final tasks = snapshot.data!
            .where((task) => task.groupId == _selectedGroupId)
            .toList();

        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemCount: tasks.length,
          itemBuilder: (context, index) {
            final task = tasks[index];
            return TaskCard(
              task: task,
              showAssignee: false,
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => TaskDetailScreen(
                      task: task,
                      currentUser: user,
                    ),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _buildCreatedTasksList(String userId, UserModel user) {
    return StreamBuilder<List<TaskModel>>(
      stream: _databaseService.getTasksCreatedByUser(userId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        if (!snapshot.hasData || snapshot.data!.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.add_task_outlined,
                  size: 80,
                  color: AppColors.textLight,
                ),
                const SizedBox(height: 16),
                Text(
                  'Вы еще не создали ни одного задания',
                  style: AppTextStyles.heading3.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          );
        }

        final tasks = snapshot.data!
            .where((task) => task.groupId == _selectedGroupId)
            .toList();

        return ListView.builder(
          padding: const EdgeInsets.symmetric(vertical: 8),
          itemCount: tasks.length,
          itemBuilder: (context, index) {
            final task = tasks[index];
            return FutureBuilder<List<UserModel>>(
              future: _databaseService.getGroupMembers(task.groupId),
              builder: (context, membersSnapshot) {
                final assignee = membersSnapshot.data?.firstWhere(
                  (u) => u.id == task.assigneeId,
                  orElse: () => user,
                );

                return TaskCard(
                  task: task,
                  assignee: assignee,
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => TaskDetailScreen(
                          task: task,
                          currentUser: user,
                        ),
                      ),
                    );
                  },
                );
              },
            );
          },
        );
      },
    );
  }

  Widget _buildNoGroupsView(UserModel user) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            LevelProgressBar(user: user),
            const SizedBox(height: 32),
            Icon(
              Icons.group_add_outlined,
              size: 80,
              color: AppColors.textLight,
            ),
            const SizedBox(height: 16),
            Text(
              'Создайте группу или присоединитесь к существующей',
              style: AppTextStyles.heading3,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => GroupManagementScreen(userId: user.id),
                  ),
                );
              },
              icon: const Icon(Icons.group),
              label: const Text('Управление группами'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
