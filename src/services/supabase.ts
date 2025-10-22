import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://eosfvrbpcsdqvvmoecde.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2Z2cmJwY3NkcXZ2bW9lY2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNjMyMTksImV4cCI6MjA3NjYzOTIxOX0.g7-LcRqQcQwbhaKh9C5B5H_rr8w-HWFkZiTLgkkgX94';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const createAnonymousUser = async () => {
  const { data: { user }, error } = await supabase.auth.signUp({
    email: `${Math.random().toString(36).slice(2)}@anonymous.com`,
    password: Math.random().toString(36).slice(2),
  });
  return { user, error };
}; 