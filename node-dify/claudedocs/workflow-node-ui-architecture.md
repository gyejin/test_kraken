# Dify 워크플로우 노드 기반 UI 아키텍처 분석

## 📋 개요

Dify는 **React Flow v11**을 사용하여 드래그 앤 드롭 가능한 노드 기반 워크플로우 UI를 구현했습니다.

### 핵심 기술 스택
- **React Flow**: v11.11.4 - 노드 기반 그래프 UI 라이브러리
- **React**: 컴포넌트 기반 UI 렌더링
- **TypeScript**: 타입 안정성
- **Zustand**: 상태 관리 (store)
- **Immer**: 불변 상태 업데이트

---

## 🏗️ 아키텍처 구조

```
workflow/
├── index.tsx                    # 메인 워크플로우 컴포넌트 (React Flow 설정)
├── types.ts                     # 타입 정의 (Node, Edge, BlockEnum 등)
├── constants.ts                 # 상수 정의
├── store/                       # Zustand 상태 관리
├── hooks/                       # 커스텀 훅
├── nodes/                       # 노드 구현
│   ├── index.tsx               # 노드 라우터
│   ├── components.ts           # 노드 컴포넌트 매핑
│   ├── _base/                  # 베이스 노드 (공통 래퍼)
│   │   ├── node.tsx           # BaseNode 컴포넌트
│   │   └── components/
│   │       ├── node-handle.tsx      # 연결 핸들
│   │       ├── node-control.tsx     # 노드 컨트롤
│   │       └── workflow-panel.tsx   # 설정 패널
│   ├── llm/                    # LLM 노드
│   │   ├── node.tsx           # 노드 UI
│   │   ├── panel.tsx          # 설정 패널
│   │   └── types.ts           # 타입 정의
│   ├── if-else/                # 조건 분기 노드
│   ├── code/                   # 코드 실행 노드
│   ├── http/                   # HTTP 요청 노드
│   └── ... (25+ 노드 타입)
├── custom-edge.tsx             # 커스텀 엣지 (노드 간 연결선)
├── custom-connection-line.tsx  # 연결선 드래그 시각화
└── panel/                      # 사이드 패널
```

---

## 🔑 핵심 구현 패턴

### 1. 노드 타입 시스템

**BlockEnum 정의** (`types.ts`):
```typescript
export enum BlockEnum {
  Start = 'start',
  End = 'end',
  LLM = 'llm',
  IfElse = 'if-else',
  Code = 'code',
  HttpRequest = 'http-request',
  Tool = 'tool',
  KnowledgeRetrieval = 'knowledge-retrieval',
  // ... 총 25+ 노드 타입
}
```

**공통 노드 타입 구조**:
```typescript
export type CommonNodeType<T = {}> = {
  // 연결 상태
  _connectedSourceHandleIds?: string[]
  _connectedTargetHandleIds?: string[]
  _targetBranches?: Branch[]

  // 실행 상태
  _runningStatus?: NodeRunningStatus
  _singleRunningStatus?: NodeRunningStatus

  // UI 상태
  selected?: boolean
  _isCandidate?: boolean
  _isBundled?: boolean
  _dimmed?: boolean

  // 반복 실행 (Iteration)
  isInIteration?: boolean
  iteration_id?: string
  _iterationLength?: number
  _iterationIndex?: number

  // 기본 정보
  title: string
  desc: string
  type: BlockEnum
  width?: number
  height?: number
  position?: XYPosition

  // 에러 처리 및 재시도
  error_strategy?: ErrorHandleTypeEnum
  retry_config?: WorkflowRetryConfig
  default_value?: DefaultValueForm[]
} & T // 각 노드 타입별 추가 데이터
```

---

### 2. 노드 컴포넌트 매핑 시스템

**컴포넌트 맵** (`nodes/components.ts`):
```typescript
// 노드 UI 컴포넌트 매핑
export const NodeComponentMap: Record<string, ComponentType<any>> = {
  [BlockEnum.Start]: StartNode,
  [BlockEnum.End]: EndNode,
  [BlockEnum.LLM]: LLMNode,
  [BlockEnum.IfElse]: IfElseNode,
  [BlockEnum.Code]: CodeNode,
  // ... 모든 노드 타입
}

// 설정 패널 컴포넌트 매핑
export const PanelComponentMap: Record<string, ComponentType<any>> = {
  [BlockEnum.Start]: StartPanel,
  [BlockEnum.End]: EndPanel,
  [BlockEnum.LLM]: LLMPanel,
  [BlockEnum.IfElse]: IfElsePanel,
  // ... 모든 노드 타입
}
```

