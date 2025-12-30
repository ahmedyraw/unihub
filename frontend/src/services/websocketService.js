import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { WS_BASE_URL, STORAGE_KEYS } from '../utils/constants';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscribers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Connect to WebSocket with authentication
   */
  connect(onConnected) {
    if (this.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => {
        // Add token to WebSocket connection
        return new SockJS(`${WS_BASE_URL}?token=${encodeURIComponent(token)}`);
      },
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('STOMP Debug:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        if (onConnected) onConnected();
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected');
        this.connected = false;
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
          this.disconnect();
        }
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      }
    });

    this.client.activate();
  }

  /**
   * Disconnect from WebSocket and cleanup
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe from all topics first
      this.unsubscribeAll();
      
      this.client.deactivate();
      this.connected = false;
      this.reconnectAttempts = 0;
      console.log('WebSocket disconnected and cleaned up');
    }
  }

  /**
   * Subscribe to badge promotions for specific user
   */
  subscribeToBadgePromotions(userId, callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected, skipping badge subscription');
      return null;
    }

    try {
      const subscription = this.client.subscribe(
        `/topic/badge-promotion/${userId}`,
        (message) => {
          try {
            const badgeData = JSON.parse(message.body);
            callback(badgeData);
          } catch (error) {
            console.error('Error parsing badge promotion message:', error);
          }
        }
      );

      this.subscribers.set(`badge-${userId}`, subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to badge promotions:', error);
      return null;
    }
  }

  /**
   * Subscribe to leaderboard updates
   */
  subscribeToLeaderboardUpdates(callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected, skipping leaderboard subscription');
      return null;
    }

    try {
      const subscription = this.client.subscribe(
        '/topic/leaderboard-update',
        (message) => {
          try {
            const data = JSON.parse(message.body);
            callback(data);
          } catch (error) {
            console.error('Error parsing leaderboard update:', error);
          }
        }
      );

      this.subscribers.set('leaderboard', subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to leaderboard updates:', error);
      return null;
    }
  }

  /**
   * Subscribe to dashboard updates for specific user
   */
  subscribeToDashboardUpdates(userId, callback) {
    if (!this.client || !this.connected) {
      console.warn('WebSocket not connected, skipping dashboard subscription');
      return null;
    }

    try {
      const subscription = this.client.subscribe(
        `/topic/dashboard-update/${userId}`,
        (message) => {
          try {
            const data = JSON.parse(message.body);
            callback(data);
          } catch (error) {
            console.error('Error parsing dashboard update:', error);
          }
        }
      );

      this.subscribers.set(`dashboard-${userId}`, subscription);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to dashboard updates:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(key) {
    const subscription = this.subscribers.get(key);
    if (subscription) {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.warn('Error unsubscribing:', error);
      }
      this.subscribers.delete(key);
    }
  }

  /**
   * Unsubscribe from all topics
   */
  unsubscribeAll() {
    this.subscribers.forEach((subscription) => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    this.subscribers.clear();
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
