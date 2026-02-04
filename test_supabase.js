
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xkfyhzaccieydntnrloi.supabase.co'
const supabaseKey = 'sb_publishable_iVklYthh2ml8-3OSF8xrdw_1KwGc0IC'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log('Testing Supabase connection...')
    try {
        const { data, error } = await supabase.from('test').select('*').limit(1)
        if (error) {
            // If table doesn't exist, we might get a 404 or specific error, but it connects.
            // If auth fails, we get 401 or similar.
            console.log('Connection Error:', error.message)
        } else {
            console.log('Connection Successful')
        }

        // Test Sign In with fake user to check if auth endpoint is reachable
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: 'test@example.com',
            password: 'password'
        })

        if (authError) {
            console.log('Auth Error (Expected for fake user):', authError.message)
            if (authError.message.includes('Invalid API key')) {
                console.error('CRITICAL: API Key appears to be invalid')
            }
        } else {
            console.log('Auth response received (Unexpected success for fake user?)')
        }

    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

testConnection()
