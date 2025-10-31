import { Workflow } from "./workflow";
import {
  BlockEnum,
  type WorkflowNode,
  type WorkflowEdge,
} from "./workflow/types";

// 샘플 노드 데이터
const initialNodes: WorkflowNode[] = [
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
  {
    id: "2",
    type: "custom",
    position: { x: 400, y: 150 },
    data: {
      type: BlockEnum.LLM,
      title: "LLM 모델",
      desc: "GPT를 사용한 텍스트 생성",
      model: {
        provider: "OpenAI",
        name: "GPT-4",
      },
      prompt: "사용자 질문에 답변을 생성합니다.",
    },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 700, y: 150 },
    data: {
      type: BlockEnum.End,
      title: "End",
      desc: "워크플로우 종료",
    },
  },
];

// 샘플 엣지 데이터
const initialEdges: WorkflowEdge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "custom",
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "custom",
  },
];

function App() {
  return (
    <div className="w-screen h-screen">
      <Workflow initialNodes={initialNodes} initialEdges={initialEdges} />
    </div>
  );
}

export default App;
