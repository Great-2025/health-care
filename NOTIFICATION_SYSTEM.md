# Real-Time Notification System

A comprehensive real-time notification system for the healthcare platform that supports claim status updates, payment reminders, and appointment alerts.

## Features

### Backend Components

- **WebSocket Server**: Real-time notifications using Socket.io
- **Redis Queue System**: Reliable notification delivery with retry logic
- **Email/SMS Integration**: SendGrid for emails, Twilio for SMS
- **Template Engine**: Dynamic notification templates with variables
- **User Preferences**: Granular control over notification delivery
- **Delivery Tracking**: Comprehensive analytics and monitoring
- **Multi-channel Support**: Email, SMS, Push, In-app notifications

### Frontend Components

- **Real-time Updates**: Live notification delivery via WebSocket
- **Notification Center**: Centralized notification management
- **Settings UI**: User-friendly preference management
- **Responsive Design**: Works on all device types
- **Browser Notifications**: Native browser notifications

## Architecture

### Backend Services

1. **NotificationService** (`services/notificationService.js`)
   - Main orchestrator for all notification operations
   - Handles template rendering and delivery coordination
   - Manages real-time WebSocket delivery

2. **NotificationQueue** (`services/notificationQueue.js`)
   - Redis-based queue system with priority support
   - Automatic retry logic with exponential backoff
   - Dead letter queue for failed notifications

3. **NotificationTemplateEngine** (`services/notificationTemplateEngine.js`)
   - Dynamic template rendering with variables
   - Support for conditional content blocks
   - Multiple output formats (email, SMS, push)

4. **NotificationDeliveryService** (`services/notificationDeliveryService.js`)
   - Integration with external services (SendGrid, Twilio)
   - Push notification support (FCM/APNS ready)
   - Delivery validation and error handling

5. **UserPreferenceService** (`services/userPreferenceService.js`)
   - User notification preferences management
   - Device token registration for push notifications
   - Quiet hours and frequency controls

6. **NotificationAnalyticsService** (`services/notificationAnalyticsService.js`)
   - Comprehensive delivery tracking
   - Performance analytics and reporting
   - Failed notification monitoring

### Database Schema

