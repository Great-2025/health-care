# Multi-Faceted Reputation System

A comprehensive reputation system for healthcare providers, patients, and contributors built with modern React components and Node.js backend APIs.

## Features

### Core Components
- **Star Rating Interface** - Interactive 5-star rating system with hover effects
- **Review Management** - Complete review submission, display, and moderation
- **Badge System** - Achievement-based badges with progress tracking
- **Reputation Dashboard** - Comprehensive analytics and progress visualization
- **Comparative Analysis** - Peer comparison and performance benchmarking
- **Review Moderation** - Admin tools for content moderation and management

### Frontend Components
- `StarRating.js` - Reusable star rating component
- `ReviewForm.js` - Review submission form with validation
- `ReviewCard.js` - Review display with voting and reporting
- `ReputationDashboard.js` - Main dashboard with tabs and analytics
- `BadgeSystem.js` - Badge display and achievement tracking
- `ReputationCharts.js` - Data visualization with charts
- `ComparativeAnalysis.js` - Peer comparison tools
- `ReviewModerationPanel.js` - Admin moderation interface

### Backend API Routes
- `/api/reputation/profile/:userId` - Get/create reputation profiles
- `/api/reputation/review` - Submit reviews and ratings
- `/api/reputation/reviews/:userId` - Get user reviews
- `/api/reputation/badges/:userId` - Get user badges
- `/api/reputation/badge/award` - Award badges to users
- `/api/reputation/history/:userId` - Get reputation history
- `/api/reputation/metrics/:userId` - Get performance metrics
- `/api/reputation/review/:reviewId/vote` - Vote on reviews
- `/api/reputation/review/:reviewId/report` - Report reviews

## Database Schema

### Core Tables
- `reputation_profiles` - Main reputation data for each user type
- `ratings_reviews` - Reviews and ratings with moderation
- `badges` - Available badges and achievements
- `user_badges` - User's earned badges with progress
- `reputation_history` - Historical tracking of reputation changes
- `reputation_metrics` - Daily/weekly/monthly metrics
- `review_votes` - Helpful/not helpful votes on reviews
- `review_reports` - User reports for moderation

### Specialized Tables
- `provider_reputation_factors` - Provider-specific metrics
- `patient_reputation_factors` - Patient-specific metrics
- `contributor_reputation_factors` - Contributor-specific metrics
- `reputation_comparisons` - Peer comparison data
- `reputation_notifications` - System notifications

## Installation & Setup

### 1. Database Setup
The reputation schema is automatically loaded when the database initializes. The schema file is located at:
```
backend/database/reputation-schema.sql
```

### 2. Backend Integration
The reputation routes are automatically mounted in `server.js`:
```javascript
app.use('/api/reputation', authenticateToken, cacheMiddleware, reputationRoutes);
```

### 3. Frontend Integration
Reputation components are integrated into existing dashboards:

#### Patient Dashboard
- Added "Reputation" tab
- Reputation summary card in overview
- Full reputation dashboard access

#### Contributor Dashboard  
- Added "Reputation" tab
- Complete reputation system integration

#### Provider Dashboard (Future)
- Can be easily integrated following the same pattern

## Usage Examples

### Displaying Star Ratings
```jsx
import StarRating from './components/StarRating';

<StarRating 
  value={4.5} 
  onChange={(rating) => handleRatingChange(rating)}
  size="md"
  color="yellow"
  readonly={false}
/>
```

### Submitting a Review
```jsx
import ReviewForm from './components/ReviewForm';

<ReviewForm
  revieweeId={providerId}
  revieweeType="provider"
  onSubmit={handleReviewSubmit}
  onCancel={handleCancel}
/>
```

### Reputation Dashboard
```jsx
import ReputationDashboard from './components/ReputationDashboard';

<ReputationDashboard 
  userId={user.id} 
  profileType="patient" 
  currentUser={user}
/>
```

## Badge System

