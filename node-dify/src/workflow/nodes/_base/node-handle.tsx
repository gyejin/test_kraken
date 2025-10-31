import { Handle, Position } from '@xyflow/react'
import clsx from 'clsx'

interface NodeHandleProps {
  id?: string
  className?: string
}

export const NodeSourceHandle = ({ id, className }: NodeHandleProps) => {
  return (
    <Handle
      type="source"
      id={id}
      position={Position.Right}
      className={clsx(
        'node-handle',
        '!z-[1] !h-4 !w-4 !rounded-none !border-none !bg-transparent',
        'after:absolute after:right-1.5 after:top-1 after:h-2 after:w-0.5',
        'after:bg-workflow-link-line-handle',
        'transition-all hover:scale-125',
        className
      )}
    />
  )
}

export const NodeTargetHandle = ({ id, className }: NodeHandleProps) => {
  return (
    <Handle
      type="target"
      id={id}
      position={Position.Left}
      className={clsx(
        'node-handle',
        '!z-[1] !h-4 !w-4 !rounded-none !border-none !bg-transparent',
        'after:absolute after:left-1.5 after:top-1 after:h-2 after:w-0.5',
        'after:bg-workflow-link-line-handle',
        'transition-all hover:scale-125',
        className
      )}
    />
  )
}
