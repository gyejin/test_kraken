# Dify 워크플로우 노드 아이콘 시스템

## 📋 개요

Dify의 노드 아이콘은 **SVG 기반의 커스텀 아이콘 시스템**으로 구현되어 있으며, JSON 형식으로 정의된 아이콘 데이터를 React 컴포넌트로 렌더링합니다.

### 위치
```
web/app/components/base/icons/src/vender/workflow/
├── Agent.tsx / Agent.json
├── Answer.tsx / Answer.json
├── Code.tsx / Code.json
├── Llm.tsx / Llm.json
├── IfElse.tsx / IfElse.json
├── Http.tsx / Http.json
├── ... (25+ 아이콘 쌍)
└── index.ts (export)
```

---

## 🏗️ 아키텍처

### 구조
```
JSON 아이콘 데이터 (.json)
    ↓
React 컴포넌트 래퍼 (.tsx)
    ↓
IconBase (공통 렌더러)
    ↓
SVG 요소 생성
    ↓
BlockIcon (노드에서 사용)
```

---

## 📄 아이콘 데이터 구조

### JSON 형식

**예제**: `Datasource.json` (가장 간단한 아이콘)
```json
{
  "icon": {
    "type": "element",
    "isRootNode": true,
    "name": "svg",
    "attributes": {
      "width": "14",
      "height": "14",
      "viewBox": "0 0 14 14",
      "fill": "none",
      "xmlns": "http://www.w3.org/2000/svg"
    },
    "children": [
      {
        "type": "element",
        "name": "path",
        "attributes": {
          "d": "M6.99967 1.16675C8.17599...",
          "fill": "currentColor"
        },
        "children": []
      }
    ]
  },
  "name": "Datasource"
}
```

### JSON 구조 설명

**루트 객체**:
```typescript
{
  icon: AbstractNode,  // SVG 요소 트리
  name: string         // 아이콘 이름
}
```

**AbstractNode 구조** (재귀적):
```typescript
{
  type: "element",
  isRootNode?: boolean,
  name: string,              // "svg", "g", "path", "rect" 등
  attributes: {              // SVG 속성
    [key: string]: string
  },
  children: AbstractNode[]   // 자식 요소들
}
```

---

## 🎨 React 컴포넌트 래퍼

### 개별 아이콘 컴포넌트

**예제**: `Llm.tsx`
```typescript
// 자동 생성된 코드
// 수동으로 편집하지 말 것

import * as React from 'react'
import data from './Llm.json'
import IconBase from '@/app/components/base/icons/IconBase'
import type { IconData } from '@/app/components/base/icons/IconBase'

const Icon = (
  {
    ref,
    ...props
  }: React.SVGProps<SVGSVGElement> & {
    ref?: React.RefObject<React.RefObject<HTMLOrSVGElement>>;
  },
) => <IconBase {...props} ref={ref} data={data as IconData} />

Icon.displayName = 'Llm'

export default Icon
```

**특징**:
- 스크립트로 자동 생성 (수동 편집 금지)
- JSON 데이터를 `IconBase`에 전달
- 표준 SVG props 지원

---

## 🔧 IconBase: 공통 렌더러

**위치**: `web/app/components/base/icons/IconBase.tsx`

```typescript
export type IconData = {
  name: string
  icon: AbstractNode
}

export type IconBaseProps = {
  data: IconData
  className?: string
  onClick?: React.MouseEventHandler<SVGElement>
  style?: React.CSSProperties
}

const IconBase = ({ ref, ...props }: IconBaseProps) => {
  const { data, className, onClick, style, ...restProps } = props

  // JSON 데이터를 실제 SVG 요소로 변환
  return generate(data.icon, `svg-${data.name}`, {
    className,
    onClick,
    style,
    'data-icon': data.name,
    'aria-hidden': 'true',
    ...restProps,
    'ref': ref,
  })
}
```

**역할**:
1. JSON 데이터를 받아 `generate` 함수로 전달
2. SVG 요소 생성
3. 공통 속성 추가 (className, style, event handlers)
4. 접근성 속성 설정

---

## 🎯 BlockIcon: 노드에서 사용

**위치**: `web/app/components/workflow/block-icon.tsx`

### 아이콘 매핑

```typescript
import {
  Agent,
  Answer,
  Code,
  Llm,
  IfElse,
  // ... 모든 아이콘 import
} from '@/app/components/base/icons/src/vender/workflow'

const getIcon = (type: BlockEnum, className: string) => {
  return {
    [BlockEnum.Start]: <Home className={className} />,
    [BlockEnum.LLM]: <Llm className={className} />,
    [BlockEnum.Code]: <Code className={className} />,
    [BlockEnum.IfElse]: <IfElse className={className} />,
    [BlockEnum.HttpRequest]: <Http className={className} />,
    [BlockEnum.Answer]: <Answer className={className} />,
    // ... 모든 노드 타입
  }[type]
}
```

### 배경색 정의