### Default Badges
- **First Review** - Received first positive review
- **Five Star Provider** - Maintained 5-star rating with 10+ reviews
- **Helpful Contributor** - Received 25 helpful votes
- **Quick Responder** - 90% response rate within 24 hours
- **Trusted Reviewer** - Posted 20 verified reviews
- **Expert Contributor** - 100+ quality contributions
- **Patient Champion** - Perfect attendance for 12 months
- **Quality Care Provider** - 4.5+ rating across all categories
- **Community Leader** - Top 10% in community engagement
- **Rising Star** - 1.0+ point improvement in 30 days

### Badge Levels
- **Bronze** - 3.0+ score, 5+ ratings
- **Silver** - 3.5+ score, 10+ ratings  
- **Gold** - 4.0+ score, 25+ ratings
- **Platinum** - 4.5+ score, 50+ ratings
- **Diamond** - 4.8+ score, 100+ ratings

## Review Categories

### Available Categories
- Service Quality
- Communication
- Timeliness
- Professionalism
- Expertise
- Bedside Manner
- Follow-up Care
- Overall Experience

## Moderation Features

### Review Moderation
- **Status Management** - Pending, Approved, Rejected, Flagged
- **Bulk Actions** - Approve/reject multiple reviews
- **Filtering** - By status, rating, category, date range
- **Reporting** - User reports with reasons
- **Voting** - Helpful/not helpful votes

### Report Reasons
- Spam
- Fake Review
- Inappropriate Content
- Conflict of Interest
- Personal Information
- Harassment
- Other

## Analytics & Insights

### Available Charts
- **Score Trends** - Line/area/bar charts for score changes
- **Rating Distribution** - Bar chart of rating breakdown
- **Category Distribution** - Pie chart of review categories
- **Daily Activity** - Multi-line chart of daily metrics
- **Monthly Summary** - Bar chart of monthly performance

### Comparative Analysis
- **Group Comparisons** - All providers, specialty, region, facility
- **Percentile Rankings** - User position within groups
- **Performance Gaps** - Areas for improvement
- **Top Performers** - Leaderboard rankings

## API Authentication

All reputation API endpoints require authentication via JWT token:
```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Performance Considerations

### Caching
- Reputation profiles cached for 5 minutes
- Review data cached for 2 minutes
- Badge data cached for 10 minutes

### Rate Limiting
- 100 requests per 15 minutes per IP
- Additional limits for review submission

### Database Indexing
- Comprehensive indexing on all frequently queried fields
- Optimized for reputation score calculations

## Security Features

### Review Validation
- Input sanitization and validation
- Duplicate review prevention
- Anonymous review options

### Moderation
- Admin-only moderation capabilities
- Audit trail for all moderation actions
- Automatic flagging for suspicious content

## Future Enhancements

### Planned Features
- AI-powered review sentiment analysis
- Automated reputation scoring algorithms
- Advanced analytics with machine learning
- Mobile app integration
- Social sharing features
- Provider verification badges

### Scalability
- Database sharding for large datasets
- Redis clustering for caching
- Microservices architecture options

## Troubleshooting

### Common Issues
1. **Database Schema Not Loading** - Ensure `reputation-schema.sql` exists in database folder
2. **Missing Reputation Data** - Check API authentication and user permissions
3. **Badge Not Displaying** - Verify badge data is properly loaded from API
4. **Charts Not Rendering** - Ensure Recharts library is properly installed

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=reputation:*
```

## Dependencies

### Frontend
- React 18+
- Recharts (for charts)
- Lucide React (icons)
- Axios (API calls)

### Backend
- Express.js
- SQLite3
- Express-validator
- JWT for authentication

## Contributing

When contributing to the reputation system:
1. Follow existing code patterns
2. Add proper error handling
3. Include comprehensive tests
4. Update documentation
5. Consider performance implications

## License

This reputation system is part of the healthcare platform and follows the same licensing terms as the main project.
