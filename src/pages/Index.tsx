
import React, { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { NodeData } from '@/types/nodes';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { TradingAssistantChat } from '@/components/chat/TradingAssistantChat';
import { initialNodes, initialEdges } from '@/utils/initialFlowData';
import { AlgorithmFlow } from '@/components/flow/AlgorithmFlow';
import { AlgorithmControls } from '@/components/flow/AlgorithmControls';
import { ConfigSidebar } from '@/components/flow/ConfigSidebar';
import AlpacaConnectionStatus from '@/components/AlpacaConnectionStatus';
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from '@/components/ui/resizable';

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
      <div className="min-h-screen bg-background flex flex-col">
        <header className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Stratify Algorithm Builder</h1>
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Top Section: Alpaca Connection Status and Config */}
          <div className="bg-background p-4" style={{ height: '30%' }}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Left panel: Alpaca Connection Status */}
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full overflow-auto p-2">
                  <AlpacaConnectionStatus />
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Right panel: Node Configuration */}
              <ResizablePanel defaultSize={70}>
                <div className="h-full overflow-auto p-2">
                  <ConfigSidebar
                    selectedNode={selectedNode}
                    nodes={nodes}
                    edges={edges}
                    onUpdateNodeData={updateNodeData}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          
          {/* Bottom Section: Trading Assistant and Algorithm Flow */}
          <div className="flex-1 bg-background p-4">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              {/* Left panel: Trading Assistant */}
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                <TradingAssistantChat 
                  nodes={nodes}
                  edges={edges}
                  onUpdateNodes={handleUpdateNodes}
                  onUpdateEdges={handleUpdateEdges}
                />
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Right panel: Algorithm Flow and Controls */}
              <ResizablePanel defaultSize={80}>
                <div className="h-full flex flex-col">
                  <div className="flex-grow mb-4">
                    <AlgorithmFlow
                      initialNodes={nodes}
                      initialEdges={edges}
                      onNodeClick={onNodeClick}
                      onNodesChange={handleUpdateNodes}
                      onEdgesChange={handleUpdateEdges}
                    />
                  </div>
                  
                  <AlgorithmControls 
                    nodes={nodes} 
                    edges={edges}
                    onSaveSuccess={handleSaveSuccess}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
