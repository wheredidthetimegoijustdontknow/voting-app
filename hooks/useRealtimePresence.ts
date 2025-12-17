'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceUser {
  id: string;
  username?: string;
  joined_at: string;
}

interface UseRealtimePresenceOptions {
  userId: string | null;
  username?: string;
}

interface PresenceState {
  users: PresenceUser[];
  isConnected: boolean;
  onlineCount: number;
}

// Global presence channel name
const GLOBAL_PRESENCE_CHANNEL = 'site_presence';

export function useRealtimePresence({ 
  userId, 
  username 
}: UseRealtimePresenceOptions) {
  const [presenceState, setPresenceState] = useState<PresenceState>({
    users: [],
    isConnected: false,
    onlineCount: 0,
  });

  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch usernames for user IDs from presence state
  const fetchUsernames = useCallback(async (userIds: string[]): Promise<Record<string, string>> => {
    if (userIds.length === 0) return {};

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (error) {
        console.error('Error fetching usernames:', error);
        return {};
      }

      // Create a map of userId -> username
      const usernameMap: Record<string, string> = {};
      profiles?.forEach(profile => {
        usernameMap[profile.id] = profile.username;
      });

      return usernameMap;
    } catch (error) {
      console.error('Error in fetchUsernames:', error);
      return {};
    }
  }, [supabase]);

  // Update presence state with usernames
  const updatePresenceWithUsernames = useCallback(async (users: PresenceUser[]) => {
    const userIds = users.map(user => user.id);
    const usernameMap = await fetchUsernames(userIds);

    const usersWithUsernames = users.map(user => ({
      ...user,
      username: usernameMap[user.id] || 'Anonymous User'
    }));

    setPresenceState(prev => ({
      ...prev,
      users: usersWithUsernames,
      onlineCount: usersWithUsernames.length,
    }));
  }, [fetchUsernames]);

  // Handle presence state changes
  const handlePresenceSync = useCallback(() => {
    const channel = channelRef.current;
    if (!channel) return;

    const presenceState = channel.presenceState();
    const users: PresenceUser[] = [];

    // Extract user information from presence state
    Object.values(presenceState).forEach((presences: any) => {
      presences.forEach((presence: any) => {
        users.push({
          id: presence.user_id,
          username: presence.username,
          joined_at: presence.joined_at,
        });
      });
    });

    // Update presence state with usernames
    updatePresenceWithUsernames(users);
  }, [updatePresenceWithUsernames]);

  // Set up realtime presence subscription
  useEffect(() => {
    if (!userId) {
      console.log('useRealtimePresence: Missing userId');
      return;
    }

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Create new global presence channel
    const channel = supabase.channel(GLOBAL_PRESENCE_CHANNEL, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channelRef.current = channel;

    // Set up presence event handlers
    channel
      .on('presence', { event: 'sync' }, handlePresenceSync)
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        handlePresenceSync();
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        handlePresenceSync();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to global presence channel:', GLOBAL_PRESENCE_CHANNEL);
          
          // Track presence
          const trackStatus = await channel.track({
            user_id: userId,
            username: username || 'Anonymous User',
            joined_at: new Date().toISOString(),
          });

          if (trackStatus === 'ok') {
            setPresenceState(prev => ({ ...prev, isConnected: true }));
          } else {
            console.error('Failed to track presence:', trackStatus);
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to global presence channel:', GLOBAL_PRESENCE_CHANNEL);
          setPresenceState(prev => ({ ...prev, isConnected: false }));
        } else if (status === 'TIMED_OUT') {
          console.error('Timeout subscribing to global presence channel:', GLOBAL_PRESENCE_CHANNEL);
          setPresenceState(prev => ({ ...prev, isConnected: false }));
        }
      });

    // Cleanup function
    return () => {
      console.log('Cleaning up global presence channel:', GLOBAL_PRESENCE_CHANNEL);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setPresenceState({
        users: [],
        isConnected: false,
        onlineCount: 0,
      });
    };
  }, [userId, username, supabase, handlePresenceSync]);

  // Manual refresh function to re-fetch usernames
  const refreshUsernames = useCallback(async () => {
    const currentUsers = presenceState.users;
    if (currentUsers.length > 0) {
      await updatePresenceWithUsernames(currentUsers);
    }
  }, [presenceState.users, updatePresenceWithUsernames]);

  return {
    users: presenceState.users,
    isConnected: presenceState.isConnected,
    onlineCount: presenceState.onlineCount,
    refreshUsernames,
  };
}