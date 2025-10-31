import { type ReactNode } from 'react'
import clsx from 'clsx'
import type { NodeData, NodeRunningStatus } from '../../types'
import { NodeSourceHandle, NodeTargetHandle } from './node-handle'
import { BlockIcon } from './block-icon'
import {
  RiLoader2Line,
  RiCheckboxCircleFill,
  RiErrorWarningFill,
} from '@remixicon/react'

interface BaseNodeProps {
  id: string
  data: NodeData
  children?: ReactNode
}

// 실행 상태 아이콘 (Remix Icon 사용)
const StatusIcon = ({ status }: { status?: NodeRunningStatus }) => {
  if (!status || status === 'not-start') return null

  if (status === 'running') {
    return (
      <RiLoader2Line className="h-3.5 w-3.5 animate-spin text-text-accent" />
    )
  }

  if (status === 'succeeded') {
    return <RiCheckboxCircleFill className="h-3.5 w-3.5 text-text-success" />
  }

  if (status === 'failed') {
    return <RiErrorWarningFill className="h-3.5 w-3.5 text-text-destructive" />
  }

  if (status === 'waiting') {
    return <RiLoader2Line className="h-3.5 w-3.5 text-yellow-500" />
  }

  return null
}

export const BaseNode = ({ id, data, children }: BaseNodeProps) => {
  // 실행 상태에 따른 테두리 색상
  const showRunningBorder = data._runningStatus === 'running'
  const showSuccessBorder = data._runningStatus === 'succeeded'
  const showFailedBorder = data._runningStatus === 'failed'

  const nodeClassName = clsx(
    'workflow-node',
    'group relative pb-1',
    'rounded-[15px]',
    'w-[240px]',
    'bg-workflow-block-bg',
    'border-2 border-transparent',
    'shadow-xs',
    'transition-all',
    'hover:shadow-lg',
    {
      '!border-state-accent-solid': showRunningBorder,
      '!border-state-success-solid': showSuccessBorder,
      '!border-state-destructive-solid': showFailedBorder,
      'opacity-50': data._dimmed,
    }
  )

  return (
    <div className={nodeClassName}>
      {/* 노드 아이콘 (왼쪽 위) */}
      <div className="absolute -left-3 -top-3">
        <BlockIcon type={data.type} size="md" />
      </div>

      {/* 노드 헤더 */}
      <div className="flex items-center rounded-t-2xl px-3 pb-2 pt-3">
        <div className="system-sm-semibold-uppercase mr-1 flex grow items-center truncate text-text-primary">
          {data.title}
        </div>
        {/* 상태 아이콘 */}
        <StatusIcon status={data._runningStatus} />
      </div>

      {/* 노드 컨텐츠 */}
      <div className="px-3 pb-2">{children}</div>

      {/* 연결 핸들 */}
      {data.type !== 'end' && <NodeSourceHandle />}
      {data.type !== 'start' && <NodeTargetHandle />}
    </div>
  )
}