#### Enhanced Notifications Table
```sql
CREATE TABLE notifications_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notification_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('claim', 'payment', 'appointment', 'system', 'medical_record')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  delivery_methods TEXT,
  template_name TEXT,
  template_data TEXT,
  email_sent BOOLEAN DEFAULT FALSE,
  sms_sent BOOLEAN DEFAULT FALSE,
  push_sent BOOLEAN DEFAULT FALSE,
  in_app_sent BOOLEAN DEFAULT FALSE,
  sent_at DATETIME,
  read_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### User Preferences Table
```sql
CREATE TABLE user_notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  frequency TEXT CHECK (frequency IN ('immediate', 'daily', 'weekly', 'never')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Installation & Setup

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Variables**
Create `.env` file with:
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email Configuration (SendGrid)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourhealthcare.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# SMTP Configuration (Alternative)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Database
DB_PATH=./database/healthcare.db

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

3. **Start Redis Server**
```bash
redis-server
```

4. **Start Backend Server**
```bash
npm run dev
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Environment Variables**
Create `.env` file with:
```env
REACT_APP_SERVER_URL=http://localhost:5000
```

3. **Start Frontend**
```bash
npm start
```

## API Endpoints

### Notification Management

- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/stats` - Get notification statistics
- `PATCH /api/notifications/:id/read` - Mark notification as read
- `PATCH /api/notifications/mark-all-read` - Mark all notifications as read

### Preferences

- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update user preferences
- `POST /api/notifications/register-device` - Register device token
- `DELETE /api/notifications/unregister-device` - Unregister device token
- `GET /api/notifications/devices` - Get registered devices

### Admin

- `GET /api/notifications/queue-stats` - Get queue statistics (admin only)
- `POST /api/notifications/test` - Send test notification (development only)

## WebSocket Events

### Client to Server

- `join-patient-room` - Join patient-specific notification room
- `join-provider-room` - Join provider-specific notification room
- `mark-notification-read` - Mark notification as read
- `register-device` - Register device for push notifications

### Server to Client

- `notification` - New notification received
- `unread-count` - Current unread notification count
- `unread-count-updated` - Updated unread count
- `device-registered` - Device registration confirmation

## Notification Templates

### Available Templates

1. **Claim Notifications**
   - `claim_submitted` - Claim successfully submitted
   - `claim_approved` - Claim approved with payment details
   - `claim_denied` - Claim denied with action required

2. **Payment Notifications**
   - `payment_due` - Payment reminder
   - `payment_overdue` - Overdue payment alert

3. **Appointment Notifications**
   - `appointment_reminder` - Upcoming appointment reminder
   - `appointment_confirmed` - Appointment confirmation
   - `appointment_cancelled` - Appointment cancellation

### Template Variables

Common variables available in all templates:
- `{{patientName}}` - Patient's full name
- `{{claimNumber}}` - Insurance claim number
- `{{serviceDate}}` - Date of service
- `{{providerName}}` - Healthcare provider name
- `{{totalAmount}}` - Total amount
- `{{dueDate}}` - Payment due date
- `{{appointmentDate}}` - Appointment date
- `{{appointmentTime}}` - Appointment time

## Integration Examples

### Sending a Claim Status Update

```javascript
// In your claims route
await req.notificationService.createNotification(
  patientId,
  'claim',
  'claim_approved',
  {
    claimNumber: 'CLM-12345',
    patientName: 'John Doe',
    approvedAmount: '1500.00',
    paymentDate: '2024-01-15'
  },
  'high'
);
```

### Sending an Appointment Reminder

```javascript
// In your appointments route
await req.notificationService.createNotification(
  patientId,
  'appointment',
  'appointment_reminder',
  {
    appointmentDate: '2024-01-20',
    appointmentTime: '10:30 AM',
    providerName: 'Dr. Smith',
    location: 'Main Clinic'
  },
  'medium'
);
```

## Monitoring & Analytics

### Queue Statistics
Monitor Redis queue health:
```javascript
const stats = await notificationService.queue.getQueueStats();
// Returns: { email: 5, sms: 2, push: 10, in_app: 3, dead_letter: 0 }
```

### Delivery Analytics
Track delivery performance:
```javascript
const stats = await notificationService.analytics.getNotificationStats(userId);
// Returns detailed statistics by type, method, and status
```

### Failed Notifications
Monitor failed notifications:
```javascript
const failed = await notificationService.analytics.getFailedNotifications(50);
// Returns recent failed notifications for investigation
```

## Security Considerations

1. **Authentication**: All notification endpoints require JWT authentication
2. **Authorization**: Users can only access their own notifications
3. **Rate Limiting**: API endpoints are rate-limited to prevent abuse
4. **Data Validation**: Input validation on all notification data
5. **Secure Templates**: Template variables are properly sanitized

## Performance Optimization

1. **Redis Queues**: Asynchronous processing prevents blocking
2. **Database Indexes**: Optimized queries for notification retrieval
3. **WebSocket Connections**: Efficient real-time delivery
4. **Caching**: User preferences cached for fast access
5. **Batch Processing**: Multiple notifications processed together

## Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Ensure Redis server is running
   - Check Redis connection parameters
   - Verify network connectivity

2. **Email Delivery Failed**
   - Verify SendGrid API key
   - Check email configuration
   - Review email content for spam triggers

3. **SMS Delivery Failed**
   - Verify Twilio credentials
   - Check phone number format
   - Ensure sufficient Twilio balance

4. **WebSocket Connection Issues**
   - Check CORS configuration
   - Verify client-side connection
   - Review firewall settings

### Debug Mode

Enable debug logging:
```bash
DEBUG=notifications:* npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
