
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Copy, Key, AlertTriangle, Plus, Trash } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";

interface APIKey {
  id: string;
  name: string;
  key_preview: string;
  created_at: string;
  last_used: string | null;
  permissions: string[];
}

export function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAPIKeys();
  }, [user]);

  const fetchAPIKeys = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching API keys",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAPIKey = async () => {
    if (!newKeyName.trim() || !user) {
      toast({
        title: "Validation Error",
        description: "Please enter a name for your API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('generate-api-key', {
        body: { name: newKeyName }
      });
      
      if (error) throw error;
      
      setShowNewKey(data.key);
      setNewKeyName('');
      fetchAPIKeys();
      
      toast({
        title: "API Key Created",
        description: "Your new API key has been generated successfully. Make sure to copy it now as you won't be able to see it again.",
      });
    } catch (error: any) {
      toast({
        title: "Error generating API key",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const revokeAPIKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from('api_keys')
        .delete()
        .eq('id', keyId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
      
      toast({
        title: "API Key Revoked",
        description: "The API key has been revoked successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error revoking API key",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "API key copied to clipboard",
        });
      },
      () => {
        toast({
          title: "Failed to copy",
          description: "Permission denied to access clipboard",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
        <CardDescription>
          Create and manage API keys for accessing the API programmatically.
          Keep your API keys secure and never share them publicly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showNewKey && (
          <Alert className="mb-6 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>New API Key Generated</AlertTitle>
            <AlertDescription>
              <p className="mb-2">Copy this key now. You won't be able to see it again!</p>
              <div className="flex items-center gap-2">
                <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm break-all">
                  {showNewKey}
                </code>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(showNewKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="new-key-name">New API Key Name</Label>
            <div className="flex gap-2">
              <Input
                id="new-key-name"
                placeholder="My API Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
              <Button onClick={generateAPIKey}>
                <Plus className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your API Keys</h3>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading API keys...</p>
          ) : apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">You don't have any API keys yet.</p>
          ) : (
            <div className="divide-y">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="py-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-medium flex items-center">
                      <Key className="h-4 w-4 mr-2 text-amber-500" />
                      {apiKey.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-mono">{apiKey.key_preview}</span>
                      <span className="mx-2">•</span>
                      <span>Created: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                      {apiKey.last_used && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Last used: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeAPIKey(apiKey.id)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
