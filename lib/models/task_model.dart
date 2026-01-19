import 'package:cloud_firestore/cloud_firestore.dart';

enum TaskDifficulty {
  easy,
  hard,
}

enum TaskStatus {
  active,
  completed,
  disputed,
  overdue,
}

class TaskModel {
  final String id;
  final String groupId;
  final String creatorId;
  final String assigneeId;
  final String description;
  final TaskDifficulty difficulty;
  final int points;
  final DateTime deadline;
  final TaskStatus status;
  final DateTime createdAt;
  final DateTime? completedAt;
  final DateTime? disputedAt;
  final String? disputeReason;

  TaskModel({
    required this.id,
    required this.groupId,
    required this.creatorId,
    required this.assigneeId,
    required this.description,
    required this.difficulty,
    required this.points,
    required this.deadline,
    this.status = TaskStatus.active,
    required this.createdAt,
    this.completedAt,
    this.disputedAt,
    this.disputeReason,
  });

  // Calculate time remaining percentage
  double get timeRemainingPercentage {
    final now = DateTime.now();
    if (now.isAfter(deadline)) return 0.0;

    final totalDuration = deadline.difference(createdAt).inMilliseconds;
    final elapsed = now.difference(createdAt).inMilliseconds;
    final remaining = 1.0 - (elapsed / totalDuration);

    return remaining.clamp(0.0, 1.0);
  }

  // Check if task is overdue
  bool get isOverdue => DateTime.now().isAfter(deadline) && status == TaskStatus.active;

  // Get points value based on difficulty
  static int getPointsForDifficulty(TaskDifficulty difficulty) {
    return difficulty == TaskDifficulty.easy ? 10 : 25;
  }

  // Check if notification should be sent
  bool shouldNotifyAt(double percentage) {
    return timeRemainingPercentage <= percentage &&
           timeRemainingPercentage > percentage - 0.05 &&
           status == TaskStatus.active;
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'groupId': groupId,
      'creatorId': creatorId,
      'assigneeId': assigneeId,
      'description': description,
      'difficulty': difficulty.name,
      'points': points,
      'deadline': Timestamp.fromDate(deadline),
      'status': status.name,
      'createdAt': Timestamp.fromDate(createdAt),
      'completedAt': completedAt != null ? Timestamp.fromDate(completedAt!) : null,
      'disputedAt': disputedAt != null ? Timestamp.fromDate(disputedAt!) : null,
      'disputeReason': disputeReason,
    };
  }

  factory TaskModel.fromMap(Map<String, dynamic> map) {
    return TaskModel(
      id: map['id'] ?? '',
      groupId: map['groupId'] ?? '',
      creatorId: map['creatorId'] ?? '',
      assigneeId: map['assigneeId'] ?? '',
      description: map['description'] ?? '',
      difficulty: TaskDifficulty.values.firstWhere(
        (e) => e.name == map['difficulty'],
        orElse: () => TaskDifficulty.easy,
      ),
      points: map['points'] ?? 0,
      deadline: (map['deadline'] as Timestamp).toDate(),
      status: TaskStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => TaskStatus.active,
      ),
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      completedAt: map['completedAt'] != null
          ? (map['completedAt'] as Timestamp).toDate()
          : null,
      disputedAt: map['disputedAt'] != null
          ? (map['disputedAt'] as Timestamp).toDate()
          : null,
      disputeReason: map['disputeReason'],
    );
  }

  TaskModel copyWith({
    String? id,
    String? groupId,
    String? creatorId,
    String? assigneeId,
    String? description,
    TaskDifficulty? difficulty,
    int? points,
    DateTime? deadline,
    TaskStatus? status,
    DateTime? createdAt,
    DateTime? completedAt,
    DateTime? disputedAt,
    String? disputeReason,
  }) {
    return TaskModel(
      id: id ?? this.id,
      groupId: groupId ?? this.groupId,
      creatorId: creatorId ?? this.creatorId,
      assigneeId: assigneeId ?? this.assigneeId,
      description: description ?? this.description,
      difficulty: difficulty ?? this.difficulty,
      points: points ?? this.points,
      deadline: deadline ?? this.deadline,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt ?? this.completedAt,
      disputedAt: disputedAt ?? this.disputedAt,
      disputeReason: disputeReason ?? this.disputeReason,
    );
  }
}
