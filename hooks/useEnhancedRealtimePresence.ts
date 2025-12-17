'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface PresenceUser {
  id: string;
  username?: string;
  joined_at: string;
  last_seen?: number; // Track when we last saw this user
}

interface UseRealtimePresenceOptions {
  userId: string | null;
  username?: string;
}

interface PresenceState {
  users: PresenceUser[];
  isConnected: boolean;
  onlineCount: number;
  connectionError: string | null;
}

// Cache users for 60 seconds after they disconnect (like Facebook)
const PRESENCE_CACHE_DURATION = 60000; // 60 seconds

export function useEnhancedRealtimePresence({
  userId,
  username
}: UseRealtimePresenceOptions) {
  const [presenceState, setPresenceState] = useState<PresenceState>({
    users: [],
    isConnected: false,
    onlineCount: 0,
    connectionError: null,
  });

  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(0);
  const isTrackingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isConnectingRef = useRef(false);
  
  // Cache for holding users after they disconnect
  const userCacheRef = useRef<Map<string, PresenceUser>>(new Map());
  const cacheCleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced username fetching with timeout
  const fetchUsernames = useCallback(async (userIds: string[]): Promise<Record<string, string>> => {
    if (userIds.length === 0) return {};

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Username fetch timeout')), 5000);
      });

      const fetchPromise = supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      const { data: profiles, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching usernames:', error);
        return {};
      }

      // Create a map of userId -> username
      const usernameMap: Record<string, string> = {};
      profiles?.forEach((profile: any) => {
        usernameMap[profile.id] = profile.username;
      });

      return usernameMap;
    } catch (error) {
      console.error('Error in fetchUsernames:', error);
      return {};
    }
  }, [supabase]);

  // Enhanced presence state update with caching
  const updatePresenceWithUsernames = useCallback(async (users: PresenceUser[]) => {
    const now = Date.now();
    const userIds = users.map(user => user.id);
    const usernameMap = await fetchUsernames(userIds);

    const usersWithUsernames = users.map(user => ({
      ...user,
      username: usernameMap[user.id] || user.username || 'Anonymous User',
      last_seen: now, // Mark when we saw them
    }));

    // Update cache with active users
    usersWithUsernames.forEach(user => {
      userCacheRef.current.set(user.id, user);
    });

    // Include cached users that are still within grace period
    const cachedUsers = Array.from(userCacheRef.current.values()).filter(cachedUser => {
      const timeSinceLastSeen = now - (cachedUser.last_seen || 0);
      return timeSinceLastSeen < PRESENCE_CACHE_DURATION;
    });

    // Merge active and cached users (deduplicate by id)
    const allUsersMap = new Map<string, PresenceUser>();
    cachedUsers.forEach(user => allUsersMap.set(user.id, user));
    usersWithUsernames.forEach(user => allUsersMap.set(user.id, user));
    
    const finalUsers = Array.from(allUsersMap.values());

    setPresenceState(prev => ({
      ...prev,
      users: finalUsers,
      onlineCount: finalUsers.length,
      connectionError: null,
    }));
  }, [fetchUsernames]);

  // Enhanced heartbeat with better error handling
  const sendHeartbeat = useCallback(async () => {
    const channel = channelRef.current;
    if (!channel || !userId) return;

    // Prevent rapid heartbeat calls
    const now = Date.now();
    if (now - lastHeartbeatRef.current < 12000) { // Minimum 12 seconds between heartbeats
      return;
    }
    lastHeartbeatRef.current = now;

    try {
      // Add timeout to heartbeat
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Heartbeat timeout')), 3000);
      });

      const heartbeatPromise = channel.track({
        user_id: userId,
        username: username || 'Anonymous User',
        joined_at: new Date().toISOString(),
      });

      const trackStatus = await Promise.race([heartbeatPromise, timeoutPromise]);

      if (trackStatus !== 'ok') {
        console.warn('Heartbeat failed:', trackStatus);
        setPresenceState(prev => ({ ...prev, connectionError: 'Heartbeat failed' }));
      } else {
        console.debug('Heartbeat sent successfully');
        setPresenceState(prev => ({ ...prev, connectionError: null }));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Heartbeat error:', errorMsg);
      setPresenceState(prev => ({ ...prev, connectionError: 'Heartbeat error' }));
    }
  }, [userId, username]);

  // Enhanced presence sync handler
  const handlePresenceSync = useCallback(() => {
    const channel = channelRef.current;
    if (!channel) return;

    try {
      const presenceState = channel.presenceState();
      const users: PresenceUser[] = [];

      // Extract user information from presence state
      Object.values(presenceState).forEach((presences: any) => {
        if (Array.isArray(presences)) {
          presences.forEach((presence: any) => {
            users.push({
              id: presence.user_id,
              username: presence.username,
              joined_at: presence.joined_at,
            });
          });
        }
      });

      // Update presence state with usernames
      updatePresenceWithUsernames(users);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error handling presence sync:', errorMsg);
      setPresenceState(prev => ({ ...prev, connectionError: 'Presence sync error' }));
    }
  }, [updatePresenceWithUsernames]);

  // Enhanced subscription setup with reconnection logic
  const setupPresenceSubscription = useCallback(() => {
    if (isConnectingRef.current || !userId) return;
    isConnectingRef.current = true;
    setPresenceState(prev => ({ ...prev, connectionError: null }));

    // Clean up existing channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Clear existing heartbeat
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }

    // Clear existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Use shared presence channel to see simulation users
    const channelName = `voting_app_shared_presence`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    channelRef.current = channel;

    // Set up presence event handlers with enhanced error handling
    channel
      .on('presence', { event: 'sync' }, handlePresenceSync)
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined presence:', key, newPresences?.length || 0);
        setPresenceState(prev => ({ ...prev, connectionError: null }));
        handlePresenceSync();
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left presence:', key, leftPresences?.length || 0);
        setPresenceState(prev => ({ ...prev, connectionError: null }));
        handlePresenceSync();
      })
      .subscribe(async (status, err) => {
        isConnectingRef.current = false;

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to presence channel:', channelName);
          
          setPresenceState(prev => ({ ...prev, isConnected: true, connectionError: null }));
          
          // Track presence with timeout
          try {
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error('Presence tracking timeout')), 5000);
            });

            const trackPromise = channel.track({
              user_id: userId,
              username: username || 'Anonymous User',
              joined_at: new Date().toISOString(),
            });

            const trackStatus = await Promise.race([trackPromise, timeoutPromise]);

            if (trackStatus === 'ok') {
              isTrackingRef.current = true;
              
              // Start heartbeat to keep presence active (every 15 seconds)
              heartbeatIntervalRef.current = setInterval(sendHeartbeat, 15000);
              console.log('Presence heartbeat started (15s interval)');
              
              // Send initial heartbeat
              await sendHeartbeat();
            } else {
              throw new Error(`Failed to track presence: ${trackStatus}`);
            }
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error tracking presence:', errorMsg);
            setPresenceState(prev => ({
              ...prev,
              isConnected: false,
              connectionError: 'Failed to track presence'
            }));
            
            // Attempt reconnection
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Attempting to reconnect presence...');
              setupPresenceSubscription();
            }, 5000);
          }
        } else if (status === 'CHANNEL_ERROR') {
          const errorMsg = err?.message || 'Unknown channel error';
          console.error('❌ Error subscribing to presence channel:', errorMsg);
          setPresenceState(prev => ({
            ...prev,
            isConnected: false,
            connectionError: 'Channel subscription failed'
          }));
          
          // Attempt reconnection after delay
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect presence after error...');
            setupPresenceSubscription();
          }, 5000);
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Timeout subscribing to presence channel');
          setPresenceState(prev => ({
            ...prev,
            isConnected: false,
            connectionError: 'Connection timed out'
          }));
          
          // Attempt reconnection with longer delay
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect presence after timeout...');
            setupPresenceSubscription();
          }, 10000);
        }
      });
  }, [supabase, handlePresenceSync, sendHeartbeat, userId, username]);

  // Set up realtime presence subscription
  useEffect(() => {
    if (!userId) {
      console.log('useRealtimePresence: No userId provided, skipping subscription');
      setPresenceState(prev => ({ ...prev, isConnected: false }));
      return;
    }

    setupPresenceSubscription();

    // Start cache cleanup interval (every 10 seconds)
    cacheCleanupIntervalRef.current = setInterval(() => {
      const now = Date.now();
      let removedCount = 0;
      
      // Remove users who have been offline for longer than cache duration
      for (const [userId, user] of userCacheRef.current.entries()) {
        const timeSinceLastSeen = now - (user.last_seen || 0);
        if (timeSinceLastSeen >= PRESENCE_CACHE_DURATION) {
          userCacheRef.current.delete(userId);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        console.log(`🧹 Cleaned up ${removedCount} expired users from cache`);
        // Trigger re-render with updated cache
        handlePresenceSync();
      }
    }, 10000); // Every 10 seconds

    // Enhanced cleanup function
    return () => {
      console.log('Cleaning up presence subscription');
      
      // Clear all timeouts
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (cacheCleanupIntervalRef.current) {
        clearInterval(cacheCleanupIntervalRef.current);
        cacheCleanupIntervalRef.current = null;
      }
      
      // Remove channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      // Clear cache
      userCacheRef.current.clear();
      
      isTrackingRef.current = false;
      isConnectingRef.current = false;
      setPresenceState({
        users: [],
        isConnected: false,
        onlineCount: 0,
        connectionError: null,
      });
    };
  }, [userId, username, setupPresenceSubscription, handlePresenceSync]);

  // Enhanced manual refresh function
  const refreshUsernames = useCallback(async () => {
    console.log('Refreshing usernames...');
    const currentUsers = presenceState.users;
    if (currentUsers.length > 0) {
      await updatePresenceWithUsernames(currentUsers);
    }
  }, [presenceState.users, updatePresenceWithUsernames]);

  return {
    users: presenceState.users,
    isConnected: presenceState.isConnected,
    onlineCount: presenceState.onlineCount,
    connectionError: presenceState.connectionError,
    refreshUsernames,
  };
}
