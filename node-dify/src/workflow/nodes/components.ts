import { ComponentType } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BlockEnum } from '../types'
import { StartNode } from './start/node'
import { EndNode } from './end/node'
import { LLMNode } from './llm/node'

// 노드 UI 컴포넌트 맵핑
export const NodeComponentMap: Record<string, ComponentType<NodeProps>> = {
  [BlockEnum.Start]: StartNode,
  [BlockEnum.End]: EndNode,
  [BlockEnum.LLM]: LLMNode,
}
