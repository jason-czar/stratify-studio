
import React, { useState, useCallback, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent } from '@/components/ui/card';
import { NodeData } from '@/types/nodes';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { TradingAssistantChat } from '@/components/chat/TradingAssistantChat';
import { initialNodes, initialEdges } from '@/utils/initialFlowData';
import { AlgorithmFlow } from '@/components/flow/AlgorithmFlow';
import { AlgorithmControls } from '@/components/flow/AlgorithmControls';
import { ConfigSidebar } from '@/components/flow/ConfigSidebar';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();

  // Handle node click to update the selected node
  const onNodeClick = useCallback((_, node) => {
    console.log('Index - Node clicked:', node.id);
    setSelectedNode(node);
  }, []);

  // Update node data when configuration changes
  const updateNodeData = useCallback((nodeId, newData) => {
    console.log('Index - Updating node data for node:', nodeId, newData);
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            ...newData
          }
        };
      }
      return node;
    }));
  }, []);

  // Handle save success by navigating to dashboard
  const handleSaveSuccess = () => {
    console.log('Index - Save successful, navigating to dashboard');
    navigate('/dashboard');
  };

  // Handle updates from the Trading Assistant
  const handleUpdateNodes = useCallback((updatedNodes) => {
    console.log('Index - handleUpdateNodes called with:', updatedNodes?.length || 'undefined');
    if (updatedNodes) {
      console.log('Index - Setting new nodes, count:', updatedNodes.length);
      setNodes(updatedNodes);
      toast({
        title: 'Nodes Updated',
        description: `Updated ${updatedNodes.length} nodes in the algorithm.`,
      });
    }
  }, []);
  
  const handleUpdateEdges = useCallback((updatedEdges) => {
    console.log('Index - handleUpdateEdges called with:', updatedEdges?.length || 'undefined');
    if (updatedEdges) {
      console.log('Index - Setting new edges, count:', updatedEdges.length);
      setEdges(updatedEdges);
      toast({
        title: 'Edges Updated',
        description: `Updated ${updatedEdges.length} edges in the algorithm.`,
      });
    }
  }, []);

  // Listen for custom events from the TradingAssistantService
  useEffect(() => {
    const handleNodeUpdate = (event) => {
      console.log('Index - Received node update from trading assistant event', event.detail?.nodes?.length || 'No nodes in event');
      if (event.detail && event.detail.nodes) {
        console.log('Index - Setting nodes from event');
        setNodes(event.detail.nodes);
        toast({
          title: 'Algorithm Updated',
          description: 'The nodes in your trading algorithm have been updated.',
        });
      } else {
        console.warn('Index - Received node update event without nodes data');
      }
    };
    
    const handleEdgeUpdate = (event) => {
      console.log('Index - Received edge update from trading assistant event', event.detail?.edges?.length || 'No edges in event');
      if (event.detail && event.detail.edges) {
        console.log('Index - Setting edges from event');
        setEdges(event.detail.edges);
        toast({
          title: 'Algorithm Updated',
          description: 'The connections in your trading algorithm have been updated.',
        });
      } else {
        console.warn('Index - Received edge update event without edges data');
      }
    };
    
    console.log('Index - Adding event listeners for trading assistant updates');
    window.addEventListener('trading-assistant-update-nodes', handleNodeUpdate);
    window.addEventListener('trading-assistant-update-edges', handleEdgeUpdate);
    
    return () => {
      console.log('Index - Removing event listeners');
      window.removeEventListener('trading-assistant-update-nodes', handleNodeUpdate);
      window.removeEventListener('trading-assistant-update-edges', handleEdgeUpdate);
    };
  }, []);
  
  return <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Trading Assistant Chat positioned on the left */}
        <TradingAssistantChat nodes={nodes} edges={edges} onUpdateNodes={handleUpdateNodes} onUpdateEdges={handleUpdateEdges} />
        
        {/* Main content with left padding to accommodate the chat panel */}
        <div className="pl-80 transition-all duration-300 ease-in-out">
          <div className="p-4">
            
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardContent className="p-0">
                    <AlgorithmFlow initialNodes={nodes} initialEdges={edges} onNodeClick={onNodeClick} onNodesChange={handleUpdateNodes} onEdgesChange={handleUpdateEdges} />
                  </CardContent>
                </Card>
                
                <AlgorithmControls nodes={nodes} edges={edges} onSaveSuccess={handleSaveSuccess} />
              </div>
              
              <div>
                <ConfigSidebar selectedNode={selectedNode} nodes={nodes} edges={edges} onUpdateNodeData={updateNodeData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>;
};

export default Index;
