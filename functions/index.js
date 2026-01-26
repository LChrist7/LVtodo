const {onDocumentCreated, onDocumentUpdated} = require('firebase-functions/v2/firestore');
const {defineString, defineSecret} = require('firebase-functions/params');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Define configuration parameters
// For local development, create a .env file in functions/ directory
const smtpHost = defineString('SMTP_HOST', {
  description: 'SMTP server hostname',
  default: 'smtp.gmail.com'
});

const smtpPort = defineString('SMTP_PORT', {
  description: 'SMTP server port',
  default: '587'
});

const smtpUser = defineString('SMTP_USER', {
  description: 'SMTP username/email'
});

// Use defineSecret for sensitive data like passwords
const smtpPassword = defineSecret('SMTP_PASSWORD');

/**
 * Cloud Function that triggers when a new task is created
 * Sends an email notification to the executor (assignedTo user)
 */
exports.sendTaskNotification = onDocumentCreated(
  {
    document: 'tasks/{taskId}',
    secrets: [smtpPassword], // Declare secrets used by this function
  },
  async (event) => {
    try {
      const task = event.data.data();
      const taskId = event.params.taskId;

      // Get executor (assignedTo) user data
      const executorDoc = await admin.firestore()
        .collection('users')
        .doc(task.assignedTo)
        .get();

      if (!executorDoc.exists) {
        console.error('Executor user not found:', task.assignedTo);
        return null;
      }

      const executor = executorDoc.data();
      const executorEmail = executor.email;

      if (!executorEmail) {
        console.error('Executor has no email:', task.assignedTo);
        return null;
      }

      // Get assigner (assignedBy) user data for display name
      const assignerDoc = await admin.firestore()
        .collection('users')
        .doc(task.assignedBy)
        .get();

      const assignerName = assignerDoc.exists
        ? assignerDoc.data().displayName
        : 'Пользователь';

      // Get group name
      const groupDoc = await admin.firestore()
        .collection('groups')
        .doc(task.groupId)
        .get();

      const groupName = groupDoc.exists ? groupDoc.data().name : 'Группа';

      // Format deadline
      const deadline = task.deadline.toDate();
      const deadlineFormatted = deadline.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      // Difficulty translation
      const difficultyText = task.difficulty === 'easy' ? 'Легкая' : 'Сложная';
      const pointsText = task.difficulty === 'easy' ? '10' : '25';

      // Create email transporter using params
      const transporter = nodemailer.createTransport({
        host: smtpHost.value(),
        port: parseInt(smtpPort.value()),
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtpUser.value(),
          pass: smtpPassword.value()
        }
      });

      // Email content
      const mailOptions = {
        from: `"LVTodo" <${smtpUser.value()}>`,
        to: executorEmail,
        subject: `Новое задание: ${task.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 10px 10px; }
              .task-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .task-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #667eea; }
              .task-info { margin: 15px 0; }
              .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
              .info-label { font-weight: 600; min-width: 120px; color: #666; }
              .info-value { color: #333; }
              .difficulty-easy { color: #28a745; font-weight: bold; }
              .difficulty-hard { color: #dc3545; font-weight: bold; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
              .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎯 Новое задание!</h1>
                <p>Вам назначено новое задание в LVTodo</p>
              </div>
              <div class="content">
                <div class="task-card">
                  <div class="task-title">${task.title}</div>
                  ${task.description ? `<p style="color: #666; margin-top: 10px;">${task.description}</p>` : ''}

                  <div class="task-info">
                    <div class="info-row">
                      <span class="info-label">Заказчик:</span>
                      <span class="info-value">${assignerName}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Группа:</span>
                      <span class="info-value">${groupName}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Срок выполнения:</span>
                      <span class="info-value">⏰ ${deadlineFormatted}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Сложность:</span>
                      <span class="info-value ${task.difficulty === 'easy' ? 'difficulty-easy' : 'difficulty-hard'}">${difficultyText}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Награда:</span>
                      <span class="info-value">💰 ${pointsText} баллов</span>
                    </div>
                  </div>

                  <center>
                    <a href="https://lvtodo.web.app/tasks" class="button">Открыть задание</a>
                  </center>
                </div>

                <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
                  Удачи в выполнении задания! 🚀
                </p>
              </div>

              <div class="footer">
                <p>Это автоматическое уведомление от LVTodo</p>
                <p>© 2026 LVTodo - Gamified Task Management</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Новое задание: ${task.title}

${task.description || ''}

Заказчик: ${assignerName}
Группа: ${groupName}
Срок: ${deadlineFormatted}
Сложность: ${difficultyText}
Награда: ${pointsText} баллов

Откройте приложение для выполнения задания: https://lvtodo.web.app/tasks
        `.trim()
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      console.log(`Task notification sent to ${executorEmail} for task: ${task.title}`);

      return {success: true, messageId: info.messageId};

    } catch (error) {
      console.error('Error sending task notification:', error);
      return {success: false, error: error.message};
    }
  }
);