```typescript
const ICON_CONTAINER_BG_COLOR_MAP: Record<string, string> = {
  [BlockEnum.Start]: 'bg-util-colors-blue-brand-blue-brand-500',
  [BlockEnum.LLM]: 'bg-util-colors-indigo-indigo-500',
  [BlockEnum.Code]: 'bg-util-colors-blue-blue-500',
  [BlockEnum.End]: 'bg-util-colors-warning-warning-500',
  [BlockEnum.IfElse]: 'bg-util-colors-cyan-cyan-500',
  [BlockEnum.HttpRequest]: 'bg-util-colors-violet-violet-500',
  // ... 모든 노드 타입
}
```

### 크기 옵션

```typescript
const ICON_CONTAINER_CLASSNAME_SIZE_MAP: Record<string, string> = {
  xs: 'w-4 h-4 rounded-[5px] shadow-xs',   // 16px
  sm: 'w-5 h-5 rounded-md shadow-xs',      // 20px (기본값)
  md: 'w-6 h-6 rounded-lg shadow-md',      // 24px
}
```

### BlockIcon 컴포넌트

```typescript
const BlockIcon: FC<BlockIconProps> = ({
  type,
  size = 'sm',
  className,
  toolIcon,  // Tool/DataSource 노드용 커스텀 아이콘
}) => {
  const isToolOrDataSource =
    type === BlockEnum.Tool || type === BlockEnum.DataSource
  const showDefaultIcon = !isToolOrDataSource || !toolIcon

  return (
    <div className={cn(
      'flex items-center justify-center',
      'border-[0.5px] border-white/2 text-white',
      ICON_CONTAINER_CLASSNAME_SIZE_MAP[size],
      showDefaultIcon && ICON_CONTAINER_BG_COLOR_MAP[type],
      className,
    )}>
      {/* 기본 아이콘 */}
      {showDefaultIcon && getIcon(type, 'w-3.5 h-3.5')}

      {/* Tool/DataSource 커스텀 아이콘 */}
      {isToolOrDataSource && toolIcon && (
        <div
          className='h-full w-full shrink-0 rounded-md bg-cover'
          style={{ backgroundImage: `url(${toolIcon})` }}
        />
      )}
    </div>
  )
}
```

---

## 🎨 노드 타입별 색상 테마

| 노드 타입 | 색상 | 설명 |
|----------|------|------|
| **Start** | 🔵 Blue Brand | 시작 노드 |
| **LLM** | 🟣 Indigo | AI 모델 |
| **Code** | 🔵 Blue | 코드 실행 |
| **End** | 🟠 Warning (Orange) | 종료 노드 |
| **If-Else** | 🔷 Cyan | 조건 분기 |
| **Iteration** | 🔷 Cyan | 반복 |
| **Loop** | 🔷 Cyan | 루프 |
| **HTTP** | 🟣 Violet | HTTP 요청 |
| **Answer** | 🟠 Warning | 응답 |
| **Knowledge** | 🟢 Green | 지식 검색 |
| **Agent** | 🟣 Indigo | AI 에이전트 |

---

## 📦 사용 예제

### 1. 노드 컴포넌트에서 사용

```typescript
import BlockIcon from '@/app/components/workflow/block-icon'

const MyNode = ({ data }) => {
  return (
    <div className="node">
      {/* 노드 아이콘 */}
      <BlockIcon
        type={BlockEnum.LLM}
        size="sm"
      />

      <div className="node-content">
        {/* 노드 내용 */}
      </div>
    </div>
  )
}
```

### 2. Tool 노드 - 커스텀 아이콘

```typescript
<BlockIcon
  type={BlockEnum.Tool}
  size="md"
  toolIcon="https://example.com/tool-icon.png"
/>

// 또는 AppIcon 형식
<BlockIcon
  type={BlockEnum.Tool}
  size="md"
  toolIcon={{
    content: "🔧",
    background: "#3B82F6"
  }}
/>
```

### 3. 변수 선택기에서 사용 (작은 아이콘)

```typescript
import { VarBlockIcon } from '@/app/components/workflow/block-icon'

<VarBlockIcon
  type={BlockEnum.Code}
  className="text-blue-500"
/>
```

---

## 🔨 새 아이콘 추가 방법

### 1단계: SVG를 JSON으로 변환

**원본 SVG**:
```svg
<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path d="M7 2L12 7L7 12L2 7Z" fill="currentColor"/>
</svg>
```

**변환된 JSON**:
```json
{
  "icon": {
    "type": "element",
    "isRootNode": true,
    "name": "svg",
    "attributes": {
      "width": "14",
      "height": "14",
      "viewBox": "0 0 14 14",
      "fill": "none"
    },
    "children": [
      {
        "type": "element",
        "name": "path",
        "attributes": {
          "d": "M7 2L12 7L7 12L2 7Z",
          "fill": "currentColor"
        },
        "children": []
      }
    ]
  },
  "name": "MyNewIcon"
}
```

### 2단계: 파일 생성

**MyNewIcon.json** (위의 JSON 저장):
```
web/app/components/base/icons/src/vender/workflow/MyNewIcon.json
```

