import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ouxrcqjejncpmlaehonk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91eHJjcWplam5jcG1sYWVob25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5MjMsImV4cCI6MjA2NDYyNTkyM30.WFXH4Y4wS8-5rR3jA56Goa_bbbOJ4Ky26cH43fd_5UI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  localStorage: AsyncStorage,
});