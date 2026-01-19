const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Send notification when new task is created
exports.sendNewTaskNotification = functions.firestore
  .document('tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const task = snap.data();

    try {
      // Get assignee user
      const assigneeDoc = await admin.firestore()
        .collection('users')
        .doc(task.assigneeId)
        .get();

      if (!assigneeDoc.exists) return null;

      const assignee = assigneeDoc.data();

      // Get creator user
      const creatorDoc = await admin.firestore()
        .collection('users')
        .doc(task.creatorId)
        .get();

      if (!creatorDoc.exists) return null;

      const creator = creatorDoc.data();

      // Send notification to assignee
      const message = {
        notification: {
          title: '🎯 Новое задание!',
          body: `${creator.nickname} поручил вам: ${task.description}`,
        },
        topic: `user_${task.assigneeId}`,
      };

      await admin.messaging().send(message);

      console.log('New task notification sent');
      return null;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  });

// Send notification when task is completed
exports.sendTaskCompletedNotification = functions.firestore
  .document('tasks/{taskId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if task was just completed
    if (before.status !== 'completed' && after.status === 'completed') {
      try {
        // Get assignee user
        const assigneeDoc = await admin.firestore()
          .collection('users')
          .doc(after.assigneeId)
          .get();

        if (!assigneeDoc.exists) return null;

        const assignee = assigneeDoc.data();

        // Send notification to creator
        const message = {
          notification: {
            title: '✅ Задание выполнено!',
            body: `${assignee.nickname} выполнил задание: ${after.description}`,
          },
          topic: `user_${after.creatorId}`,
        };

        await admin.messaging().send(message);

        console.log('Task completed notification sent');
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }

    // Check if task was disputed
    if (before.status !== 'disputed' && after.status === 'disputed') {
      try {
        // Get assignee user
        const assigneeDoc = await admin.firestore()
          .collection('users')
          .doc(after.assigneeId)
          .get();

        if (!assigneeDoc.exists) return null;

        const assignee = assigneeDoc.data();

        // Send notification to creator
        const message = {
          notification: {
            title: '⚠️ Задание оспорено',
            body: `${assignee.nickname} оспорил задание: ${after.description}`,
          },
          topic: `user_${after.creatorId}`,
        };

        await admin.messaging().send(message);

        console.log('Task disputed notification sent');
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }

    return null;
  });

// Schedule task reminders (runs every 5 minutes)
exports.sendTaskReminders = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const tasksSnapshot = await admin.firestore()
        .collection('tasks')
        .where('status', '==', 'active')
        .get();

      const reminderPercentages = [0.80, 0.50, 0.30, 0.05];

      for (const taskDoc of tasksSnapshot.docs) {
        const task = taskDoc.data();
        const createdAt = task.createdAt.toDate();
        const deadline = task.deadline.toDate();

        const totalDuration = deadline.getTime() - createdAt.getTime();
        const elapsed = now.getTime() - createdAt.getTime();
        const remaining = 1.0 - (elapsed / totalDuration);

        // Check if we should send a reminder
        for (const percentage of reminderPercentages) {
          // If time remaining is close to a reminder percentage (within 5 minute window)
          if (remaining <= percentage && remaining > percentage - 0.01) {
            // Get assignee user
            const assigneeDoc = await admin.firestore()
              .collection('users')
              .doc(task.assigneeId)
              .get();

            if (!assigneeDoc.exists) continue;

            const timeLeft = deadline.getTime() - now.getTime();
            const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

            let timeText = '';
            if (hoursLeft > 0) {
              timeText = `${hoursLeft} ч ${minutesLeft} мин`;
            } else {
              timeText = `${minutesLeft} мин`;
            }

            // Send reminder notification
            const message = {
              notification: {
                title: '⏰ Напоминание о задании',
                body: `Осталось ${timeText}: ${task.description}`,
              },
              topic: `user_${task.assigneeId}`,
            };

            await admin.messaging().send(message);
            console.log(`Reminder sent for task ${taskDoc.id} at ${percentage * 100}%`);
          }
        }
      }

      console.log('Task reminders processed');
      return null;
    } catch (error) {
      console.error('Error processing task reminders:', error);
      return null;
    }
  });

// Update overdue tasks (runs every hour)
exports.updateOverdueTasks = functions.pubsub
  .schedule('every 1 hours')
  .onRun(async (context) => {
    try {
      const now = new Date();
      const tasksSnapshot = await admin.firestore()
        .collection('tasks')
        .where('status', '==', 'active')
        .get();

      let overdueCount = 0;

      for (const taskDoc of tasksSnapshot.docs) {
        const task = taskDoc.data();
        const deadline = task.deadline.toDate();

        if (now > deadline) {
          await taskDoc.ref.update({
            status: 'overdue',
          });
          overdueCount++;

          // Send overdue notification
          const assigneeDoc = await admin.firestore()
            .collection('users')
            .doc(task.assigneeId)
            .get();

          if (assigneeDoc.exists) {
            const message = {
              notification: {
                title: '❌ Задание просрочено',
                body: `Просрочено: ${task.description}`,
              },
              topic: `user_${task.assigneeId}`,
            };

            await admin.messaging().send(message);
          }
        }
      }

      console.log(`Updated ${overdueCount} overdue tasks`);
      return null;
    } catch (error) {
      console.error('Error updating overdue tasks:', error);
      return null;
    }
  });
