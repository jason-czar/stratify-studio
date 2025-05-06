
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Bell, Plus, Trash, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from "@/integrations/supabase/client";

interface Alert {
  id: string;
  user_id: string;
  name: string;
  ticker: string;
  condition: 'above' | 'below' | 'percent_change';
  value: number;
  active: boolean;
  notification_method: 'email' | 'app' | 'both';
  created_at: string;
}

export function AlertManager() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Alert, 'id' | 'user_id' | 'created_at'>>({
    name: '',
    ticker: '',
    condition: 'above',
    value: 0,
    active: true,
    notification_method: 'app',
  });
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const fetchAlerts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching alerts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!formData.name.trim() || !formData.ticker.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let result;
      
      if (editingAlertId) {
        // Update existing alert
        result = await supabase
          .from('alerts')
          .update({
            name: formData.name,
            ticker: formData.ticker.toUpperCase(),
            condition: formData.condition,
            value: formData.value,
            active: formData.active,
            notification_method: formData.notification_method,
          })
          .eq('id', editingAlertId)
          .eq('user_id', user.id)
          .select();
      } else {
        // Create new alert
        result = await supabase
          .from('alerts')
          .insert({
            user_id: user.id,
            name: formData.name,
            ticker: formData.ticker.toUpperCase(),
            condition: formData.condition,
            value: formData.value,
            active: formData.active,
            notification_method: formData.notification_method,
          })
          .select();
      }
      
      const { data, error } = result;
      
      if (error) throw error;
      
      setIsOpen(false);
      setEditingAlertId(null);
      setFormData({
        name: '',
        ticker: '',
        condition: 'above',
        value: 0,
        active: true,
        notification_method: 'app',
      });
      fetchAlerts();
      
      toast({
        title: editingAlertId ? "Alert Updated" : "Alert Created",
        description: editingAlertId ? "Your alert has been updated successfully" : "Your new alert has been created",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleAlertActive = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ active: !currentActive })
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, active: !currentActive } : alert
      ));
      
      toast({
        title: "Alert Updated",
        description: `Alert ${!currentActive ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const editAlert = (alert: Alert) => {
    setFormData({
      name: alert.name,
      ticker: alert.ticker,
      condition: alert.condition,
      value: alert.value,
      active: alert.active,
      notification_method: alert.notification_method,
    });
    setEditingAlertId(alert.id);
    setIsOpen(true);
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setAlerts(alerts.filter(alert => alert.id !== id));
      
      toast({
        title: "Alert Deleted",
        description: "The alert has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting alert",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      ticker: '',
      condition: 'above',
      value: 0,
      active: true,
      notification_method: 'app',
    });
    setEditingAlertId(null);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Price Alerts</CardTitle>
          <CardDescription>
            Create and manage price alerts for your watched stocks
          </CardDescription>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAlertId ? 'Edit Alert' : 'Create Alert'}</DialogTitle>
              <DialogDescription>
                {editingAlertId 
                  ? 'Edit your alert settings below' 
                  : 'Set up a new price alert for a stock'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="alert-name">Alert Name</Label>
                <Input 
                  id="alert-name" 
                  placeholder="Daily AAPL Check"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="alert-ticker">Ticker Symbol</Label>
                <Input 
                  id="alert-ticker" 
                  placeholder="AAPL"
                  value={formData.ticker}
                  onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="alert-condition">Condition</Label>
                  <Select 
                    value={formData.condition}
                    onValueChange={(value) => handleInputChange('condition', value as Alert['condition'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Price Above</SelectItem>
                      <SelectItem value="below">Price Below</SelectItem>
                      <SelectItem value="percent_change">% Change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="alert-value">Value</Label>
                  <Input 
                    id="alert-value" 
                    type="number"
                    value={formData.value.toString()}
                    onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="alert-notification">Notification Method</Label>
                <Select 
                  value={formData.notification_method}
                  onValueChange={(value) => handleInputChange('notification_method', value as Alert['notification_method'])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="app">In-App</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="alert-active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
                <Label htmlFor="alert-active">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingAlertId ? 'Save Changes' : 'Create Alert'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <div className="text-center py-6">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">You don't have any alerts yet.</p>
              <p className="text-sm text-muted-foreground">Create alerts to get notified about price changes.</p>
            </div>
          ) : (
            <div className="divide-y">
              {alerts.map((alert) => (
                <div key={alert.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center">
                        <span className={`mr-2 ${alert.active ? 'text-green-500' : 'text-gray-400'}`}>•</span>
                        {alert.name}
                      </div>
                      <div className="text-sm text-muted-foreground flex flex-wrap gap-y-1 gap-x-2">
                        <span className="font-medium">{alert.ticker}</span>
                        <span>
                          {alert.condition === 'above' && 'Above'}
                          {alert.condition === 'below' && 'Below'}
                          {alert.condition === 'percent_change' && 'Changes by'}
                          {' '}
                          {alert.condition === 'percent_change' ? `${alert.value}%` : `$${alert.value.toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleAlertActive(alert.id, alert.active)}
                      >
                        <Switch checked={alert.active} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => editAlert(alert)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteAlert(alert.id)}
                      >
                        <Trash className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
