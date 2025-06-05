import { createClient } from '@supabase/supabase-js';
import { apiRequest } from './queryClient';

// Supabase configuration will be fetched from the backend
let supabaseClient: any = null;

// Initialize Supabase client with config from backend
export async function initializeSupabase() {
  try {
    const response = await fetch('/api/config/supabase');
    const config = await response.json();
    supabaseClient = createClient(config.url, config.anonKey);
    return supabaseClient;
  } catch (error) {
    console.warn('Failed to initialize Supabase client:', error);
    return null;
  }
}

// Get the initialized Supabase client
export function getSupabaseClient() {
  return supabaseClient;
}

// File upload utility using the backend upload endpoint
export async function uploadFile(file: File, onProgress?: (progress: number) => void): Promise<{
  url: string;
  storageKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  type: string;
}> {
  const formData = new FormData();
  formData.append('file', file);

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

// Real-time chat utilities
export function subscribeToGroupMessages(groupId: number, onMessage: (message: any) => void) {
  if (!supabaseClient) return null;

  const channel = supabaseClient
    .channel(`group_${groupId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `group_id=eq.${groupId}`
    }, onMessage)
    .subscribe();

  return channel;
}

export function unsubscribeFromChannel(channel: any) {
  if (channel && supabaseClient) {
    supabaseClient.removeChannel(channel);
  }
}

// Initialize Supabase when the module loads
initializeSupabase();