-- Phase 8: Users Directory Features Migration
-- Creates tables for DM, Wave, and Report functionality

-- Create notifications table for user interactions
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_reports table for reporting functionality
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    reporting_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    category VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user ON user_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporting_user ON user_reports(reporting_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status);

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Only service role can insert notifications (for now, can be expanded later)
CREATE POLICY "Service role can insert notifications" ON notifications
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- RLS Policies for user_reports
CREATE POLICY "Users can view their own reports" ON user_reports
    FOR SELECT USING (auth.uid() = reporting_user_id OR auth.uid() = reported_user_id);

CREATE POLICY "Users can create reports" ON user_reports
    FOR INSERT WITH CHECK (auth.uid() = reporting_user_id);

-- Moderators and admins can view all reports
CREATE POLICY "Moderators and admins can view all reports" ON user_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('moderator', 'admin')
        )
    );

-- Moderators and admins can update report status
CREATE POLICY "Moderators and admins can update report status" ON user_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('moderator', 'admin')
        )
    );

-- Add comment to explain the tables
COMMENT ON TABLE notifications IS 'Stores user notifications for DMs, waves, and other interactions';
COMMENT ON TABLE user_reports IS 'Stores user reports for moderation purposes';