/**
 * Cloud Function to send wish approval notifications
 * Sends email when wish status changes to 'active' (approved)
 */
exports.sendWishApprovalNotification = onDocumentUpdated(
  {
    document: 'wishes/{wishId}',
    secrets: [smtpPassword],
  },
  async (event) => {
    try {
      const oldWish = event.data.before.data();
      const newWish = event.data.after.data();

      // Only trigger if wish just became active (approved)
      if (oldWish.status !== 'active' && newWish.status === 'active') {
        // Get wish creator
        const creatorDoc = await admin.firestore()
          .collection('users')
          .doc(newWish.createdBy)
          .get();

        if (!creatorDoc.exists) {
          console.error('Creator user not found:', newWish.createdBy);
          return null;
        }

        const creator = creatorDoc.data();
        const creatorEmail = creator.email;

        if (!creatorEmail) {
          console.error('Creator has no email:', newWish.createdBy);
          return null;
        }

        // Get group name
        const groupDoc = await admin.firestore()
          .collection('groups')
          .doc(newWish.groupId)
          .get();

        const groupName = groupDoc.exists ? groupDoc.data().name : 'Группа';

        // Create email transporter
        const transporter = nodemailer.createTransport({
          host: smtpHost.value(),
          port: parseInt(smtpPort.value()),
          secure: false,
          auth: {
            user: smtpUser.value(),
            pass: smtpPassword.value()
          }
        });

        const mailOptions = {
          from: `"LVTodo" <${smtpUser.value()}>`,
          to: creatorEmail,
          subject: `Желание одобрено: ${newWish.title}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f8f9fa; padding: 30px 20px; border-radius: 0 0 10px 10px; }
                .wish-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .wish-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: #10b981; }
                .cost { font-size: 32px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; }
                .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
                .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Желание одобрено!</h1>
                  <p>Ваше желание было одобрено группой</p>
                </div>
                <div class="content">
                  <div class="wish-card">
                    <div class="wish-title">${newWish.title}</div>
                    ${newWish.description ? `<p style="color: #666; margin-top: 10px;">${newWish.description}</p>` : ''}

                    <div class="cost">💰 ${newWish.cost} баллов</div>

                    <p style="text-align: center; color: #666;">
                      Группа: ${groupName}
                    </p>

                    <center>
                      <a href="https://lvtodo.web.app/wishes" class="button">Посмотреть желание</a>
                    </center>
                  </div>

                  <p style="color: #666; font-size: 14px; text-align: center; margin-top: 20px;">
                    Накопите баллы для исполнения желания! 🌟
                  </p>
                </div>

                <div class="footer">
                  <p>Это автоматическое уведомление от LVTodo</p>
                  <p>© 2026 LVTodo - Gamified Task Management</p>
                </div>
              </div>
            </body>
            </html>
          `,
          text: `
Желание одобрено: ${newWish.title}

${newWish.description || ''}

Стоимость: ${newWish.cost} баллов
Группа: ${groupName}

Откройте приложение: https://lvtodo.web.app/wishes
          `.trim()
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Wish approval email sent:', info.messageId);

        return {success: true, messageId: info.messageId};
      }

      return null;
    } catch (error) {
      console.error('Error sending wish approval notification:', error);
      return {success: false, error: error.message};
    }
  }
);
