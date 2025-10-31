import clsx from 'clsx'
import { BlockEnum } from '../../types'
import { Home, Llm, Answer } from '@/components/icons/workflow'

interface BlockIconProps {
  type: BlockEnum
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

// 노드 타입별 아이콘 매핑
const getIcon = (type: BlockEnum, className: string) => {
  const iconMap = {
    [BlockEnum.Start]: <Home className={className} />,
    [BlockEnum.LLM]: <Llm className={className} />,
    [BlockEnum.End]: <Answer className={className} />,
  }
  return iconMap[type] || null
}

// 노드 타입별 배경색 매핑
const ICON_CONTAINER_BG_COLOR_MAP: Record<string, string> = {
  [BlockEnum.Start]: 'bg-util-colors-blue-brand-blue-brand-500',
  [BlockEnum.LLM]: 'bg-util-colors-indigo-indigo-500',
  [BlockEnum.End]: 'bg-util-colors-warning-warning-500',
}

// 크기별 스타일 매핑
const ICON_CONTAINER_CLASSNAME_SIZE_MAP: Record<string, string> = {
  xs: 'w-4 h-4 rounded-[5px] shadow-xs',
  sm: 'w-5 h-5 rounded-md shadow-xs',
  md: 'w-6 h-6 rounded-lg shadow-md',
}

export const BlockIcon = ({ type, size = 'md', className }: BlockIconProps) => {
  return (
    <div
      className={clsx(
        'flex items-center justify-center',
        'border-[0.5px] border-white/2 text-white',
        ICON_CONTAINER_CLASSNAME_SIZE_MAP[size],
        ICON_CONTAINER_BG_COLOR_MAP[type],
        className
      )}
    >
      {getIcon(type, 'w-3.5 h-3.5')}
    </div>
  )
}
