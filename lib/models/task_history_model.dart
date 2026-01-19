import 'package:cloud_firestore/cloud_firestore.dart';

class TaskHistoryModel {
  final String id;
  final String taskId;
  final String userId;
  final String groupId;
  final String description;
  final int pointsEarned;
  final DateTime completedAt;
  final Duration completionTime;
  final bool wasOnTime;

  TaskHistoryModel({
    required this.id,
    required this.taskId,
    required this.userId,
    required this.groupId,
    required this.description,
    required this.pointsEarned,
    required this.completedAt,
    required this.completionTime,
    required this.wasOnTime,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'taskId': taskId,
      'userId': userId,
      'groupId': groupId,
      'description': description,
      'pointsEarned': pointsEarned,
      'completedAt': Timestamp.fromDate(completedAt),
      'completionTime': completionTime.inMilliseconds,
      'wasOnTime': wasOnTime,
    };
  }

  factory TaskHistoryModel.fromMap(Map<String, dynamic> map) {
    return TaskHistoryModel(
      id: map['id'] ?? '',
      taskId: map['taskId'] ?? '',
      userId: map['userId'] ?? '',
      groupId: map['groupId'] ?? '',
      description: map['description'] ?? '',
      pointsEarned: map['pointsEarned'] ?? 0,
      completedAt: (map['completedAt'] as Timestamp).toDate(),
      completionTime: Duration(milliseconds: map['completionTime'] ?? 0),
      wasOnTime: map['wasOnTime'] ?? false,
    );
  }
}