**노드 라우터** (`nodes/index.tsx`):
```typescript
const CustomNode = (props: NodeProps) => {
  const nodeData = props.data
  const NodeComponent = useMemo(
    () => NodeComponentMap[nodeData.type],
    [nodeData.type]
  )

  return (
    <BaseNode id={props.id} data={props.data}>
      <NodeComponent />
    </BaseNode>
  )
}
```

---

### 3. BaseNode: 공통 노드 래퍼

**역할**:
- 모든 노드 타입에 공통 기능 제공
- 연결 핸들 (입력/출력)
- 실행 상태 표시 (로딩, 성공, 에러)
- 크기 조절
- 에러 처리 UI
- 재시도 UI

**주요 기능**:
```typescript
const BaseNode: FC<BaseNodeProps> = ({ id, data, children }) => {
  // 1. 읽기 전용 모드 체크
  const { nodesReadOnly } = useNodesReadOnly()

  // 2. 크기 변경 감지 (Iteration/Loop 내부 노드)
  useEffect(() => {
    if (nodeRef.current && data.selected && data.isInIteration) {
      const resizeObserver = new ResizeObserver(() => {
        handleNodeIterationChildSizeChange(id)
      })
      resizeObserver.observe(nodeRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [data.isInIteration, data.selected, id])

  // 3. 실행 상태 표시
  const renderStatusIcon = () => {
    switch (data._runningStatus) {
      case NodeRunningStatus.Running:
        return <RiLoader2Line className="animate-spin" />
      case NodeRunningStatus.Succeeded:
        return <RiCheckboxCircleFill className="text-green-500" />
      case NodeRunningStatus.Failed:
        return <RiErrorWarningFill className="text-red-500" />
    }
  }

  // 4. 렌더링
  return (
    <div ref={nodeRef} className={nodeClassName}>
      {/* 노드 아이콘 */}
      <BlockIcon type={data.type} />

      {/* 실제 노드 컨텐츠 (children) */}
      {children}

      {/* 연결 핸들 */}
      <NodeTargetHandle {...} />
      <NodeSourceHandle {...} />

      {/* 실행 상태 */}
      {renderStatusIcon()}

      {/* 에러 처리 UI */}
      {hasErrorHandleNode(data) && <ErrorHandleOnNode />}

      {/* 재시도 UI */}
      {hasRetryNode(data) && <RetryOnNode />}
    </div>
  )
}
```

---

### 4. 개별 노드 구현 예제

#### 간단한 노드: LLM 노드

**노드 UI** (`nodes/llm/node.tsx`):
```typescript
const Node: FC<NodeProps<LLMNodeType>> = ({ data }) => {
  const { provider, name: modelId } = data.model || {}
  const { textGenerationModelList } = useTextGenerationCurrentProviderAndModelAndModelList()
  const hasSetModel = provider && modelId

  if (!hasSetModel)
    return null

  return (
    <div className='mb-1 px-3 py-1'>
      {hasSetModel && (
        <ModelSelector
          defaultModel={{ provider, model: modelId }}
          modelList={textGenerationModelList}
          triggerClassName='!h-6 !rounded-md'
          readonly
        />
      )}
    </div>
  )
}
```

#### 복잡한 노드: If-Else 노드