**MyNewIcon.tsx** (자동 생성 스크립트 또는 수동 복사):
```typescript
import * as React from 'react'
import data from './MyNewIcon.json'
import IconBase from '@/app/components/base/icons/IconBase'
import type { IconData } from '@/app/components/base/icons/IconBase'

const Icon = (
  { ref, ...props }: React.SVGProps<SVGSVGElement>,
) => <IconBase {...props} ref={ref} data={data as IconData} />

Icon.displayName = 'MyNewIcon'

export default Icon
```

### 3단계: Export 추가

**index.ts**:
```typescript
export { default as MyNewIcon } from './MyNewIcon'
```

### 4단계: BlockIcon에 등록

**block-icon.tsx**:
```typescript
import { MyNewIcon } from '@/app/components/base/icons/src/vender/workflow'

const getIcon = (type: BlockEnum, className: string) => {
  return {
    // ... 기존 아이콘
    [BlockEnum.MyNewNode]: <MyNewIcon className={className} />,
  }[type]
}

const ICON_CONTAINER_BG_COLOR_MAP = {
  // ... 기존 색상
  [BlockEnum.MyNewNode]: 'bg-util-colors-purple-purple-500',
}
```

---

## 💡 설계 패턴

### 1. JSON 기반 데이터 주도 설계

**장점**:
- SVG를 데이터로 관리 → 버전 관리 용이
- 자동화 스크립트로 일괄 생성 가능
- 런타임 동적 로딩 가능

**단점**:
- 직접 SVG 편집보다 복잡
- JSON 파싱 오버헤드 (미미함)

### 2. 컴포넌트 래퍼 패턴

```typescript
JSON 데이터 → React 컴포넌트 래퍼 → IconBase → SVG
```

**이점**:
- 일관된 인터페이스
- 공통 로직 중앙화 (IconBase)
- 타입 안정성

### 3. currentColor 사용

```json
{
  "fill": "currentColor"
}
```

**효과**:
- 부모의 `color` CSS 속성 상속
- 테마 변경 용이
- 다크 모드 지원 간편

---

## 🎯 아이콘 가이드라인

### 크기
- **표준**: 14×14px
- **ViewBox**: `0 0 14 14`
- **Stroke Width**: 1.5px (권장)

### 스타일
- **Fill**: `currentColor` (필수)
- **디자인**: 심플하고 명확한 형태
- **Line**: 둥근 모서리 (stroke-linecap="round")

### 접근성
- `aria-hidden="true"` 자동 추가 (IconBase)
- 장식용 아이콘 (의미는 텍스트로 제공)

---

## 🔍 디버깅

### JSON 유효성 검사

```typescript
// 올바른 구조
{
  "icon": {
    "type": "element",      // ✅ 필수
    "isRootNode": true,     // ✅ 루트에만
    "name": "svg",          // ✅ 필수
    "attributes": {...},    // ✅ 필수
    "children": [...]       // ✅ 필수
  },
  "name": "IconName"        // ✅ 필수
}
```

### 일반적인 오류

1. **아이콘이 보이지 않음**
   - JSON 구조 확인
   - `fill="currentColor"` 설정 확인
   - import 경로 확인

2. **색상이 적용되지 않음**
   - `fill="currentColor"` 누락
   - 부모 요소의 `color` CSS 확인

3. **크기가 이상함**
   - `viewBox` 속성 확인
   - 컨테이너 크기 확인

---

## 📚 관련 파일

### 핵심 파일
- `IconBase.tsx` - 공통 렌더러
- `block-icon.tsx` - 노드 아이콘 컴포넌트
- `workflow/index.ts` - 아이콘 export

### 아이콘 파일
- `workflow/*.json` - 아이콘 데이터
- `workflow/*.tsx` - 아이콘 컴포넌트

---

## 🎨 색상 팔레트

Tailwind 유틸리티 색상:
```css
bg-util-colors-blue-brand-blue-brand-500  /* 브랜드 블루 */
bg-util-colors-indigo-indigo-500          /* 인디고 */
bg-util-colors-blue-blue-500              /* 블루 */
bg-util-colors-warning-warning-500        /* 오렌지 */
bg-util-colors-cyan-cyan-500              /* 시안 */
bg-util-colors-violet-violet-500          /* 바이올렛 */
bg-util-colors-green-green-500            /* 그린 */
```

---

## 💡 최적화 팁

### 1. 아이콘 번들 크기
- 사용하지 않는 아이콘 제거
- JSON 파일 최소화 (불필요한 공백 제거)

### 2. 렌더링 성능
- `React.memo()` 사용 (BlockIcon에 이미 적용)
- 동적 import 고려 (필요시)

### 3. 캐싱
- JSON 데이터는 import되므로 번들에 포함
- 브라우저 캐싱 자동 적용

---

## 🔗 참고 자료

- [SVG 스펙](https://www.w3.org/TR/SVG2/)
- [React SVG 가이드](https://react-svgr.com/)
- [Tailwind CSS 색상](https://tailwindcss.com/docs/customizing-colors)

---

**작성일**: 2025-10-30
**Dify 버전**: v1.9.2
