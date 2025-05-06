
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/types/nodes';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateAlgorithm = (nodes: Node<NodeData>[], edges: Edge[]): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Check if we have a start node
  const startNode = nodes.find(node => node.type === 'start');
  if (!startNode) {
    result.isValid = false;
    result.errors.push('Algorithm must have a Start node');
  }

  // Check for orphaned nodes (no incoming or outgoing edges)
  nodes.forEach(node => {
    if (node.type !== 'start') {
      const hasIncoming = edges.some(edge => edge.target === node.id);
      if (!hasIncoming) {
        result.warnings.push(`Node "${node.data.label || node.id}" has no incoming connections`);
      }
    }

    if (node.type !== 'orderExecution') {
      const hasOutgoing = edges.some(edge => edge.source === node.id);
      if (!hasOutgoing) {
        result.warnings.push(`Node "${node.data.label || node.id}" has no outgoing connections`);
      }
    }
  });

  // Check for cycles (simple implementation)
  const visited = new Set<string>();
  const checkCycle = (nodeId: string, path: Set<string>): boolean => {
    if (path.has(nodeId)) {
      result.errors.push('Algorithm contains a cycle, which could lead to infinite loops');
      return true;
    }
    
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);
    
    const newPath = new Set(path);
    newPath.add(nodeId);
    
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      if (checkCycle(edge.target, newPath)) return true;
    }
    
    return false;
  };
  
  if (startNode) {
    checkCycle(startNode.id, new Set<string>());
  }

  // Check for incomplete node configuration
  nodes.forEach(node => {
    switch (node.type) {
      case 'stockSelection':
        if (!node.data.ticker) {
          result.warnings.push(`Stock Selection node "${node.data.label || node.id}" has no ticker specified`);
        }
        break;
      case 'condition':
        if (!node.data.conditionType || !node.data.operator || node.data.value === undefined) {
          result.warnings.push(`Condition node "${node.data.label || node.id}" is not fully configured`);
        }
        break;
      case 'orderExecution':
        if (!node.data.orderType || !node.data.side || node.data.quantity === undefined) {
          result.warnings.push(`Order Execution node "${node.data.label || node.id}" is not fully configured`);
        }
        break;
    }
  });

  // If there are any errors, mark as invalid
  if (result.errors.length > 0) {
    result.isValid = false;
  }

  return result;
};
