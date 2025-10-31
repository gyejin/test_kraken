import type { NodeProps } from '@xyflow/react'
import type { EndNodeType } from '../../types'

export const EndNode = ({ data }: NodeProps<EndNodeType>) => {
  return (
    <div className="text-center py-1">
      <div className="system-xs-regular text-text-tertiary">워크플로우 종료</div>
    </div>
  )
}
