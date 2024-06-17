import ExcalidrawWrapper from "@/components/ExcalidrawWrapper";
import TextContainer from "@/components/TextContainer";
import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { useEffect, useState } from "react";


export default function Home() {
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [textContainers, setTextContainers] = useState<readonly { id: string; x: number; y: number; text: string }[]>([]);

  const getSelectedElements = (elements: readonly ExcalidrawElement[], selectedIds: string[]): readonly ExcalidrawElement[] => {
    return elements.filter((element) => selectedIds.includes(element.id));
  };

  const onTextContainerDeleteCallback = (id: string) => {
    console.log("Delete clicked")
    setTextContainers(textContainers.filter((container) => container.id !== id));
  }

  const selectionToGraph = () => {
    const tempNodes = [];
    const tempEdges = [];
    for (const element of getSelectedElements(elements, selectedIds)) {
      if (element.type === "arrow") {
        let text = "";
        if (element.boundElements) {
          const boundIds = element.boundElements.map((boundElement) => boundElement.id);
          text = elements.filter((element) => boundIds.includes(element.id)).map((element) => element.text).join("\n");
        }

        const startId = element.startBinding?.elementId || "";
        const endId = element.endBinding?.elementId || "";
        // need to check if the edge already exists
        // or handle it differently because excalidraw allows multiple edges between the same nodes
        const edge = { id: `edge-${Date.now()}`, source: startId, target: endId, text: text };
        tempEdges.push(edge);
      }
      else if (element.type === "text") {
        const node = { id: element.id, text: element.text };
        tempNodes.push(node);
      }
      else {
        console.log(`Element type: ${element.type}`);
        let text = "";
        if (element.boundElements) {
          const boundIds = element.boundElements.map((boundElement) => boundElement.id);
          text = elements.filter((element) => boundIds.includes(element.id)).map((element) => element.text).join("\n");
        }
        const node = { id: element.id, text: text };
        console.log(`Node: ${node.text}`);
        tempNodes.push(node);
      }
    }
    return { nodes: tempNodes, edges: tempEdges };
  }

  const graphToMarkdown = ({
    nodes,
    edges
  }) => {
    return markdown;
  };

  const onButtonClick = () => {
    // create a new TextContainer element
    const graph = selectionToGraph();
    let prompt = ""
    if (graph.edges.length === 0) {
      prompt = graph.nodes.map(node => node.text).join("\n");
    }
    else {
      prompt = graphToMarkdown(graph);
    }
    console.log(prompt);

    const container = {
      id: `text-container-${Date.now()}`, // Generate a unique ID for each TextContainer
      x: Math.random() * window.innerWidth, // Position relative to the screen width
      y: Math.random() * window.innerHeight, // Position relative to the screen height
      text: prompt
    };

    setTextContainers([...textContainers, container]);
  };

  return (
    <main className="flex flex-row h-screen w-screen">
      {textContainers.map(container => (
        <div key={container.id} style={{ zIndex: 10 }}>
          <TextContainer id={container.id} x={container.x} y={container.y} text={container.text} onDeleteCallback={onTextContainerDeleteCallback} />
        </div>
      ))}
      <div className="flex flex-col h-full w-1/6">
        <button onClick={onButtonClick}>Create TextContainer</button>
      </div>
      <div className="flex flex-col h-full w-5/6 bg-gray-200 relative">
        <ExcalidrawWrapper onElementsChangeCallback={setElements} onSelectionChangeCallback={setSelectedIds} />
      </div>
    </main>
  );
}
