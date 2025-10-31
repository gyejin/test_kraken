# Dify-Style Workflow Node Component

React Flow 기반의 Dify 스타일 워크플로우 노드 UI 실험 프로젝트입니다.

## 프로젝트 개요

Dify의 워크플로우 노드 UI를 React Flow v12를 사용하여 재구현한 실험적 프로젝트입니다. Dify의 실제 소스 코드를 참조하여 아이콘 시스템, 테마, 스타일을 최대한 유사하게 구현했습니다.

## 기술 스택

- **프레임워크**: Vite + React 19 + TypeScript
- **노드 그래프**: @xyflow/react v12.9.2
- **상태 관리**: Zustand v5
- **스타일링**: Tailwind CSS v4.1.16
- **아이콘**: @remixicon/react v4.7.0
- **유틸리티**: clsx

## 구현된 기능

### 노드 타입 (3개)
- **Start 노드**: 워크플로우 시작점
- **LLM 노드**: LLM 모델 설정 및 프롬프트 입력
- **End 노드**: 워크플로우 종료점

### 주요 기능
- ✅ Dify 스타일 아이콘 시스템 (JSON 기반)
- ✅ Dify 테마 색상 시스템 (CSS Variables)
- ✅ 노드 실행 상태 표시 (running, succeeded, failed, waiting)
- ✅ 커스텀 엣지 스타일 (상태별 색상)
- ✅ 얇은 세로 막대 스타일 핸들
- ✅ Remix Icon 상태 아이콘

## 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 빌드
```bash
npm run build
```

## 프로젝트 구조

```
src/
├── components/
│   └── icons/
│       ├── IconBase.tsx           # JSON → React SVG 변환 엔진
│       └── workflow/               # Dify 워크플로우 아이콘
│           ├── Home.tsx            # Start 노드 아이콘
│           ├── Llm.tsx             # LLM 노드 아이콘
│           └── Answer.tsx          # End 노드 아이콘
├── workflow/
│   ├── nodes/
│   │   ├── _base/
│   │   │   ├── node.tsx           # BaseNode 래퍼 컴포넌트
│   │   │   ├── block-icon.tsx     # 노드 아이콘 매핑
│   │   │   └── node-handle.tsx    # 연결 핸들 컴포넌트
│   │   ├── start/
│   │   │   └── node.tsx           # Start 노드
│   │   ├── llm/
│   │   │   └── node.tsx           # LLM 노드
│   │   ├── end/
│   │   │   └── node.tsx           # End 노드
│   │   └── index.tsx              # CustomNode 매핑
│   ├── custom-edge.tsx            # 커스텀 엣지
│   ├── types.ts                   # 타입 정의
│   └── index.tsx                  # Workflow 메인 컴포넌트
├── index.css                      # Tailwind + 테마 + 타이포그래피
├── App.tsx                        # 샘플 데이터
└── main.tsx                       # 엔트리 포인트

ref/
└── themes/
    └── light.css                  # Dify 라이트 테마 CSS 변수

claudedocs/
├── workflow-node-ui-architecture.md  # Dify UI 아키텍처 문서
└── workflow-node-icons.md            # 아이콘 시스템 문서
```

## 스타일링 시스템

### Dify 테마 색상
Dify의 실제 `light.css`를 사용하며, Tailwind v4의 `@theme` 지시어로 주요 색상을 정의합니다:

```css
@theme {
  --color-workflow-block-bg: #fcfcfd;
  --color-text-primary: #101828;
  --color-state-accent-solid: #2E90FA;
  /* ... */
}
```

### 타이포그래피 클래스
```css
.system-sm-semibold-uppercase  /* 노드 타이틀 */
.system-xs-regular             /* 일반 텍스트 */
.system-xs-medium              /* 중간 강조 텍스트 */
.system-2xs-regular-uppercase  /* 라벨 텍스트 */
```

### 노드 스타일
- 폭: 240px (고정)
- 테두리 반경: 15px
- Shadow: xs, lg (호버)
- 상태별 테두리: accent(실행중), success(성공), destructive(실패)

## 아이콘 시스템

Dify의 JSON 기반 아이콘 시스템을 사용합니다:

```typescript
// AbstractNode 구조
{
  type: 'element',
  name: 'svg',
  attributes: { width: '24', height: '24', ... },
  children: [...]
}
```

`IconBase` 컴포넌트가 재귀적으로 React 엘리먼트로 변환합니다.

## 노드 데이터 구조

```typescript
interface NodeData {
  type: BlockEnum         // 노드 타입 (start, llm, end)
  title: string          // 노드 제목
  desc?: string          // 설명
  _runningStatus?: NodeRunningStatus  // 실행 상태
  _dimmed?: boolean      // 비활성화 여부

  // LLM 노드 전용
  model?: { provider: string; name: string }
  prompt?: string
}
```

## 샘플 사용법

```typescript
const nodes: WorkflowNode[] = [
  {
    id: "1",
    type: "custom",
    position: { x: 100, y: 150 },
    data: {
      type: BlockEnum.Start,
      title: "Start",
      desc: "워크플로우 시작점",
    },
  },
  // ...
]

<Workflow initialNodes={nodes} initialEdges={edges} />
```

## 주의사항

### Tailwind v4 설정
- `tailwind.config.ts`는 **무시됨**
- CSS 파일의 `@theme { }` 지시어만 인식
- 커스텀 색상은 `--color-*` 네임스페이스 필수

### HTML 테마 속성
`index.html`에 `data-theme="light"` 속성이 **필수**입니다:
```html
<html lang="en" data-theme="light">
```

### SVG 속성 경고
콘솔에 `fill-rule` → `fillRule` 경고가 표시되지만, Dify 원본 코드와 동일하며 렌더링에 영향 없음.

## 향후 개선 사항

- [ ] 더 많은 노드 타입 추가 (IfElse, Code, HttpRequest 등)
- [ ] 노드 설정 패널 구현
- [ ] 실행 상태 시뮬레이션 기능
- [ ] 노드 검증 및 에러 표시
- [ ] 다크 테마 지원
- [ ] 드래그 앤 드롭으로 노드 추가

## 참고 자료

- [React Flow 공식 문서](https://reactflow.dev)
- [Tailwind CSS v4 문서](https://tailwindcss.com)
- [Dify GitHub](https://github.com/langgenius/dify)

## 라이선스

실험 목적의 프로젝트입니다. Dify의 UI 디자인 및 아이콘은 원저작자의 저작권을 따릅니다.
