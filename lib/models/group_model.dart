import 'package:cloud_firestore/cloud_firestore.dart';

class GroupModel {
  final String id;
  final String name;
  final List<String> memberIds;
  final String creatorId;
  final DateTime createdAt;
  final String? inviteCode;

  GroupModel({
    required this.id,
    required this.name,
    required this.memberIds,
    required this.creatorId,
    required this.createdAt,
    this.inviteCode,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'memberIds': memberIds,
      'creatorId': creatorId,
      'createdAt': Timestamp.fromDate(createdAt),
      'inviteCode': inviteCode,
    };
  }

  factory GroupModel.fromMap(Map<String, dynamic> map) {
    return GroupModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      memberIds: List<String>.from(map['memberIds'] ?? []),
      creatorId: map['creatorId'] ?? '',
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      inviteCode: map['inviteCode'],
    );
  }

  GroupModel copyWith({
    String? id,
    String? name,
    List<String>? memberIds,
    String? creatorId,
    DateTime? createdAt,
    String? inviteCode,
  }) {
    return GroupModel(
      id: id ?? this.id,
      name: name ?? this.name,
      memberIds: memberIds ?? this.memberIds,
      creatorId: creatorId ?? this.creatorId,
      createdAt: createdAt ?? this.createdAt,
      inviteCode: inviteCode ?? this.inviteCode,
    );
  }
}
