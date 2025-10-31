import { useMemo } from 'react'
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react'
import { NodeRunningStatus } from './types'

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) => {
  // 엣지 경로 계산
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // 실행 상태에 따른 스타일 (Dify 색상 사용)
  const edgeStyle = useMemo(() => {
    if (data?._waitingRun) {
      return { stroke: '#F79009', strokeWidth: 2 } // workflow-link-line-failure
    }
    if (data?._sourceRunningStatus === NodeRunningStatus.Running) {
      return { stroke: '#296dff', strokeWidth: 2, strokeDasharray: '5,5' } // workflow-link-line-active
    }
    if (data?._sourceRunningStatus === NodeRunningStatus.Succeeded) {
      return { stroke: '#17B26A', strokeWidth: 2 } // success color
    }
    if (data?._sourceRunningStatus === NodeRunningStatus.Failed) {
      return { stroke: '#EF4444', strokeWidth: 2 } // error color
    }
    return { stroke: '#d0d5dc', strokeWidth: 2 } // workflow-link-line-normal
  }, [data])

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={edgeStyle} />
    </>
  )
}
