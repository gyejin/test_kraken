# Claude Code - 프로젝트 기술 문서

이 문서는 Claude Code가 이 프로젝트를 작업할 때 참고해야 할 기술적 세부사항을 담고 있습니다.

## 프로젝트 컨텍스트

**목적**: Dify 워크플로우 노드 UI를 React Flow로 재구현한 실험 프로젝트
**난이도**: 중급 (중간 수준)
**원본 참조**: `ref/` 폴더의 실제 Dify 소스 코드 + `claudedocs/` 분석 문서

## 핵심 아키텍처 결정

### 1. Tailwind CSS v4 특이사항 (⚠️ 중요)

**문제**: Tailwind v4는 v3과 완전히 다른 설정 방식 사용
**해결**: `tailwind.config.ts` **무시됨** → CSS 파일의 `@theme` 지시어만 인식

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* 모든 커스텀 색상은 --color- 네임스페이스 필수 */
  --color-workflow-block-bg: #fcfcfd;
  --color-text-primary: #101828;
  /* ... */
}
```

**규칙**:
- 색상: `--color-{name}` → `bg-{name}`, `text-{name}` 클래스 생성
- Border radius: `--radius-{size}` → `rounded-{size}` 클래스 생성
- Shadow: `--shadow-{size}` → `shadow-{size}` 클래스 생성
- `tailwind.config.ts`는 **참고용으로만** 남겨둠 (실제 작동 안 함)

### 2. Dify 테마 시스템

**구조**:
```
ref/themes/light.css (원본 Dify CSS 변수)
  ↓ @import
src/index.css
  ↓ 필요한 변수만 추출
@theme { --color-* } (Tailwind v4용)
```

**주의**: `light.css`의 모든 변수는 `html[data-theme="light"]` 선택자 내부에 있음
→ `index.html`에 `data-theme="light"` 속성 **필수**

### 3. JSON 기반 아이콘 시스템

Dify의 독특한 아이콘 시스템:

```typescript
// AbstractNode 구조
interface AbstractNode {
  type: 'element'
  isRootNode?: boolean
  name: string  // HTML 태그명 (svg, path, rect 등)
  attributes: Record<string, string>  // 속성들
  children: AbstractNode[]  // 재귀적 자식들
}
```

**IconBase.tsx**: JSON을 React.createElement()로 재귀 변환
```typescript
function generate(node: AbstractNode, key: string, rootProps?: Record<string, any>): ReactElement {
  const { type, name, attributes, children } = node
  const props = node.isRootNode ? { ...attributes, ...rootProps, key } : { ...attributes, key }
  const childElements = children?.map((child, index) => generate(child, `${key}-${index}`))
  return createElement(name, props, ...(childElements || []))
}
```

**경고 무시**: SVG 속성 `fill-rule`, `clip-rule` → React의 `fillRule`, `clipRule` 경고 발생
→ Dify 원본도 동일하게 사용, 렌더링 문제 없음, 무시해도 됨

### 4. BaseNode 패턴

모든 노드는 `BaseNode` 래퍼를 통해 공통 기능 제공:

```typescript
<BaseNode id={id} data={data}>
  {/* 노드별 커스텀 내용 */}
  <div>LLM 모델 설정...</div>