**노드 UI** (`nodes/if-else/node.tsx`):
```typescript
const IfElseNode: FC<NodeProps<IfElseNodeType>> = (props) => {
  const { data } = props
  const { cases } = data

  return (
    <div className='px-3'>
      {cases.map((caseItem, index) => (
        <div key={caseItem.case_id}>
          {/* 케이스 헤더 (IF, ELIF) */}
          <div className='relative flex h-6 items-center px-1'>
            <div className='text-[12px] font-semibold'>
              {index === 0 ? 'IF' : 'ELIF'}
            </div>

            {/* 각 케이스마다 출력 핸들 */}
            <NodeSourceHandle
              {...props}
              handleId={caseItem.case_id}
              handleClassName='!top-1/2 !-right-[21px]'
            />
          </div>

          {/* 조건 표시 */}
          <div className='space-y-0.5'>
            {caseItem.conditions.map((condition, i) => (
              <div key={condition.id}>
                <ConditionValue
                  variableSelector={condition.variable_selector}
                  operator={condition.comparison_operator}
                  value={condition.value}
                />
                {/* AND/OR 연산자 표시 */}
                {i !== caseItem.conditions.length - 1 && (
                  <div className='text-[10px]'>
                    {caseItem.logical_operator}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ELSE 브랜치 (기본 출력 핸들) */}
      <NodeSourceHandle
        {...props}
        handleId='false'
        handleClassName='!top-1/2 !-right-[21px]'
      />
    </div>
  )
}
```

---

### 5. React Flow 통합

**메인 워크플로우 컴포넌트** (`index.tsx`):
```typescript
// 노드 타입 등록
const nodeTypes = {
  [CUSTOM_NODE]: CustomNode,
  [CUSTOM_NOTE_NODE]: CustomNoteNode,
  [CUSTOM_SIMPLE_NODE]: CustomSimpleNode,
  [CUSTOM_ITERATION_START_NODE]: CustomIterationStartNode,
  [CUSTOM_LOOP_START_NODE]: CustomLoopStartNode,
}

// 엣지 타입 등록
const edgeTypes = {
  [CUSTOM_EDGE]: CustomEdge,
}

export const Workflow: FC<WorkflowProps> = memo(({
  nodes: originalNodes,
  edges: originalEdges,
  viewport,
  onWorkflowDataUpdate,
}) => {
  const [nodes, setNodes] = useNodesState(originalNodes)
  const [edges, setEdges] = useEdgesState(originalEdges)

  // 노드 연결 처리
  const { handleNodeConnect } = useNodesInteractions()

  // 엣지 업데이트 처리
  const { handleEdgesChange } = useEdgesInteractions()

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={setNodes}
      onEdgesChange={handleEdgesChange}
      onConnect={handleNodeConnect}
      connectionLineComponent={CustomConnectionLine}
      selectionMode={SelectionMode.Partial}
      panOnScroll
      panOnDrag={controlMode === ControlMode.Hand}
      zoomOnDoubleClick={false}
    >
      <Background />
      {/* 노드 추가 패널 */}
      <Operator />
      {/* 컨트롤 버튼 (줌, 핏 등) */}
      <Control />
      {/* 가이드 라인 */}
      <HelpLine />
    </ReactFlow>
  )
})
```

---

## 🔌 노드 연결 시스템

### 연결 핸들 (Handles)

**NodeSourceHandle** (출력):
```typescript
export const NodeSourceHandle: FC<NodeHandleProps> = ({
  handleId,
  handleClassName,
}) => {
  return (
    <Handle
      type="source"
      id={handleId}
      position={Position.Right}
      className={cn('node-handle', handleClassName)}
    />
  )
}
```

**NodeTargetHandle** (입력):
```typescript
export const NodeTargetHandle: FC<NodeHandleProps> = ({
  handleId,
  handleClassName,
}) => {
  return (
    <Handle
      type="target"
      id={handleId}
      position={Position.Left}
      className={cn('node-handle', handleClassName)}
    />
  )
}
```

### 멀티 핸들 지원

If-Else 노드처럼 여러 출력이 필요한 경우:
```typescript
// IF 케이스 출력
<NodeSourceHandle handleId="case_1" />

// ELIF 케이스 출력
<NodeSourceHandle handleId="case_2" />

// ELSE 출력
<NodeSourceHandle handleId="false" />
```

---

## 🎨 커스텀 엣지 (연결선)

