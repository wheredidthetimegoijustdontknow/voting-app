# Users Directory Feature Documentation

## Overview

The Users Directory is a comprehensive feature that allows community members to discover, connect with, and interact with other users on the platform. It provides a browsable directory with search capabilities, user interaction features, and moderation tools.

## Feature Components

### 1. Frontend Components

#### Users Directory Page (`app/users/page.tsx`)
- **Type**: Server-side rendered page
- **Purpose**: Main directory interface with search and filtering
- **Features**:
  - "Back to Polls" navigation button
  - Search users by username (case-insensitive)
  - Filter by user role (All, Users, Moderators, Admins)
  - Real-time results count
  - Responsive design
  - Error handling and loading states

#### Users Table Component (`components/users/UsersTable.tsx`)
- **Type**: Client-side interactive component
- **Purpose**: Display users in a table format with action buttons
- **Features**:
  - User profile display with avatars and role badges
  - Interactive action buttons (DM, Wave, Report)
  - Loading states and toast notifications
  - Responsive table design
  - Smart user identification (current user highlighting)

### 2. Backend Implementation

#### Server Actions (`app/actions/users.ts`)

**sendDirectMessage()**
- **Purpose**: Send direct messages between users
- **Validation**: Zod schema validation for username and message content
- **Security**: Prevents self-messaging, authentication required
- **Database**: Creates notification records for message delivery
- **Return**: Success/error response with user feedback

**waveAtUser()**
- **Purpose**: Send friendly greeting notifications
- **Validation**: Username validation with Zod
- **Security**: Prevents self-waving, authentication required
- **Database**: Creates wave notification records
- **Return**: Success/error response with confirmation

**reportUser()**
- **Purpose**: Allow users to report inappropriate behavior
- **Validation**: Comprehensive validation including reason and category
- **Security**: Prevents self-reporting, authentication required
- **Database**: Creates report records and confirmation notifications
- **Categories**: spam, harassment, inappropriate_content, other
- **Return**: Success/error response with submission confirmation

### 3. Database Schema

#### Notifications Table
```sql
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'dm_request', 'wave', 'report_submitted'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional structured data
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### User Reports Table
```sql
CREATE TABLE user_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reporting_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'spam', 'harassment', 'inappropriate_content', 'other'
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Security & Permissions

#### Row Level Security (RLS)
- **Notifications**: Users can only view and update their own notifications
- **User Reports**: 
  - Users can view reports they submitted or were reported on
  - Moderators and admins can view all reports
  - Only service role can insert notifications
  - Only authenticated users can create reports

#### Authentication & Validation
- All actions require user authentication
- Comprehensive input validation using Zod schemas
- Prevention of self-interactions (messaging, waving, reporting)
- Rate limiting considerations for future implementation

## User Experience

### Navigation Flow
1. **Access**: Users can access the directory via the "Users" link in the sidebar
2. **Back Navigation**: "Back to Polls" button provides quick return to main polls page
3. **Browse**: View all community members in a paginated table format
4. **Search**: Use the search bar to find specific users by username
5. **Filter**: Apply role-based filters to narrow down results
6. **Interact**: Click action buttons to DM, wave, or report users
7. **Profile**: Click on usernames to view user profiles
8. **Smart Back**: Profile pages show context-aware back button ("Back to Users" when from directory, "Back to Polls" otherwise)

### Interactive Features

#### Direct Messaging (DM)
- Click "DM" button next to any user
- Enter message in prompt dialog
- System creates notification for target user
- Sender receives confirmation toast

#### Wave Feature
- Click "Wave" button for friendly greeting
- Creates notification for target user
- Shows immediate success feedback
- Encourages community engagement

#### Reporting System
- Click "Report" button for inappropriate behavior
- Select category and provide reason
- Creates moderation report for review
- Sender receives confirmation of submission

### UI/UX Features
- **Loading States**: Buttons show "Sending...", "Waving...", "Reporting..." during actions
- **Toast Notifications**: Success and error feedback for all actions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Visual Feedback**: Role badges, user highlighting, and status indicators

## Technical Architecture

### Component Structure
```
app/users/
├── page.tsx                    # Main directory page
└── (supporting components)

components/users/
└── UsersTable.tsx             # Interactive user table

app/actions/
└── users.ts                   # Server actions for user interactions

supabase/migrations/
└── phase_8_users_directory_features.sql  # Database schema
```

### Data Flow
1. **Page Load**: Server component fetches users with search/filter parameters
2. **User Interaction**: Client component handles button clicks and form submissions
3. **Server Action**: FormData sent to server actions for processing
4. **Database**: Server actions create notifications and reports
5. **Feedback**: Toast notifications provide user feedback
6. **Revalidation**: Cache invalidation keeps data fresh

### Error Handling
- **Network Errors**: Graceful handling with retry options
- **Validation Errors**: User-friendly error messages
- **Authentication**: Redirect to login when required
- **Database Errors**: Logged with user-safe error messages

## Future Enhancements

### Potential Improvements
1. **Real-time Notifications**: WebSocket integration for instant notifications
2. **Advanced Messaging**: Full chat interface instead of simple notifications
3. **User Blocking**: Allow users to block unwanted interactions
4. **Moderation Dashboard**: Enhanced tools for handling reports
5. **Analytics**: Track user engagement and interaction metrics
6. **Bulk Actions**: Select multiple users for batch operations
7. **Export Functionality**: Download user data for administrative purposes

### Scalability Considerations
- **Pagination**: Implement for large user bases
- **Search Optimization**: Full-text search for better performance
- **Caching**: Redis integration for frequently accessed data
- **Rate Limiting**: Prevent spam and abuse
- **Queue System**: Handle high-volume notifications

## Testing

### Manual Testing Checklist
- [x] Navigate to Users directory from sidebar
- [x] Search for users by username
- [x] Filter users by role
- [x] Send direct message to another user
- [x] Wave at another user
- [x] Report a user with valid reason
- [x] Test error handling for invalid inputs
- [x] Verify loading states during actions
- [x] Check responsive design on mobile
- [x] Test profile navigation and back button behavior
- [x] Verify "Back to Polls" button functionality

### Automated Testing Considerations
- Unit tests for server actions
- Integration tests for database operations
- E2E tests for user workflows
- Performance tests for large datasets

## Deployment Notes

### Database Migration
- Run `supabase db push` to apply the migration
- Verify RLS policies are working correctly
- Test with different user roles

### Environment Configuration
- Ensure Supabase client is properly configured
- Verify authentication is working
- Check environment variables for production

### Monitoring
- Monitor notification creation rates
- Track report submission patterns
- Watch for authentication failures
- Monitor database performance

## Troubleshooting

### Common Issues
1. **Notifications Not Appearing**: Check RLS policies and user authentication
2. **Search Not Working**: Verify database indexing and query parameters
3. **Actions Failing**: Check server action implementation and error logs
4. **UI Issues**: Verify component imports and CSS classes

### Debug Steps
1. Check browser console for JavaScript errors
2. Verify network requests in browser dev tools
3. Check Supabase logs for database errors
4. Test with different user accounts
5. Verify environment configuration

## Recent Updates

### Version 1.1 (December 20, 2024)
- Added "Back to Polls" button to users directory page for improved navigation
- Enhanced profile page back button logic with context awareness
- Updated implementation documentation with task completion checklist
- Verified all functionality and user requirements

---

*Last Updated: December 20, 2024*
*Version: 1.1*