</BaseNode>
```

**BaseNode가 제공하는 것**:
- 240px 고정 폭
- rounded-[15px] 테두리
- 상태별 테두리 색상 (running → accent, succeeded → success, failed → destructive)
- BlockIcon (왼쪽 위 아이콘)
- StatusIcon (오른쪽 위 상태 아이콘)
- NodeHandle (source/target 연결점)

### 5. 노드 타입 매핑 시스템

**2단계 매핑**:

1. **React Flow 레벨** (`nodes/index.tsx`):
```typescript
const nodeTypes: NodeTypes = {
  custom: CustomNode,  // 모든 노드가 "custom" 타입 사용
}
```

2. **CustomNode 내부** (`nodes/index.tsx`):
```typescript
export const CustomNode = ({ id, data }: NodeProps<WorkflowNode>) => {
  const nodeComponentMap: Record<string, ComponentType<NodeComponentProps>> = {
    [BlockEnum.Start]: StartNode,
    [BlockEnum.LLM]: LLMNode,
    [BlockEnum.End]: EndNode,
  }

  const Component = nodeComponentMap[data.type]
  return <Component id={id} data={data} />
}
```

**이유**: React Flow는 단일 타입 "custom"만 인식, 내부에서 `data.type`으로 실제 컴포넌트 선택

### 6. 타입스크립트 경로 별칭

```json
// tsconfig.app.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
})
```

**주의**: 아이콘 파일들은 상대 경로 사용 (`../IconBase`)
→ Dify 원본이 절대 경로(`@/app/components/...`)라 초기 오류 발생 → 수정 완료

## 구현 세부사항

### 노드 스타일 사양

```typescript
// BaseNode 클래스 구성
clsx(
  'workflow-node',           // 선택자용
  'group relative pb-1',     // 레이아웃
  'rounded-[15px]',          // Dify 사양: 15px 반경
  'w-[240px]',               // Dify 사양: 240px 고정폭
  'bg-workflow-block-bg',    // 배경: #fcfcfd
  'border-2 border-transparent',  // 기본 2px 투명 테두리
  'shadow-xs',               // 기본 그림자
  'transition-all',
  'hover:shadow-lg',
  {
    '!border-state-accent-solid': showRunningBorder,      // #2E90FA
    '!border-state-success-solid': showSuccessBorder,     // #17B26A
    '!border-state-destructive-solid': showFailedBorder,  // #EF4444
    'opacity-50': data._dimmed,
  }
)
```

### 핸들 스타일 (얇은 세로 막대)

```typescript
// NodeHandle 스타일
clsx(
  '!z-[1] !h-4 !w-4 !rounded-none !border-none !bg-transparent',
  'after:absolute after:left-1.5 after:top-1 after:h-2 after:w-0.5',
  'after:bg-workflow-link-line-handle',  // #d0d5dc
  'transition-all hover:scale-125',
)
```

**구조**: 투명한 4x4 핸들 영역 + `::after` 가상 요소로 얇은 막대 렌더링

### 엣지 색상 로직

```typescript
// custom-edge.tsx
const edgeStyle = useMemo(() => {
  if (data?._waitingRun) return { stroke: '#F79009', strokeWidth: 2 }  // 대기: 주황
  if (data?._sourceRunningStatus === NodeRunningStatus.Running)
    return { stroke: '#296dff', strokeWidth: 2, strokeDasharray: '5,5' }  // 실행중: 파란색 점선
  if (data?._sourceRunningStatus === NodeRunningStatus.Succeeded)
    return { stroke: '#17B26A', strokeWidth: 2 }  // 성공: 초록
  if (data?._sourceRunningStatus === NodeRunningStatus.Failed)
    return { stroke: '#EF4444', strokeWidth: 2 }  // 실패: 빨강
  return { stroke: '#d0d5dc', strokeWidth: 2 }  // 기본: 회색
}, [data])
```

### BlockIcon 색상 매핑

```typescript
// block-icon.tsx
const ICON_CONTAINER_BG_COLOR_MAP: Record<string, string> = {
  [BlockEnum.Start]: 'bg-util-colors-blue-brand-blue-brand-500',  // #2970FF
  [BlockEnum.LLM]: 'bg-util-colors-indigo-indigo-500',            // #6366F1
  [BlockEnum.End]: 'bg-util-colors-warning-warning-500',          // #F79009
}

