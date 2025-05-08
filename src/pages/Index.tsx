
import React, { useState, useCallback } from 'react';
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

const Index = () => {
  const [nodes, setNodes] = useState<Node<NodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle node click to update the selected node
  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  // Update node data when configuration changes
  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, []);

  // Handle save success by navigating to dashboard
  const handleSaveSuccess = () => {
    navigate('/dashboard');
  };

  // Handle updates from the Trading Assistant
  const handleUpdateNodes = useCallback((updatedNodes) => {
    setNodes(updatedNodes);
  }, []);

  const handleUpdateEdges = useCallback((updatedEdges) => {
    setEdges(updatedEdges);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Trading Assistant Chat with resizable panel */}
        <TradingAssistantChat 
          nodes={nodes}
          edges={edges}
          onUpdateNodes={handleUpdateNodes}
          onUpdateEdges={handleUpdateEdges}
        />
        
        {/* Main content with margin-left to accommodate the chat panel */}
        <div className="ml-[20%] transition-all duration-300 ease-in-out min-h-screen">
          <div className="p-4">
            <header className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Stratify Algorithm Builder</h1>
              <div className="flex items-center gap-4">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </button>
              </div>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Card className="mb-6">
                  <CardContent className="p-0">
                    <AlgorithmFlow
                      initialNodes={nodes}
                      initialEdges={edges}
                      onNodeClick={onNodeClick}
                      onNodesChange={handleUpdateNodes}
                      onEdgesChange={handleUpdateEdges}
                    />
                  </CardContent>
                </Card>
                
                <AlgorithmControls 
                  nodes={nodes} 
                  edges={edges}
                  onSaveSuccess={handleSaveSuccess}
                />
              </div>
              
              <div>
                <ConfigSidebar
                  selectedNode={selectedNode}
                  nodes={nodes}
                  edges={edges}
                  onUpdateNodeData={updateNodeData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
