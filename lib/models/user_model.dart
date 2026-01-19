import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String id;
  final String email;
  final String nickname;
  final int points;
  final int level;
  final int experience;
  final String? avatarUrl;
  final List<String> groupIds;
  final DateTime createdAt;
  final DateTime lastActive;

  UserModel({
    required this.id,
    required this.email,
    required this.nickname,
    this.points = 0,
    this.level = 1,
    this.experience = 0,
    this.avatarUrl,
    this.groupIds = const [],
    required this.createdAt,
    required this.lastActive,
  });

  // XP needed for next level (exponential growth)
  int get xpForNextLevel => (level * 100 * 1.5).round();

  // Progress to next level (0.0 to 1.0)
  double get levelProgress => experience / xpForNextLevel;

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'email': email,
      'nickname': nickname,
      'points': points,
      'level': level,
      'experience': experience,
      'avatarUrl': avatarUrl,
      'groupIds': groupIds,
      'createdAt': Timestamp.fromDate(createdAt),
      'lastActive': Timestamp.fromDate(lastActive),
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      email: map['email'] ?? '',
      nickname: map['nickname'] ?? '',
      points: map['points'] ?? 0,
      level: map['level'] ?? 1,
      experience: map['experience'] ?? 0,
      avatarUrl: map['avatarUrl'],
      groupIds: List<String>.from(map['groupIds'] ?? []),
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      lastActive: (map['lastActive'] as Timestamp).toDate(),
    );
  }

  UserModel copyWith({
    String? id,
    String? email,
    String? nickname,
    int? points,
    int? level,
    int? experience,
    String? avatarUrl,
    List<String>? groupIds,
    DateTime? createdAt,
    DateTime? lastActive,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      nickname: nickname ?? this.nickname,
      points: points ?? this.points,
      level: level ?? this.level,
      experience: experience ?? this.experience,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      groupIds: groupIds ?? this.groupIds,
      createdAt: createdAt ?? this.createdAt,
      lastActive: lastActive ?? this.lastActive,
    );
  }
}
