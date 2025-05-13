import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cueqhaexkoojemvewdki.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1ZXFoYWV4a29vamVtdmV3ZGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4NjI4MDgsImV4cCI6MjA2MjQzODgwOH0.L69J1V49vFNE8j3HnopHLqf4MWBQ9AlRu7VBoIlBlcE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);