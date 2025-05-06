
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Now we can get the session or user object
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get request body
    const { name } = await req.json();
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return new Response(JSON.stringify({ error: 'API key name is required' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate a secure random API key
    const apiKeyBytes = new Uint8Array(32); // 256 bits
    crypto.getRandomValues(apiKeyBytes);
    const apiKey = Array.from(apiKeyBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Create a key prefix for identification
    const prefix = 'ak_';
    const fullApiKey = `${prefix}${apiKey}`;
    
    // Hash the API key for storage (in a real system, use a proper hashing algorithm)
    const encoder = new TextEncoder();
    const data = encoder.encode(fullApiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedKey = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Store the hashed key in the database with the associated user
    const { data: insertData, error: insertError } = await supabaseClient
      .from('api_keys')
      .insert({
        user_id: user.id,
        name,
        key_hash: hashedKey,
        key_preview: `${prefix}****${apiKey.substring(apiKey.length - 4)}`,
        permissions: ['read'],
      })
      .select();
    
    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify({ key: fullApiKey, data: insertData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error generating API key:', error);
    
    return new Response(JSON.stringify({ error: 'Failed to generate API key' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
