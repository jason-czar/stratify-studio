
import React from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  addEdge 
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    data: { label: 'Select Stock' },
    position: { x: 250, y: 125 },
  },
  {
    id: '3',
    data: { label: 'Set Conditions' },
    position: { x: 250, y: 225 },
  },
  {
    id: '4',
    type: 'output',
    data: { label: 'Execute Order' },
    position: { x: 250, y: 325 },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
];

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = React.useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Alpaca Trading Algorithm Builder</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Build Your Trading Flow</h2>
          <div style={{ height: '500px' }} className="rounded border border-gray-200">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Deploy to Alpaca
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
