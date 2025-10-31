import type { NodeProps } from '@xyflow/react'
import type { StartNodeType } from '../../types'

export const StartNode = ({ data }: NodeProps<StartNodeType>) => {
  return (
    <div className="text-center py-1">
      <div className="system-xs-regular text-text-tertiary">워크플로우 시작</div>
    </div>
  )
}
