import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bkkxqycigwahyoxtpolz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJra3hxeWNpZ3dhaHlveHRwb2x6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NTQxNzcsImV4cCI6MjA3MTIzMDE3N30.GpSt-ZVtBh2EMSE5_D86dkRaWqTo0ootjX8qylVe5e4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)