**CustomEdge** (`custom-edge.tsx`):
```typescript
const CustomEdge: FC<EdgeProps> = ({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  // 1. 엣지 경로 계산
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // 2. 실행 상태에 따른 스타일
  const edgeStyle = useMemo(() => {
    if (data._waitingRun)
      return { stroke: '#F79009', strokeWidth: 2 }
    if (data._sourceRunningStatus === NodeRunningStatus.Running)
      return { stroke: '#2E90FA', strokeWidth: 2, strokeDasharray: '5,5' }
    if (data._sourceRunningStatus === NodeRunningStatus.Succeeded)
      return { stroke: '#17B26A', strokeWidth: 2 }
    return { stroke: '#D0D5DD', strokeWidth: 2 }
  }, [data])

  return (
    <g>
      {/* 엣지 경로 */}
      <path
        id={id}
        d={edgePath}
        style={edgeStyle}
        className="react-flow__edge-path"
      />

      {/* 호버 시 두꺼운 보이지 않는 선 (클릭 영역 확대) */}
      <path
        d={edgePath}
        fill="none"
        strokeWidth={20}
        strokeOpacity={0}
        className="react-flow__edge-interaction"
      />
    </g>
  )
}
```

---

## 🎯 상태 관리

### Zustand Store

**워크플로우 스토어** (`store/index.ts`):
```typescript
interface WorkflowStore {
  // 노드 상태
  nodes: Node[]
  edges: Edge[]

  // UI 상태
  controlMode: ControlMode
  nodeAnimation: boolean
  selectedNodes: SelectedNode[]

  // 패널 상태
  showPanel: boolean
  panelWidth: number

  // 액션
  setNodes: (nodes: Node[]) => void
  setEdges: (edges: Edge[]) => void
  setControlMode: (mode: ControlMode) => void
  // ...
}

export const useWorkflowStore = create<WorkflowStore>((set, get) => ({
  nodes: [],
  edges: [],
  controlMode: ControlMode.Pointer,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  // ...
}))
```

---

## 🎬 실행 상태 시각화

### 노드 실행 상태

```typescript
export enum NodeRunningStatus {
  NotStart = 'not-start',
  Waiting = 'waiting',
  Running = 'running',
  Succeeded = 'succeeded',
  Failed = 'failed',
  Exception = 'exception',
}
```

### 상태에 따른 UI

1. **대기 중 (Waiting)**: 회색 테두리
2. **실행 중 (Running)**:
   - 파란색 테두리
   - 로딩 스피너 애니메이션
   - 연결선 점선 애니메이션
3. **성공 (Succeeded)**:
   - 녹색 체크 아이콘
   - 연결선 녹색
4. **실패 (Failed)**:
   - 빨간색 경고 아이콘
   - 에러 메시지 표시

---

## 🔄 특수 노드: Iteration & Loop

### Iteration 노드 (반복 실행)

**구조**:
```
┌─────────────────────────┐
│ Iteration               │
│ ┌─────────────────────┐ │
│ │ Iteration Start     │ │ ← 시작 지점
│ └──────────┬──────────┘ │
│            │             │
│ ┌──────────▼──────────┐ │
│ │ Child Nodes (반복됨) │ │ ← 내부 노드들
│ └─────────────────────┘ │
└─────────────────────────┘
```

**특징**:
- 자식 노드들을 반복 실행
- `isInIteration` 플래그로 내부 노드 식별
- 크기 자동 조정 (자식 노드에 맞춰)

---

## 📦 노드 추가 시스템

**BlockSelector** (`block-selector/index.tsx`):
```typescript
const BlockSelector = () => {
  return (
    <div className="block-selector">
      {/* 노드 카테고리 탭 */}
      <Tabs>
        <Tab name="All" />
        <Tab name="Logic" />
        <Tab name="Data" />
        <Tab name="Tools" />
      </Tabs>

      {/* 노드 목록 */}
      <div className="node-list">
        {blockList.map(block => (
          <BlockItem
            key={block.type}
            type={block.type}
            icon={block.icon}
            title={block.title}
            description={block.description}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  )
}
```

---

## 🎨 스타일링 시스템

### Tailwind CSS 클래스

노드 스타일 예제:
```typescript
const nodeClassName = cn(
  'workflow-node',
  'relative',
  'border-2',
  'rounded-lg',
  'bg-white',
  'shadow-sm',
  {
    'border-blue-500': data.selected,
    'border-gray-300': !data.selected,
    'opacity-50': data._dimmed,
  }
)
```

### 테마 변수

```css
:root {
  --workflow-node-bg: #ffffff;
  --workflow-node-border: #e5e7eb;
  --workflow-node-selected: #3b82f6;
  --workflow-edge-default: #d0d5dd;
  --workflow-edge-running: #2e90fa;
  --workflow-edge-success: #17b26a;
}
```

