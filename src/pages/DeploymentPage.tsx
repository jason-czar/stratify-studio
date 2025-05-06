
import React from 'react';
import { DeploymentControl } from '@/components/deployment/DeploymentControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Upload, List, BarChart2 } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function DeploymentPage() {
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Deployment Center</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="active">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="active">
              <Upload className="mr-2 h-4 w-4" />
              Active Deployments
            </TabsTrigger>
            <TabsTrigger value="all">
              <List className="mr-2 h-4 w-4" />
              All Algorithms
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="mr-2 h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="active">
          <DeploymentControl showAll={false} />
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current platform resources and status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm font-medium">42%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Network</span>
                      <span className="text-sm font-medium">17%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest system and deployment events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Algorithm Deployed</p>
                      <p className="text-muted-foreground text-xs">Moving Average Crossover • 2h ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">System Update</p>
                      <p className="text-muted-foreground text-xs">Platform version 2.3.4 • 5h ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full mr-3">
                      <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Warning: High Resource Usage</p>
                      <p className="text-muted-foreground text-xs">RSI Algorithm • 8h ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="all">
          <DeploymentControl showAll={true} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Deployment Analytics</CardTitle>
              <CardDescription>Monitoring and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
                <p className="text-muted-foreground">Analytics visualization will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
