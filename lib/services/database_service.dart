import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:uuid/uuid.dart';
import '../models/user_model.dart';
import '../models/task_model.dart';
import '../models/group_model.dart';
import '../models/wish_model.dart';
import '../models/achievement_model.dart';
import '../models/task_history_model.dart';

class DatabaseService {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final Uuid _uuid = const Uuid();

  // ============= GROUPS =============

  // Create group
  Future<GroupModel> createGroup({
    required String name,
    required String creatorId,
  }) async {
    final groupId = _uuid.v4();
    final inviteCode = _generateInviteCode();

    final group = GroupModel(
      id: groupId,
      name: name,
      memberIds: [creatorId],
      creatorId: creatorId,
      createdAt: DateTime.now(),
      inviteCode: inviteCode,
    );

    await _firestore.collection('groups').doc(groupId).set(group.toMap());

    // Add group to user's groups
    await _firestore.collection('users').doc(creatorId).update({
      'groupIds': FieldValue.arrayUnion([groupId]),
    });

    return group;
  }

  // Join group by invite code
  Future<GroupModel?> joinGroup(String inviteCode, String userId) async {
    final querySnapshot = await _firestore
        .collection('groups')
        .where('inviteCode', isEqualTo: inviteCode)
        .limit(1)
        .get();

    if (querySnapshot.docs.isEmpty) return null;

    final groupDoc = querySnapshot.docs.first;
    final group = GroupModel.fromMap(groupDoc.data());

    // Add user to group
    await _firestore.collection('groups').doc(group.id).update({
      'memberIds': FieldValue.arrayUnion([userId]),
    });

    // Add group to user's groups
    await _firestore.collection('users').doc(userId).update({
      'groupIds': FieldValue.arrayUnion([group.id]),
    });

    return group;
  }

