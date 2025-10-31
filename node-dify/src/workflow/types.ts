import type { Node, Edge } from '@xyflow/react'

// 노드 타입 열거형
export enum BlockEnum {
  Start = 'start',
  End = 'end',
  Answer = 'answer',
  LLM = 'llm',
  KnowledgeRetrieval = 'knowledge-retrieval',
}

// 노드 실행 상태
export enum NodeRunningStatus {
  NotStart = 'not-start',
  Waiting = 'waiting',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
}

// 공통 노드 타입
export type CommonNodeType<T = Record<string, unknown>> = {
  // 연결 상태
  _connectedSourceHandleIds?: string[]
  _connectedTargetHandleIds?: string[]

  // 실행 상태
  _runningStatus?: NodeRunningStatus

  // UI 상태
  selected?: boolean
  _dimmed?: boolean

  // 기본 정보
  title: string
  desc?: string
  type: BlockEnum
  width?: number
  height?: number
} & T

// Start 노드 타입
export type StartNodeType = CommonNodeType<{
  type: BlockEnum.Start
}>

// End 노드 타입
export type EndNodeType = CommonNodeType<{
  type: BlockEnum.End
}>

// LLM 노드 타입
export type LLMNodeType = CommonNodeType<{
  type: BlockEnum.LLM
  model?: {
    provider: string
    name: string
  }
  prompt?: string
}>

// 노드 데이터 유니언 타입
export type NodeData = StartNodeType | EndNodeType | LLMNodeType

// React Flow Node 타입
export type WorkflowNode = Node<NodeData>

// React Flow Edge 타입
export type WorkflowEdge = Edge<{
  _sourceRunningStatus?: NodeRunningStatus
  _waitingRun?: boolean
}>
