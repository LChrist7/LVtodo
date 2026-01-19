import 'package:cloud_firestore/cloud_firestore.dart';

class WishModel {
  final String id;
  final String userId;
  final String groupId;
  final String description;
  final int cost;
  final bool isPurchased;
  final DateTime createdAt;
  final DateTime? purchasedAt;

  WishModel({
    required this.id,
    required this.userId,
    required this.groupId,
    required this.description,
    required this.cost,
    this.isPurchased = false,
    required this.createdAt,
    this.purchasedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'userId': userId,
      'groupId': groupId,
      'description': description,
      'cost': cost,
      'isPurchased': isPurchased,
      'createdAt': Timestamp.fromDate(createdAt),
      'purchasedAt': purchasedAt != null ? Timestamp.fromDate(purchasedAt!) : null,
    };
  }

  factory WishModel.fromMap(Map<String, dynamic> map) {
    return WishModel(
      id: map['id'] ?? '',
      userId: map['userId'] ?? '',
      groupId: map['groupId'] ?? '',
      description: map['description'] ?? '',
      cost: map['cost'] ?? 0,
      isPurchased: map['isPurchased'] ?? false,
      createdAt: (map['createdAt'] as Timestamp).toDate(),
      purchasedAt: map['purchasedAt'] != null
          ? (map['purchasedAt'] as Timestamp).toDate()
          : null,
    );
  }

  WishModel copyWith({
    String? id,
    String? userId,
    String? groupId,
    String? description,
    int? cost,
    bool? isPurchased,
    DateTime? createdAt,
    DateTime? purchasedAt,
  }) {
    return WishModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      groupId: groupId ?? this.groupId,
      description: description ?? this.description,
      cost: cost ?? this.cost,
      isPurchased: isPurchased ?? this.isPurchased,
      createdAt: createdAt ?? this.createdAt,
      purchasedAt: purchasedAt ?? this.purchasedAt,
    );
  }
}
