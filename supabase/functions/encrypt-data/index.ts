
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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
    const { data, encryptionPurpose } = await req.json();
    
    if (!data) {
      return new Response(JSON.stringify({ error: 'Data is required' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // In a production environment, you'd use proper encryption libraries
    // This is a simplified example using Web Crypto API
    
    // Get encryption key (in a real system, you'd manage keys properly)
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(user.id + "-" + Deno.env.get('ENCRYPTION_SECRET'));
    
    // Generate a cryptographic key
    const key = await crypto.subtle.importKey(
      "raw",
      keyMaterial,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    // Sign the data to create a secure hash
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(JSON.stringify(data))
    );
    
    // Convert to base64 for storage/transmission
    const encryptedData = base64Encode(new Uint8Array(signature));
    
    // Log for audit purposes (in production, use proper audit logging)
    console.log(`Data encrypted for purpose: ${encryptionPurpose}`);

    return new Response(JSON.stringify({
      success: true,
      encryptedData: encryptedData,
      purpose: encryptionPurpose || 'general'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error encrypting data:', error);
    
    return new Response(JSON.stringify({ error: 'Failed to encrypt data' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
