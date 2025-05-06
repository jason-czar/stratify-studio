
import StockSelectionNode from './StockSelectionNode';
import ConditionNode from './ConditionNode';
import OrderExecutionNode from './OrderExecutionNode';
import StartNode from './StartNode';

export const nodeTypes = {
  stockSelection: StockSelectionNode,
  condition: ConditionNode,
  orderExecution: OrderExecutionNode,
  start: StartNode
};
