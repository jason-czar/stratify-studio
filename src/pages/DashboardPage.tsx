
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Algorithm, AlgorithmService } from '@/services/algorithmService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Play, Pause, LineChart, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Mock performance data for dashboard
  const performanceData = [
    { name: 'Mon', value: 420 },
    { name: 'Tue', value: -180 },
    { name: 'Wed', value: 300 },
    { name: 'Thu', value: 508 },
    { name: 'Fri', value: 250 },
  ];
  
  useEffect(() => {
    const loadAlgorithms = async () => {
      try {
        const data = await AlgorithmService.getUserAlgorithms();
        setAlgorithms(data);
      } catch (error) {
        console.error('Error loading algorithms:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadAlgorithms();
  }, []);
  
  const handleToggleActive = async (id: string, currentStatus: boolean | null) => {
    try {
      await AlgorithmService.toggleAlgorithmActive(id, !currentStatus);
      setAlgorithms(prevAlgorithms => 
        prevAlgorithms.map(alg => 
          alg.id === id ? { ...alg, is_active: !alg.is_active } : alg
        )
      );
    } catch (error) {
      console.error('Error toggling algorithm status:', error);
    }
  };
  
  const handleViewDetails = (id: string) => {
    navigate(`/algorithms/${id}`);
  };
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => navigate('/')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Algorithm
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$1,298.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Algorithms</CardTitle>
            <CardDescription>Currently running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {algorithms.filter(alg => alg.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <CardDescription>Last 50 trades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">62%</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>Daily P&L for all active algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'P&L']}
                  labelFormatter={(label) => `Day: ${label}`}
                />
                <Bar 
                  dataKey="value" 
                  fill={(data) => (data.value >= 0 ? "#4ade80" : "#f87171") as string}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Algorithms</CardTitle>
          <CardDescription>Manage and monitor your trading algorithms</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading algorithms...</div>
          ) : algorithms.length === 0 ? (
            <div className="text-center py-4">
              <p className="mb-4">You haven't created any algorithms yet.</p>
              <Button onClick={() => navigate('/')}>Create Your First Algorithm</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Created</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {algorithms.map((algorithm) => (
                  <TableRow key={algorithm.id}>
                    <TableCell className="font-medium">{algorithm.name}</TableCell>
                    <TableCell>
                      {algorithm.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {new Date(algorithm.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <LineChart className="mr-2 h-4 w-4 text-green-500" />
                        <span className="text-green-500">+3.2%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(algorithm.id, algorithm.is_active)}
                        >
                          {algorithm.is_active ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(algorithm.id)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
