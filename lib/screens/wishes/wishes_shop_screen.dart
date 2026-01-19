import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../models/wish_model.dart';
import '../../models/group_model.dart';
import '../../services/database_service.dart';
import '../../utils/constants.dart';
import '../../utils/helpers.dart';

class WishesShopScreen extends StatefulWidget {
  final String userId;

  const WishesShopScreen({Key? key, required this.userId}) : super(key: key);

  @override
  State<WishesShopScreen> createState() => _WishesShopScreenState();
}

class _WishesShopScreenState extends State<WishesShopScreen> {
  final _databaseService = DatabaseService();
  String? _selectedGroupId;

  void _showAddWishDialog(UserModel user) {
    final descriptionController = TextEditingController();
    final costController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Новое желание'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: descriptionController,
              decoration: const InputDecoration(
                labelText: 'Описание',
                hintText: 'Например: Поход в кино',
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: costController,
              decoration: const InputDecoration(
                labelText: 'Стоимость (баллы)',
                hintText: '50',
              ),
              keyboardType: TextInputType.number,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (descriptionController.text.isEmpty ||
                  costController.text.isEmpty) {
                return;
              }

              await _databaseService.createWish(
                userId: widget.userId,
                groupId: _selectedGroupId!,
                description: descriptionController.text,
                cost: int.parse(costController.text),
              );

              if (context.mounted) {
                Navigator.pop(context);
                Helpers.showSnackBar(context, 'Желание добавлено!');
              }
            },
            child: const Text('Добавить'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<UserModel?>(
      stream: _databaseService.getUserStream(widget.userId),
      builder: (context, userSnapshot) {
        if (!userSnapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }

        final user = userSnapshot.data!;

        return StreamBuilder<List<GroupModel>>(
          stream: _databaseService.getUserGroups(widget.userId),
          builder: (context, groupsSnapshot) {
            if (!groupsSnapshot.hasData || groupsSnapshot.data!.isEmpty) {
              return _buildNoGroupsView();
            }

            final groups = groupsSnapshot.data!;
            if (_selectedGroupId == null) {
              _selectedGroupId = groups.first.id;
            }

            return Scaffold(
              appBar: AppBar(
                title: const Text('Магазин желаний'),
                backgroundColor: AppColors.primary,
              ),
              body: Column(
                children: [
                  // Points display
                  Container(
                    padding: const EdgeInsets.all(16),
                    color: AppColors.accent.withOpacity(0.1),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.stars, color: AppColors.pointsGold, size: 32),
                        const SizedBox(width: 12),
                        Text(
                          '${user.points} баллов',
                          style: AppTextStyles.heading2.copyWith(
                            color: AppColors.pointsGold,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Group selector
                  if (groups.length > 1)
                    Container(
                      height: 60,
                      padding: const EdgeInsets.symmetric(vertical: 8),
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
                            ),
                          );
                        },
                      ),
                    ),

                  // Wishes list
                  Expanded(
                    child: StreamBuilder<List<WishModel>>(
                      stream: _databaseService.getUserWishes(
                        widget.userId,
                        _selectedGroupId!,
                      ),
                      builder: (context, wishesSnapshot) {
                        if (!wishesSnapshot.hasData) {
                          return const Center(child: CircularProgressIndicator());
                        }

                        final wishes = wishesSnapshot.data!;
                        if (wishes.isEmpty) {
                          return _buildEmptyView();
                        }

                        return ListView.builder(
                          padding: const EdgeInsets.all(16),
                          itemCount: wishes.length,
                          itemBuilder: (context, index) {
                            final wish = wishes[index];
                            return _buildWishCard(wish, user);
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
              floatingActionButton: FloatingActionButton.extended(
                onPressed: () => _showAddWishDialog(user),
                backgroundColor: AppColors.accent,
                icon: const Icon(Icons.add),
                label: const Text('Желание'),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildWishCard(WishModel wish, UserModel user) {
    final canAfford = user.points >= wish.cost;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    wish.description,
                    style: AppTextStyles.bodyLarge.copyWith(
                      fontWeight: FontWeight.w600,
                      decoration: wish.isPurchased
                          ? TextDecoration.lineThrough
                          : null,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.accent.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.stars,
                        size: 16,
                        color: AppColors.pointsGold,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${wish.cost}',
                        style: AppTextStyles.bodyMedium.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (!wish.isPurchased) ...[
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: canAfford
                    ? () async {
                        final confirmed = await Helpers.showConfirmDialog(
                          context,
                          title: 'Купить желание?',
                          message:
                              'Потратить ${wish.cost} баллов на "${wish.description}"?',
                        );

                        if (!confirmed) return;

                        final success = await _databaseService.purchaseWish(
                          wish.id,
                          user.id,
                        );

                        if (context.mounted) {
                          if (success) {
                            Helpers.showSnackBar(
                              context,
                              'Желание исполнено! 🎉',
                            );
                          } else {
                            Helpers.showSnackBar(
                              context,
                              'Недостаточно баллов',
                              isError: true,
                            );
                          }
                        }
                      }
                    : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                ),
                child: const Text('Купить'),
              ),
            ] else ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.check_circle, color: AppColors.success, size: 16),
                  const SizedBox(width: 4),
                  Text(
                    'Куплено ${Helpers.formatDate(wish.purchasedAt!)}',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.success,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.card_giftcard, size: 80, color: AppColors.textLight),
          const SizedBox(height: 16),
          Text(
            'Нет желаний',
            style: AppTextStyles.heading3.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Добавьте свои желания',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textLight,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNoGroupsView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.group_add, size: 80, color: AppColors.textLight),
          const SizedBox(height: 16),
          Text(
            'Создайте группу',
            style: AppTextStyles.heading3,
          ),
        ],
      ),
    );
  }
}
