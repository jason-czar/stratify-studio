
import { Node, Edge } from 'reactflow';
import { NodeData, StartNodeData } from '@/types/nodes';

export const initialNodes: Node<NodeData>[] = [
  {
    id: 'start-1',
    type: 'start',
    data: { label: 'Start' } as StartNodeData,
    position: { x: 250, y: 25 },
  },
  {
    id: 'stock-1',
    type: 'stockSelection',
    data: { 
      label: 'Select Stock',
      ticker: 'AAPL',
      marketType: 'stock',
      exchange: 'NASDAQ' 
    },
    position: { x: 250, y: 125 },
  },
  {
    id: 'condition-1',
    type: 'condition',
    data: { 
      label: 'Set Conditions',
      conditionType: 'price',
      operator: '>',
      value: 150
    },
    position: { x: 250, y: 250 },
  },
  {
    id: 'order-1',
    type: 'orderExecution',
    data: { 
      label: 'Execute Order',
      orderType: 'market',
      side: 'buy',
      quantity: 10,
      timeInForce: 'day'
    },
    position: { x: 250, y: 375 },
  },
];

export const initialEdges: Edge[] = [
  { id: 'e-start-1-stock-1', source: 'start-1', target: 'stock-1', sourceHandle: 'out', targetHandle: 'in' },
  { id: 'e-stock-1-condition-1', source: 'stock-1', target: 'condition-1', sourceHandle: 'out', targetHandle: 'in' },
  { id: 'e-condition-1-order-1', source: 'condition-1', target: 'order-1', sourceHandle: 'outTrue', targetHandle: 'in' },
];