const getIcon = (type: BlockEnum, className: string) => {
  const iconMap = {
    [BlockEnum.Start]: <Home className={className} />,
    [BlockEnum.LLM]: <Llm className={className} />,
    [BlockEnum.End]: <Answer className={className} />,
  }
  return iconMap[type] || null
}
```

### 상태 아이콘 (Remix Icon)

```typescript
// node.tsx - StatusIcon 컴포넌트
const StatusIcon = ({ status }: { status?: NodeRunningStatus }) => {
  if (!status || status === 'not-start') return null

  if (status === 'running') {
    return <RiLoader2Line className="h-3.5 w-3.5 animate-spin text-text-accent" />
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
```

## 타이포그래피 시스템

```css
/* index.css에 정의된 Dify 타이포그래피 */
.system-sm-semibold-uppercase {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  line-height: 16px;
}

.system-xs-regular {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.system-xs-medium {
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
}

.system-2xs-regular-uppercase {
  font-size: 10px;
  font-weight: 400;
  text-transform: uppercase;
  line-height: 12px;
}
```

**사용 위치**:
- `system-sm-semibold-uppercase`: 노드 타이틀 (START, LLM 모델, END)
- `system-2xs-regular-uppercase`: 라벨 (MODEL, Prompt:)
- `system-xs-medium`: 강조 텍스트 (OpenAI · GPT-4)
- `system-xs-regular`: 일반 텍스트 (설명, 프롬프트 내용)

## 의존성 버전 주의사항

### React Flow v12
- v11과 차이: CSS import **필수** (`import '@xyflow/react/dist/style.css'`)
- 문서 코드와 실제 코드의 import 경로가 다를 수 있음
- `workflow/index.tsx:14`에서 CSS import 확인

### Tailwind CSS v4
- **완전히 새로운 설정 방식**
- `@tailwindcss/vite` 플러그인 필수
- `tailwind.config.ts`는 무시됨
- CSS 기반 테마 시스템만 사용

### React 19
- babel-plugin-react-compiler 사용 중
- 대부분 호환되지만, 일부 라이브러리는 React 18 요구 가능

## 문제 해결 가이드

### 스타일이 적용되지 않는 경우

**체크리스트**:
1. `index.html`에 `data-theme="light"` 있는지 확인
2. `src/index.css`의 `@theme { }` 블록 확인
3. 브라우저 DevTools에서 CSS 변수 로드 확인:
   ```javascript
   getComputedStyle(document.documentElement).getPropertyValue('--color-workflow-block-bg')
   // 예상: "#fcfcfd"
   ```
4. Tailwind 클래스명 오타 확인 (`bg-workflow-block-bg` 등)

### 아이콘이 렌더링되지 않는 경우

**체크리스트**:
1. Import 경로 확인: `../IconBase` (상대 경로)
2. `IconBase.tsx`의 `generate()` 함수 확인
3. 콘솔의 `fill-rule` 경고는 무시 (정상)
4. SVG 데이터의 `AbstractNode` 구조 확인

### 노드가 나타나지 않는 경우

**체크리스트**:
1. `App.tsx`의 샘플 데이터 확인 (`initialNodes`, `initialEdges`)
2. `data.type`이 `BlockEnum` 값과 일치하는지 확인
3. `nodeTypes` 매핑 확인 (`workflow/index.tsx:20`)
4. `CustomNode`의 `nodeComponentMap` 확인

### Hot Reload가 작동하지 않는 경우

**해결**:
- Vite 개발 서버 재시작: `Ctrl+C` → `npm run dev`
- 브라우저 강력 새로고침: `Ctrl+Shift+R`
- `.vite/` 캐시 삭제 후 재시작

## 확장 가이드

### 새 노드 타입 추가하기

1. **타입 정의** (`workflow/types.ts`):
```typescript
export enum BlockEnum {
  Start = 'start',
  LLM = 'llm',
  End = 'end',
  IfElse = 'ifelse',  // 새 노드
}
```

2. **아이콘 추가** (`components/icons/workflow/`):
```typescript
// IfElse.tsx
import IconBase from '../IconBase'
import type { IconData } from '../IconBase'

const Icon: IconData = { /* AbstractNode JSON */ }
export const IfElse: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <IconBase icon={Icon} {...props} />
)
```

3. **노드 컴포넌트** (`workflow/nodes/ifelse/node.tsx`):
```typescript
import type { NodeComponentProps } from '../types'

export const IfElseNode = ({ data }: NodeComponentProps) => {
  return (
    <div className="space-y-1.5">
      {/* 노드 내용 */}
    </div>
  )
}
```

4. **매핑 등록** (`workflow/nodes/index.tsx`):
```typescript
import { IfElseNode } from './ifelse/node'

const nodeComponentMap: Record<string, ComponentType<NodeComponentProps>> = {
  [BlockEnum.Start]: StartNode,
  [BlockEnum.LLM]: LLMNode,
  [BlockEnum.End]: EndNode,
  [BlockEnum.IfElse]: IfElseNode,  // 추가
}
```

5. **BlockIcon 매핑** (`workflow/nodes/_base/block-icon.tsx`):
```typescript
import { IfElse } from '@/components/icons/workflow/IfElse'

const getIcon = (type: BlockEnum, className: string) => {
  const iconMap = {
    [BlockEnum.Start]: <Home className={className} />,
    [BlockEnum.LLM]: <Llm className={className} />,
    [BlockEnum.End]: <Answer className={className} />,
    [BlockEnum.IfElse]: <IfElse className={className} />,  // 추가
  }
  return iconMap[type] || null
}

const ICON_CONTAINER_BG_COLOR_MAP: Record<string, string> = {
  // ...
  [BlockEnum.IfElse]: 'bg-util-colors-cyan-cyan-500',  // 색상 선택
}
```

### 새 색상 추가하기

**Tailwind v4 방식**:
```css
/* src/index.css */
@theme {
  --color-custom-primary: #FF5733;
  --color-custom-secondary: #33FF57;
}
```

**사용**:
```tsx
<div className="bg-custom-primary text-custom-secondary">
  Custom colors
</div>
```

## 참고 파일 위치

- **아키텍처 문서**: `claudedocs/workflow-node-ui-architecture.md`
- **아이콘 시스템**: `claudedocs/workflow-node-icons.md`
- **원본 Dify 코드**: `ref/app/`, `ref/themes/`
- **실제 구현**: `src/workflow/`, `src/components/icons/`

## 작업 시 주의사항

1. ✅ **절대 `tailwind.config.ts`에 색상 추가하지 마세요** → `src/index.css`의 `@theme` 사용
2. ✅ **새 아이콘은 반드시 Dify `ref/` 폴더에서 복사** → 일관성 유지
3. ✅ **BaseNode 패턴 유지** → 모든 노드는 BaseNode로 래핑
4. ✅ **240px 고정폭 유지** → Dify 디자인 사양
5. ✅ **타이포그래피 클래스 재사용** → 새 크기 만들지 말고 기존 것 사용

## 성공적인 구현 체크리스트

- [ ] 브라우저에서 노드 배경이 흰색(`#fcfcfd`)으로 보임
- [ ] 노드 아이콘이 컬러(파랑/보라/주황)로 표시됨
- [ ] 핸들이 얇은 세로 막대로 보임
- [ ] 엣지가 회색 선으로 연결됨
- [ ] 콘솔에 `fill-rule` 경고만 있고 다른 에러 없음
- [ ] Hot reload 정상 작동
- [ ] TypeScript 에러 없음

---

**마지막 업데이트**: 2025-10-31
**프로젝트 상태**: 기본 구현 완료 (Start, LLM, End 노드)
**다음 단계**: 추가 노드 타입 구현, 노드 설정 패널, 실행 시뮬레이션
