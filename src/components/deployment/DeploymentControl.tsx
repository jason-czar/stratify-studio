
import React, { useState, useEffect } from 'react';
import { Algorithm, AlgorithmService } from '@/services/algorithmService';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeploymentControlProps {
  showAll?: boolean;
}

type DeploymentStatus = 'running' | 'paused' | 'error' | 'deploying';

interface DeploymentInfo {
  id: string;
  name: string;
  status: DeploymentStatus;
  lastDeployed: Date;
  logs: string;
  metrics: {
    cpu: number;
    memory: number;
    uptime: number;
  };
}

// Mock deployment data - in a real app this would come from a service
const mockDeploymentInfo = (algorithm: Algorithm): DeploymentInfo => {
  const statuses: DeploymentStatus[] = ['running', 'paused', 'error', 'deploying'];
  const randomStatus = algorithm.is_active ? 'running' : 'paused';
  
  return {
    id: algorithm.id,
    name: algorithm.name,
    status: randomStatus,
    lastDeployed: new Date(algorithm.updated_at),
    logs: "Deployment successful. Algorithm running normally.",
    metrics: {
      cpu: Math.floor(Math.random() * 40) + 10,
      memory: Math.floor(Math.random() * 200) + 50,
      uptime: Math.floor(Math.random() * 1000) + 1,
    }
  };
};

export function DeploymentControl({ showAll = false }: DeploymentControlProps) {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadAlgorithms = async () => {
      try {
        const data = await AlgorithmService.getUserAlgorithms();
        const filtered = showAll ? data : data.filter(alg => alg.is_active);
        setAlgorithms(filtered);
        setDeployments(filtered.map(mockDeploymentInfo));
      } catch (error) {
        console.error('Error loading algorithms:', error);
        toast({
          title: "Failed to load algorithms",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadAlgorithms();
  }, [showAll, toast]);

  const handleToggleDeployment = async (id: string, isRunning: boolean) => {
    try {
      await AlgorithmService.toggleAlgorithmActive(id, !isRunning);
      setDeployments(prevDeployments => 
        prevDeployments.map(dep => 
          dep.id === id 
            ? { ...dep, status: !isRunning ? 'running' : 'paused' } 
            : dep
        )
      );
      
      toast({
        title: `Algorithm ${!isRunning ? 'deployed' : 'stopped'}`,
        description: `Successfully ${!isRunning ? 'deployed' : 'stopped'} the algorithm`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error toggling deployment status:', error);
      toast({
        title: "Operation failed",
        description: "Unable to change the deployment status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: DeploymentStatus) => {
    switch (status) {
      case 'running':
        return (
          <div className="flex items-center">
            <div className="mr-1.5 h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-green-700 dark:text-green-400">Running</span>
          </div>
        );
      case 'paused':
        return (
          <div className="flex items-center">
            <div className="mr-1.5 h-2 w-2 rounded-full bg-amber-500"></div>
            <span className="text-amber-700 dark:text-amber-400">Paused</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center">
            <div className="mr-1.5 h-2 w-2 rounded-full bg-red-500"></div>
            <span className="text-red-700 dark:text-red-400">Error</span>
          </div>
        );
      case 'deploying':
        return (
          <div className="flex items-center">
            <div className="mr-1.5 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-blue-700 dark:text-blue-400">Deploying</span>
          </div>
        );
      default:
        return null;
    }
  };

  const viewDeploymentLogs = (id: string) => {
    const deployment = deployments.find(d => d.id === id);
    if (deployment) {
      toast({
        title: `Logs for ${deployment.name}`,
        description: deployment.logs,
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deployment Control</CardTitle>
          <CardDescription>Managing your deployed algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-center">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2 mx-auto"></div>
              <div className="h-2 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deployments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Deployment Control</CardTitle>
          <CardDescription>Managing your deployed algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Deployed Algorithms</h3>
            <p className="text-muted-foreground mb-6">
              You don't have any {showAll ? "" : "active"} algorithms to display.
            </p>
            <Button variant="outline">Deploy an Algorithm</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deployment Control</CardTitle>
        <CardDescription>Managing your deployed algorithms</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Algorithm</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Last Deployed</TableHead>
              <TableHead className="hidden lg:table-cell">Resource Usage</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.map((deployment) => (
              <TableRow key={deployment.id}>
                <TableCell className="font-medium">{deployment.name}</TableCell>
                <TableCell>{getStatusBadge(deployment.status)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {deployment.lastDeployed.toLocaleString()}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex flex-col text-xs">
                    <span>CPU: {deployment.metrics.cpu}%</span>
                    <span>Memory: {deployment.metrics.memory}MB</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewDeploymentLogs(deployment.id)}
                    >
                      Logs
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleDeployment(
                        deployment.id, 
                        deployment.status === 'running'
                      )}
                    >
                      {deployment.status === 'running' ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
