import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../services/database_service.dart';
import '../../utils/constants.dart';
import '../../utils/helpers.dart';
import '../home/home_screen.dart';

class ProfileSetupScreen extends StatefulWidget {
  final UserModel user;

  const ProfileSetupScreen({
    Key? key,
    required this.user,
  }) : super(key: key);

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _groupNameController = TextEditingController();
  final _inviteCodeController = TextEditingController();
  final _databaseService = DatabaseService();
  bool _isLoading = false;
  bool _isCreatingGroup = true;

  @override
  void dispose() {
    _groupNameController.dispose();
    _inviteCodeController.dispose();
    super.dispose();
  }

  Future<void> _handleSetup() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      if (_isCreatingGroup) {
        // Create new group
        await _databaseService.createGroup(
          name: _groupNameController.text.trim(),
          creatorId: widget.user.id,
        );
        if (mounted) {
          Helpers.showSnackBar(context, 'Группа создана!');
        }
      } else {
        // Join existing group
        final group = await _databaseService.joinGroup(
          _inviteCodeController.text.trim().toUpperCase(),
          widget.user.id,
        );

        if (group == null && mounted) {
          Helpers.showSnackBar(
            context,
            'Группа не найдена',
            isError: true,
          );
          setState(() => _isLoading = false);
          return;
        }

        if (mounted) {
          Helpers.showSnackBar(context, 'Вы присоединились к группе!');
        }
      }

      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
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
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.primary,
              AppColors.secondary,
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Welcome message
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.2),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Icon(
                      Icons.celebration,
                      size: 60,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Добро пожаловать,',
                    style: AppTextStyles.heading2.copyWith(
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    widget.user.nickname,
                    style: AppTextStyles.heading1.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Создайте группу или присоединитесь к существующей',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: Colors.white.withOpacity(0.9),
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),

                  // Setup form
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Toggle buttons
                          Container(
                            decoration: BoxDecoration(
                              color: AppColors.background,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      setState(() => _isCreatingGroup = true);
                                    },
                                    borderRadius: BorderRadius.circular(12),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 12,
                                      ),
                                      decoration: BoxDecoration(
                                        color: _isCreatingGroup
                                            ? AppColors.primary
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        'Создать группу',
                                        style: AppTextStyles.bodyMedium.copyWith(
                                          color: _isCreatingGroup
                                              ? Colors.white
                                              : AppColors.textSecondary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ),
                                  ),
                                ),
                                Expanded(
                                  child: InkWell(
                                    onTap: () {
                                      setState(() => _isCreatingGroup = false);
                                    },
                                    borderRadius: BorderRadius.circular(12),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 12,
                                      ),
                                      decoration: BoxDecoration(
                                        color: !_isCreatingGroup
                                            ? AppColors.primary
                                            : Colors.transparent,
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                      child: Text(
                                        'Присоединиться',
                                        style: AppTextStyles.bodyMedium.copyWith(
                                          color: !_isCreatingGroup
                                              ? Colors.white
                                              : AppColors.textSecondary,
                                          fontWeight: FontWeight.w600,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Form fields
                          if (_isCreatingGroup)
                            TextFormField(
                              controller: _groupNameController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Введите название группы';
                                }
                                return null;
                              },
                              decoration: InputDecoration(
                                labelText: 'Название группы',
                                hintText: 'Например: Семья, Друзья',
                                prefixIcon: const Icon(Icons.group_outlined),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            )
                          else
                            TextFormField(
                              controller: _inviteCodeController,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Введите код приглашения';
                                }
                                if (value.length != 6) {
                                  return 'Код должен быть 6 символов';
                                }
                                return null;
                              },
                              textCapitalization: TextCapitalization.characters,
                              maxLength: 6,
                              decoration: InputDecoration(
                                labelText: 'Код приглашения',
                                hintText: 'ABC123',
                                prefixIcon: const Icon(Icons.key),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            ),
                          const SizedBox(height: 24),

                          // Continue button
                          ElevatedButton(
                            onPressed: _isLoading ? null : _handleSetup,
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
                                          AlwaysStoppedAnimation<Color>(
                                              Colors.white),
                                    ),
                                  )
                                : Text(
                                    'Продолжить',
                                    style: AppTextStyles.button,
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
