
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://fxmwdwdkgppvhneqxfvf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4bXdkd2RrZ3BwdmhuZXF4ZnZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MDA2MjQsImV4cCI6MjA4MTM3NjYyNH0.fNyFvYKy2oMc7f3iOrQRWIRZkqpvVKGUdymraz8zYDg';


export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});