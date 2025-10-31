import { useMemo } from 'react'
import type { NodeProps } from '@xyflow/react'
import { BaseNode } from './_base/node'
import { NodeComponentMap } from './components'

export const CustomNode = (props: NodeProps) => {
  const { data } = props

  // 노드 타입에 맞는 컴포넌트 선택
  const NodeComponent = useMemo(
    () => NodeComponentMap[data.type],
    [data.type]
  )

  if (!NodeComponent) {
    return (
      <BaseNode id={props.id} data={data}>
        <div className="text-red-500 text-sm">Unknown node type: {data.type}</div>
      </BaseNode>
    )
  }

  return (
    <BaseNode id={props.id} data={data}>
      <NodeComponent {...props} />
    </BaseNode>
  )
}