---

## 🔌 확장성

### 새 노드 타입 추가 방법

1. **타입 정의 추가** (`types.ts`):
```typescript
export enum BlockEnum {
  // ... 기존 타입
  MyNewNode = 'my-new-node',
}

export type MyNewNodeType = {
  // 노드별 데이터
  customParam: string
  options: any
}
```

2. **노드 컴포넌트 생성**:
```typescript
// nodes/my-new-node/node.tsx
const MyNewNode: FC<NodeProps<MyNewNodeType>> = ({ data }) => {
  return (
    <div>
      {/* 노드 UI */}
      <div>{data.customParam}</div>
    </div>
  )
}

// nodes/my-new-node/panel.tsx
const MyNewPanel: FC<NodePanelProps<MyNewNodeType>> = ({ data }) => {
  return (
    <div>
      {/* 설정 패널 UI */}
    </div>
  )
}
```

3. **컴포넌트 맵에 등록** (`nodes/components.ts`):
```typescript
export const NodeComponentMap = {
  // ... 기존 노드
  [BlockEnum.MyNewNode]: MyNewNode,
}

export const PanelComponentMap = {
  // ... 기존 패널
  [BlockEnum.MyNewNode]: MyNewPanel,
}
```

---

## 🎯 핵심 설계 원칙

### 1. 관심사 분리
- **노드 UI**: 시각적 표현만 담당
- **패널 UI**: 설정/편집 담당
- **BaseNode**: 공통 기능 제공
- **Store**: 상태 관리

### 2. 컴포지션 패턴
```typescript
<BaseNode>
  <SpecificNodeContent />
</BaseNode>
```

### 3. 타입 안정성
- 모든 노드는 `CommonNodeType<T>` 확장
- TypeScript로 타입 안전성 보장

### 4. 재사용성
- 공통 컴포넌트 (`NodeHandle`, `BlockIcon` 등)
- 커스텀 훅 (`useNodesInteractions`, `useEdgesInteractions` 등)

---

## 📚 주요 학습 포인트

1. **React Flow 활용**
   - 노드/엣지 타입 커스터마이징
   - 핸들을 통한 연결 관리
   - 상태 기반 스타일링

2. **노드 시스템 설계**
   - BaseNode 패턴으로 공통 기능 추상화
   - 컴포넌트 맵을 통한 동적 렌더링
   - 타입별 노드/패널 분리

3. **상태 관리**
   - Zustand로 글로벌 상태 관리
   - React Flow의 내부 상태와 통합

4. **실행 시각화**
   - 실시간 상태 업데이트
   - 애니메이션을 통한 흐름 표현

5. **확장 가능한 아키텍처**
   - 새 노드 타입 추가 용이
   - 플러그인 시스템 지원 가능

---

## 🔗 관련 파일

### 필수 파일
- `workflow/index.tsx` - 메인 워크플로우
- `workflow/types.ts` - 타입 정의
- `workflow/nodes/index.tsx` - 노드 라우터
- `workflow/nodes/components.ts` - 컴포넌트 맵
- `workflow/nodes/_base/node.tsx` - BaseNode

### 참고 파일
- `workflow/custom-edge.tsx` - 커스텀 엣지
- `workflow/store/` - 상태 관리
- `workflow/hooks/` - 커스텀 훅
- `workflow/block-selector/` - 노드 추가 UI

---

## 💡 구현 시 고려사항

1. **성능 최적화**
   - `React.memo()` 활용
   - `useMemo()`, `useCallback()` 적절히 사용
   - 대량 노드 렌더링 시 가상화 고려

2. **접근성**
   - 키보드 네비게이션 지원
   - ARIA 속성 추가
   - 화면 리더 호환성

3. **모바일 대응**
   - 터치 제스처 지원
   - 반응형 레이아웃

4. **에러 처리**
   - 노드 실행 실패 시각화
   - 재시도 메커니즘
   - 에러 로깅

---

## 📖 참고 자료

- [React Flow 공식 문서](https://reactflow.dev/)
- [Dify GitHub Repository](https://github.com/langgenius/dify)
- [Zustand 문서](https://github.com/pmndrs/zustand)

---

**작성일**: 2025-10-30
**버전**: Dify v1.9.2
**React Flow**: v11.11.4
