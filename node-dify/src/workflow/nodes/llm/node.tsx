import type { NodeProps } from '@xyflow/react'
import type { LLMNodeType } from '../../types'

export const LLMNode = ({ data }: NodeProps<LLMNodeType>) => {
  const { model, prompt } = data

  return (
    <div className="space-y-1.5">
      {/* 모델 정보 */}
      {model ? (
        <div className="bg-workflow-block-parma-bg rounded px-2 py-1">
          <div className="system-2xs-regular-uppercase text-text-tertiary">
            MODEL
          </div>
          <div className="system-xs-medium text-text-primary mt-0.5">
            {model.provider} · {model.name}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded px-2 py-1 system-xs-regular text-yellow-700">
          모델을 선택하세요
        </div>
      )}

      {/* 프롬프트 미리보기 */}
      {prompt && (
        <div className="system-xs-regular text-text-secondary">
          <div className="text-text-tertiary mb-0.5">Prompt:</div>
          <div className="bg-workflow-block-parma-bg rounded px-2 py-1 max-h-16 overflow-y-auto line-clamp-3">
            {prompt}
          </div>
        </div>
      )}
    </div>
  )
}
