import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { storage } from './storage';

interface ChatMessage {
  type: 'message';
  groupId: number;
  userId: number;
  content: string;
  timestamp: Date;
}

interface JoinGroupMessage {
  type: 'join';
  groupId: number;
  userId: number;
}

type WebSocketMessage = ChatMessage | JoinGroupMessage;

// Store active connections
const clients = new Map<number, WebSocket>();
const groupSubscriptions = new Map<number, Set<number>>();

export function setupWebsocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    let userId: number | null = null;

    ws.on('message', async (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        if (message.type === 'join') {
          // Store user connection and group subscription
          userId = message.userId;
          clients.set(userId, ws);

          // Add user to group subscribers
          if (!groupSubscriptions.has(message.groupId)) {
            groupSubscriptions.set(message.groupId, new Set());
          }
          groupSubscriptions.get(message.groupId)?.add(userId);

        } else if (message.type === 'message') {
          // Store message in database
          await storage.createMessage({
            content: message.content,
            groupId: message.groupId,
            userId: message.userId
          });

          // Broadcast to all clients in the group
          const subscribers = groupSubscriptions.get(message.groupId) || new Set();
          
          for (const subscriberId of subscribers) {
            const client = clients.get(subscriberId);
            if (client && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(message));
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        // Remove user from clients
        clients.delete(userId);
        
        // Remove user from all group subscriptions
        for (const [groupId, subscribers] of groupSubscriptions.entries()) {
          subscribers.delete(userId);
          if (subscribers.size === 0) {
            groupSubscriptions.delete(groupId);
          }
        }
      }
    });
  });

  return wss;
}
