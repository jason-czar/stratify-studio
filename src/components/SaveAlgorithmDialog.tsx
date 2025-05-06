
import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { useToast } from '@/hooks/use-toast';
import { AlgorithmService } from '@/services/algorithmService';
import { Button } from '@/components/ui/button';
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
import { Save } from 'lucide-react';
import { NodeData } from '@/types/nodes';

interface SaveAlgorithmDialogProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onSaveSuccess?: () => void;
}

export function SaveAlgorithmDialog({ nodes, edges, onSaveSuccess }: SaveAlgorithmDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Algorithm name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await AlgorithmService.saveAlgorithm(
        formData.name,
        nodes,
        edges,
        formData.description || undefined
      );
      
      toast({
        title: 'Success',
        description: 'Algorithm saved successfully',
      });
      
      setFormData({ name: '', description: '' });
      setIsOpen(false);
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save algorithm',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Algorithm
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Save Algorithm</DialogTitle>
            <DialogDescription>
              Save your trading algorithm for future use and deployment
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Algorithm Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="My Trading Strategy"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what your algorithm does..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Algorithm'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
