import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'constants.dart';

class Helpers {
  // Format date and time
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('dd MMM yyyy, HH:mm', 'ru').format(dateTime);
  }

  static String formatDate(DateTime dateTime) {
    return DateFormat('dd MMMM yyyy', 'ru').format(dateTime);
  }

  static String formatTime(DateTime dateTime) {
    return DateFormat('HH:mm').format(dateTime);
  }

  // Format duration
  static String formatDuration(Duration duration) {
    if (duration.inDays > 0) {
      return '${duration.inDays} дн';
    } else if (duration.inHours > 0) {
      return '${duration.inHours} ч';
    } else if (duration.inMinutes > 0) {
      return '${duration.inMinutes} мин';
    } else {
      return '${duration.inSeconds} сек';
    }
  }

  // Get time remaining text
  static String getTimeRemainingText(DateTime deadline) {
    final now = DateTime.now();
    final difference = deadline.difference(now);

    if (difference.isNegative) {
      return 'Просрочено';
    }

    if (difference.inDays > 0) {
      return 'Осталось ${difference.inDays} дн';
    } else if (difference.inHours > 0) {
      return 'Осталось ${difference.inHours} ч';
    } else if (difference.inMinutes > 0) {
      return 'Осталось ${difference.inMinutes} мин';
    } else {
      return 'Менее минуты';
    }
  }

  // Get time color based on percentage remaining
  static Color getTimeColor(double percentage) {
    if (percentage > 0.5) {
      return AppColors.timeGood;
    } else if (percentage > 0.3) {
      return AppColors.timeMedium;
    } else if (percentage > 0.05) {
      return AppColors.timeLow;
    } else {
      return AppColors.timeCritical;
    }
  }

  // Show snackbar
  static void showSnackBar(
    BuildContext context,
    String message, {
    bool isError = false,
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppColors.error : AppColors.success,
        behavior: SnackBarBehavior.floating,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }

  // Show dialog
  static Future<bool> showConfirmDialog(
    BuildContext context, {
    required String title,
    required String message,
    String confirmText = 'Да',
    String cancelText = 'Нет',
  }) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(cancelText),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(confirmText),
          ),
        ],
      ),
    );

    return result ?? false;
  }

  // Validate email
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Введите email';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) {
      return 'Неверный формат email';
    }
    return null;
  }

  // Validate password
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Введите пароль';
    }
    if (value.length < 6) {
      return 'Пароль должен быть не менее 6 символов';
    }
    return null;
  }

  // Validate nickname
  static String? validateNickname(String? value) {
    if (value == null || value.isEmpty) {
      return 'Введите никнейм';
    }
    if (value.length < 3) {
      return 'Никнейм должен быть не менее 3 символов';
    }
    return null;
  }

  // Get gradient for level
  static LinearGradient getLevelGradient(int level) {
    if (level < 5) {
      return const LinearGradient(
        colors: [Color(0xFF4CAF50), Color(0xFF8BC34A)],
      );
    } else if (level < 10) {
      return const LinearGradient(
        colors: [Color(0xFF2196F3), Color(0xFF03A9F4)],
      );
    } else if (level < 20) {
      return const LinearGradient(
        colors: [Color(0xFF9C27B0), Color(0xFFE91E63)],
      );
    } else {
      return const LinearGradient(
        colors: [Color(0xFFFF9800), Color(0xFFFF5722)],
      );
    }
  }
}
