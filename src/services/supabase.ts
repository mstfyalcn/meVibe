import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hjqfdhguliadngtjajlo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcWZkaGd1bGlhZG5ndGphamxvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNzA1NDcsImV4cCI6MjA1Njk0NjU0N30.VwTl91rYkfx8n_wBOxJVsMmwBcchDl25kmTIp3xK5cQ';

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