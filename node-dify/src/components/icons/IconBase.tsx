import { createElement, forwardRef, type SVGProps } from 'react'

export interface AbstractNode {
  type: 'element'
  isRootNode?: boolean
  name: string
  attributes: Record<string, string>
  children: AbstractNode[]
}

export interface IconData {
  name: string
  icon: AbstractNode
}

export interface IconBaseProps extends SVGProps<SVGSVGElement> {
  data: IconData
}

// JSON 노드를 실제 React 요소로 변환
function generate(
  node: AbstractNode,
  key: string,
  rootProps?: Record<string, any>
): React.ReactElement {
  const { type, name, attributes, children } = node

  if (type !== 'element') {
    return null as any
  }

  // 루트 노드인 경우 rootProps 병합
  const props = node.isRootNode
    ? { ...attributes, ...rootProps, key }
    : { ...attributes, key }

  // 자식 요소 재귀적으로 변환
  const childElements = children?.map((child, index) =>
    generate(child, `${key}-${index}`)
  )

  return createElement(name, props, ...(childElements || []))
}

const IconBase = forwardRef<SVGSVGElement, IconBaseProps>(
  ({ data, className, onClick, style, ...restProps }, ref) => {
    return generate(data.icon, `svg-${data.name}`, {
      className,
      onClick,
      style,
      'data-icon': data.name,
      'aria-hidden': 'true',
      ...restProps,
      ref,
    })
  }
)

IconBase.displayName = 'IconBase'

export default IconBase
