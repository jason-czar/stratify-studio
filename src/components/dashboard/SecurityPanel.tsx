
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { APIKeyManager } from '@/components/security/APIKeyManager';
import { AlertManager } from '@/components/alerts/AlertManager';
import { RiskManager } from '@/components/risk/RiskManager';
import { AlgorithmTemplates } from '@/components/templates/AlgorithmTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Shield, Lightbulb, AlertTriangle, Settings } from 'lucide-react';

export function SecurityPanel() {
  const navigate = useNavigate();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              Security & Tools
            </CardTitle>
            <CardDescription>
              Manage security settings and advanced trading tools
            </CardDescription>
          </div>
          <Button onClick={() => navigate('/security')}>
            <Settings className="h-4 w-4 mr-2" />
            All Settings
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="alerts">
          <TabsList className="mb-4 grid grid-cols-3 w-full">
            <TabsTrigger value="alerts">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="risk">
              <Shield className="h-4 w-4 mr-2" />
              Risk
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Lightbulb className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="alerts">
            <AlertManager />
          </TabsContent>
          
          <TabsContent value="risk">
            <RiskManager />
          </TabsContent>
          
          <TabsContent value="templates">
            <AlgorithmTemplates />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
