import { create } from 'zustand'
import type { WorkflowNode, WorkflowEdge } from './types'

interface WorkflowStore {
  // 노드와 엣지 상태
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]

  // 액션
  setNodes: (nodes: WorkflowNode[]) => void
  setEdges: (edges: WorkflowEdge[]) => void
  updateNode: (id: string, data: Partial<WorkflowNode['data']>) => void
}

export const useWorkflowStore = create<WorkflowStore>((set) => ({
  nodes: [],
  edges: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    })),
}))