  // Get user's groups
  Stream<List<GroupModel>> getUserGroups(String userId) {
    return _firestore
        .collection('groups')
        .where('memberIds', arrayContains: userId)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => GroupModel.fromMap(doc.data()))
            .toList());
  }

  // Get group members
  Future<List<UserModel>> getGroupMembers(String groupId) async {
    final groupDoc = await _firestore.collection('groups').doc(groupId).get();
    if (!groupDoc.exists) return [];

    final group = GroupModel.fromMap(groupDoc.data()!);
    final members = <UserModel>[];

    for (final memberId in group.memberIds) {
      final userDoc = await _firestore.collection('users').doc(memberId).get();
      if (userDoc.exists) {
        members.add(UserModel.fromMap(userDoc.data()!));
      }
    }

    return members;
  }

  // ============= TASKS =============

  // Create task
  Future<TaskModel> createTask({
    required String groupId,
    required String creatorId,
    required String assigneeId,
    required String description,
    required TaskDifficulty difficulty,
    required DateTime deadline,
  }) async {
    final taskId = _uuid.v4();
    final points = TaskModel.getPointsForDifficulty(difficulty);

    final task = TaskModel(
      id: taskId,
      groupId: groupId,
      creatorId: creatorId,
      assigneeId: assigneeId,
      description: description,
      difficulty: difficulty,
      points: points,
      deadline: deadline,
      createdAt: DateTime.now(),
    );

    await _firestore.collection('tasks').doc(taskId).set(task.toMap());

    return task;
  }

  // Get active tasks for user
  Stream<List<TaskModel>> getActiveTasksForUser(String userId) {
    return _firestore
        .collection('tasks')
        .where('assigneeId', isEqualTo: userId)
        .where('status', isEqualTo: TaskStatus.active.name)
        .orderBy('deadline')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => TaskModel.fromMap(doc.data()))
            .toList());
  }

  // Get tasks created by user
  Stream<List<TaskModel>> getTasksCreatedByUser(String userId) {
    return _firestore
        .collection('tasks')
        .where('creatorId', isEqualTo: userId)
        .where('status', whereIn: [TaskStatus.active.name, TaskStatus.completed.name])
        .orderBy('deadline')
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => TaskModel.fromMap(doc.data()))
            .toList());
  }

  // Complete task
  Future<void> completeTask(String taskId) async {
    await _firestore.collection('tasks').doc(taskId).update({
      'status': TaskStatus.completed.name,
      'completedAt': Timestamp.fromDate(DateTime.now()),
    });
  }

  // Dispute task
  Future<void> disputeTask(String taskId, String reason, DateTime newDeadline) async {
    await _firestore.collection('tasks').doc(taskId).update({
      'status': TaskStatus.disputed.name,
      'disputedAt': Timestamp.fromDate(DateTime.now()),
      'disputeReason': reason,
      'deadline': Timestamp.fromDate(newDeadline),
    });
  }

  // Accept dispute and reactivate task
  Future<void> acceptDispute(String taskId) async {
    await _firestore.collection('tasks').doc(taskId).update({
      'status': TaskStatus.active.name,
      'disputedAt': null,
      'disputeReason': null,
    });
  }

  // Get task suggestions based on history
  Future<List<String>> getTaskSuggestions(String userId, String groupId) async {
    final historySnapshot = await _firestore
        .collection('task_history')
        .where('userId', isEqualTo: userId)
        .where('groupId', isEqualTo: groupId)
        .orderBy('completedAt', descending: true)
        .limit(20)
        .get();

    final suggestions = historySnapshot.docs
        .map((doc) => TaskHistoryModel.fromMap(doc.data()).description)
        .toSet()
        .toList();

    return suggestions;
  }

  // ============= WISHES =============

  // Create wish
  Future<WishModel> createWish({
    required String userId,
    required String groupId,
    required String description,
    required int cost,
  }) async {
    final wishId = _uuid.v4();

    final wish = WishModel(
      id: wishId,
      userId: userId,
      groupId: groupId,
      description: description,
      cost: cost,
      createdAt: DateTime.now(),
    );

    await _firestore.collection('wishes').doc(wishId).set(wish.toMap());

    return wish;
  }

  // Get user wishes
  Stream<List<WishModel>> getUserWishes(String userId, String groupId) {
    return _firestore
        .collection('wishes')
        .where('userId', isEqualTo: userId)
        .where('groupId', isEqualTo: groupId)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => WishModel.fromMap(doc.data()))
            .toList());
  }

  // Purchase wish
  Future<bool> purchaseWish(String wishId, String userId) async {
    return await _firestore.runTransaction<bool>((transaction) async {
      final wishDoc = await transaction.get(_firestore.collection('wishes').doc(wishId));
      final userDoc = await transaction.get(_firestore.collection('users').doc(userId));

      if (!wishDoc.exists || !userDoc.exists) return false;

      final wish = WishModel.fromMap(wishDoc.data()!);
      final user = UserModel.fromMap(userDoc.data()!);

      if (wish.isPurchased || user.points < wish.cost) return false;

      // Update wish
      transaction.update(wishDoc.reference, {
        'isPurchased': true,
        'purchasedAt': Timestamp.fromDate(DateTime.now()),
      });

      // Deduct points
      transaction.update(userDoc.reference, {
        'points': user.points - wish.cost,
      });

      return true;
    });
  }

  // ============= TASK HISTORY =============

  // Add task to history
  Future<void> addTaskToHistory(TaskModel task) async {
    final historyId = _uuid.v4();
    final completionTime = task.completedAt!.difference(task.createdAt);
    final wasOnTime = task.completedAt!.isBefore(task.deadline);

    final history = TaskHistoryModel(
      id: historyId,
      taskId: task.id,
      userId: task.assigneeId,
      groupId: task.groupId,
      description: task.description,
      pointsEarned: wasOnTime ? task.points : -task.points,
      completedAt: task.completedAt!,
      completionTime: completionTime,
      wasOnTime: wasOnTime,
    );

    await _firestore.collection('task_history').doc(historyId).set(history.toMap());
  }

  // Get user statistics
  Future<Map<String, dynamic>> getUserStatistics(String userId, String groupId) async {
    final historySnapshot = await _firestore
        .collection('task_history')
        .where('userId', isEqualTo: userId)
        .where('groupId', isEqualTo: groupId)
        .get();

    if (historySnapshot.docs.isEmpty) {
      return {
        'totalTasks': 0,
        'completedOnTime': 0,
        'averageCompletionTime': Duration.zero,
        'totalPointsEarned': 0,
      };
    }

    final histories = historySnapshot.docs
        .map((doc) => TaskHistoryModel.fromMap(doc.data()))
        .toList();

    final totalTasks = histories.length;
    final completedOnTime = histories.where((h) => h.wasOnTime).length;
    final totalMilliseconds = histories.fold<int>(
      0,
      (sum, h) => sum + h.completionTime.inMilliseconds,
    );
    final averageCompletionTime = Duration(
      milliseconds: totalMilliseconds ~/ totalTasks,
    );
    final totalPointsEarned = histories.fold<int>(
      0,
      (sum, h) => sum + h.pointsEarned,
    );

    return {
      'totalTasks': totalTasks,
      'completedOnTime': completedOnTime,
      'averageCompletionTime': averageCompletionTime,
      'totalPointsEarned': totalPointsEarned,
    };
  }

  // Get task history
  Stream<List<TaskHistoryModel>> getTaskHistory(String userId, String groupId) {
    return _firestore
        .collection('task_history')
        .where('userId', isEqualTo: userId)
        .where('groupId', isEqualTo: groupId)
        .orderBy('completedAt', descending: true)
        .limit(50)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => TaskHistoryModel.fromMap(doc.data()))
            .toList());
  }

  // ============= USER ACHIEVEMENTS =============

  // Get user achievements
  Stream<List<UserAchievement>> getUserAchievements(String userId) {
    return _firestore
        .collection('achievements')
        .where('userId', isEqualTo: userId)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => UserAchievement.fromMap(doc.data()))
            .toList());
  }

  // Unlock achievement
  Future<void> unlockAchievement(String userId, AchievementType type, int progress) async {
    final achievementId = _uuid.v4();

    final achievement = UserAchievement(
      id: achievementId,
      userId: userId,
      type: type,
      unlockedAt: DateTime.now(),
      progress: progress,
    );

    await _firestore.collection('achievements').doc(achievementId).set(achievement.toMap());
  }

  // ============= USER UPDATES =============

  // Update user points and XP
  Future<void> updateUserProgress(String userId, int pointsDelta, int xpDelta) async {
    return await _firestore.runTransaction((transaction) async {
      final userDoc = await transaction.get(_firestore.collection('users').doc(userId));
      if (!userDoc.exists) return;

      final user = UserModel.fromMap(userDoc.data()!);
      final newPoints = (user.points + pointsDelta).clamp(0, double.infinity).toInt();
      final newXp = user.experience + xpDelta;

      // Calculate level ups
      int newLevel = user.level;
      int remainingXp = newXp;

      while (remainingXp >= (newLevel * 100 * 1.5).round()) {
        remainingXp -= (newLevel * 100 * 1.5).round();
        newLevel++;
      }

      transaction.update(userDoc.reference, {
        'points': newPoints,
        'experience': remainingXp,
        'level': newLevel,
      });
    });
  }

  // Get user stream
  Stream<UserModel?> getUserStream(String userId) {
    return _firestore
        .collection('users')
        .doc(userId)
        .snapshots()
        .map((doc) => doc.exists ? UserModel.fromMap(doc.data()!) : null);
  }

  // ============= HELPERS =============

  String _generateInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return List.generate(6, (index) => chars[DateTime.now().microsecond % chars.length]).join();
  }
}
