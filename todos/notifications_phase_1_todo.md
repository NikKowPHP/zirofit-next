# Notifications Phase 1 Implementation Tasks

## 1. Database Schema Implementation
**Create Prisma migration:**
- Add Notification model to schema.prisma
- Include fields: id, userId, message, type, readStatus, createdAt
- Define relation to User model

**Verification:**
- Migration file exists in prisma/migrations
- Schema includes Notification model with correct fields

## 2. API Endpoints Setup
**Create API routes:**
- GET /api/notifications - List user's notifications
- POST /api/notifications/mark-read - Mark notification as read
- Add types in types/notifications.ts

**Verification:**
- Routes respond with correct status codes
- TypeScript definitions exist

## 3. Notification UI Components
**Create components:**
- NotificationIndicator (navbar bell icon)
- NotificationList (dropdown with notifications)
- Add to src/components/notifications/

**Verification:**
- Components render correctly
- Unread count updates when notifications change

## 4. Milestone Detection Logic
**Implement triggers:**
- Add milestone checks after workout completion
- Create notifications for weight goals, streak achievements
- Add to src/lib/milestones.ts

**Verification:**
- Notifications created when milestones are hit
- Test cases cover major milestone types

## 5. Real-time Updates
**Setup WebSocket:**
- Implement basic WS server
- Add notification event publishing
- Client-side subscription in NotificationIndicator

**Verification:**
- Notifications appear without refresh
- Connection handles disconnects gracefully