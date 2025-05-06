
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Algorithm, AlgorithmService, AlgorithmPerformance } from '@/services/algorithmService';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Pause, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function AlgorithmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null);
  const [performance, setPerformance] = useState<AlgorithmPerformance[]>([]);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        
        const [algorithmData, performanceData] = await Promise.all([
          AlgorithmService.getAlgorithm(id),
          AlgorithmService.getAlgorithmPerformance(id),
        ]);

        setAlgorithm(algorithmData);
        setPerformance(performanceData);
        
        if (algorithmData) {
          setEditFormData({
            name: algorithmData.name,
            description: algorithmData.description || '',
          });
        }
      } catch (error) {
        console.error('Error fetching algorithm details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load algorithm details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, toast]);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!id) return;
      
      const updatedAlgorithm = await AlgorithmService.updateAlgorithm(id, {
        name: editFormData.name,
        description: editFormData.description,
      });

      if (updatedAlgorithm) {
        setAlgorithm(updatedAlgorithm);
        setIsDialogOpen(false);
        toast({
          title: 'Success',
          description: 'Algorithm updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating algorithm:', error);
      toast({
        title: 'Error',
        description: 'Failed to update algorithm',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAlgorithm = async () => {
    try {
      if (!id) return;
      
      const success = await AlgorithmService.deleteAlgorithm(id);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Algorithm deleted successfully',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error deleting algorithm:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete algorithm',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async () => {
    try {
      if (!algorithm || !id) return;
      
      const updatedAlgorithm = await AlgorithmService.toggleAlgorithmActive(
        id, 
        !algorithm.is_active
      );
      
      if (updatedAlgorithm) {
        setAlgorithm(updatedAlgorithm);
        toast({
          title: updatedAlgorithm.is_active ? 'Algorithm Activated' : 'Algorithm Deactivated',
          description: updatedAlgorithm.is_active 
            ? 'Your algorithm is now running'
            : 'Your algorithm has been stopped',
        });
      }
    } catch (error) {
      console.error('Error toggling algorithm status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update algorithm status',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading algorithm details...</p>
      </div>
    );
  }

  if (!algorithm) {
    return (
      <div className="container py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Algorithm Not Found</h1>
        <p className="mb-6">The algorithm you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
      </div>
    );
  }

  // Mock performance data for the chart
  const mockPerformanceData = [
    { date: '05/01', value: 1200 },
    { date: '05/02', value: 1400 },
    { date: '05/03', value: 1300 },
    { date: '05/04', value: 1700 },
    { date: '05/05', value: 1600 },
    { date: '05/06', value: 1900 },
    { date: '05/07', value: 2100 },
  ];

  // Mock trades for the table
  const mockTrades = [
    { id: 1, symbol: 'AAPL', side: 'buy', quantity: 10, price: 167.25, timestamp: '2025-05-05 09:30:22', status: 'filled' },
    { id: 2, symbol: 'MSFT', side: 'buy', quantity: 5, price: 279.85, timestamp: '2025-05-05 10:15:46', status: 'filled' },
    { id: 3, symbol: 'AAPL', side: 'sell', quantity: 10, price: 169.50, timestamp: '2025-05-05 13:22:10', status: 'filled' },
    { id: 4, symbol: 'AMZN', side: 'buy', quantity: 3, price: 148.30, timestamp: '2025-05-06 11:05:33', status: 'filled' },
  ];

  return (
    <div className="container py-10">
      <Button 
        variant="outline"
        className="mb-6"
        onClick={() => navigate('/dashboard')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">{algorithm.name}</h1>
          <p className="text-gray-500">
            {algorithm.description || 'No description provided'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={algorithm.is_active ? "outline" : "default"}
            onClick={handleToggleActive}
          >
            {algorithm.is_active ? (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleEditSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit Algorithm</DialogTitle>
                  <DialogDescription>
                    Make changes to your algorithm details.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={editFormData.description}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-red-50 hover:bg-red-100">
                <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-500">Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this algorithm? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteAlgorithm}>
                  Delete Algorithm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">+$748.50</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58%</div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="performance" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trades">Recent Trades</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Chart</CardTitle>
              <CardDescription>Equity curve over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Portfolio Value']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4ade80" 
                      strokeWidth={2}
                      dot={{ stroke: '#4ade80', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trades">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
              <CardDescription>Trades executed by this algorithm</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTrades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <span className={`text-${trade.side === 'buy' ? 'green' : 'red'}-500`}>
                          {trade.side.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{trade.quantity}</TableCell>
                      <TableCell className="text-right">${trade.price}</TableCell>
                      <TableCell className="hidden md:table-cell">{trade.timestamp}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          {trade.status.toUpperCase()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Algorithm Settings</CardTitle>
              <CardDescription>Configure advanced settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Risk Management</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="max_position_size" className="text-sm">Max Position Size ($)</Label>
                      <Input type="number" id="max_position_size" defaultValue="5000" />
                    </div>
                    <div>
                      <Label htmlFor="max_loss_percent" className="text-sm">Max Daily Loss (%)</Label>
                      <Input type="number" id="max_loss_percent" defaultValue="2" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label>Execution Settings</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label htmlFor="default_order_type" className="text-sm">Default Order Type</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                        <option>Market</option>
                        <option>Limit</option>
                        <option>Stop</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="time_in_force" className="text-sm">Time in Force</Label>
                      <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm">
                        <option>Day</option>
                        <option>GTC</option>
                        <option>IOC</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto">Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
