import { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import dynamic from "next/dynamic";
import { useState } from "react";
import initialData from "./initialData";

interface ExcalidrawWrapperProps {
  onSelectionChangeCallback?: (selectedElementIds: string[]) => void;
  onElementsChangeCallback?: (elements: readonly ExcalidrawElement[]) => void;
  
}

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  },
);


let prevElements: readonly ExcalidrawElement[] = [];
let prevSelectedElementIds: string[] = [];

const ExcalidrawWrapper = (props: ExcalidrawWrapperProps) => {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);

  // the app state is interesting
  // it even keeps track of if ctrl is pressed or not
  // and thus triggers the onChange event

  const onSelectionChange = () => {
    if (props.onSelectionChangeCallback) {
      props.onSelectionChangeCallback(prevSelectedElementIds);
    }
  }

  const onElementsChange = () => {
    if (props.onElementsChangeCallback) {
      props.onElementsChangeCallback(prevElements);
    }
  }

  const onChangeHandler = (elements: readonly ExcalidrawElement[], state: AppState) => {
    // if the elements are the same, we don't need to do anything
    // console.log(prevSelectedElementIds)
    // console.log(Object.keys(state.selectedElementIds))
    // console.log(prevSelectedElementIds.length === Object.keys(state.selectedElementIds).length)

    // if the ids in the selected elements are the same, we don't need to do anything
    // so lets check if the selectedIds have changed
    if (
      prevSelectedElementIds.length === Object.keys(state.selectedElementIds).length &&
      prevSelectedElementIds.every((id) => state.selectedElementIds[id])
    ) {
      return;
    } else {
      prevSelectedElementIds = Object.keys(state.selectedElementIds);
      onSelectionChange()
    }

    const visibleElements = elements.filter((element) => !element.isDeleted);
    if (visibleElements === prevElements) {
      return;
    } else {
      // remove all elements that have the isDeleted flag set to true
      prevElements = visibleElements;
      onElementsChange()
    }
  }

  return <Excalidraw
    excalidrawAPI={(api) => {
      setExcalidrawAPI(api);
    }}
    initialData={initialData}
    onChange={onChangeHandler}
  />;
}

export default ExcalidrawWrapper