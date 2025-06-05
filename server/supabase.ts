import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client-side Supabase configuration for frontend
export const supabaseConfig = {
  url: supabaseUrl,
  anonKey: process.env.SUPABASE_ANON_KEY!,
};

// File upload utilities
export async function uploadFile(file: Buffer, fileName: string, bucket: string = 'materials'): Promise<string> {
  const fileExt = fileName.split('.').pop();
  const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: 'application/octet-stream',
      upsert: false
    });

  if (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function deleteFile(filePath: string, bucket: string = 'materials'): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }
}

// Real-time chat utilities
export function createRealtimeChannel(channelName: string) {
  return supabase.channel(channelName);
}