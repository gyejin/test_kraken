import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomNode } from "./nodes";
import { CustomEdge } from "./custom-edge";
import type { WorkflowNode, WorkflowEdge } from "./types";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

interface WorkflowProps {
  initialNodes?: WorkflowNode[];
  initialEdges?: WorkflowEdge[];
}

export const Workflow = ({
  initialNodes = [],
  initialEdges = [],
}: WorkflowProps) => {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<WorkflowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<WorkflowEdge>(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge: WorkflowEdge = {
        ...connection,
        id: `${connection.source}-${connection.target}`,
        type: "custom",
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.data.type) {
              case "start":
                return "#10B981";
              case "end":
                return "#EF4444";
              case "llm":
                return "#3B82F6";
              default:
                return "#6B7280";
            }
          }}
        />
      </ReactFlow>
    </div>
  );
};
