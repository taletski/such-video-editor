import React, { useEffect } from "react";

interface IGlobalDragAndDropListenerProps {
  handleDragOverViewport?: (e: DragEvent) => void;
}

const handleGlobalDropAndDragOver = (e: DragEvent) => {
  e.preventDefault();
};

export const GlobalDragAndDropListener: React.FC<IGlobalDragAndDropListenerProps> = ({
  handleDragOverViewport,
}) => {
  useEffect(() => {
    handleDragOverViewport &&
      document.body.addEventListener("dragover", handleDragOverViewport);

    // prevents browser from automatically opening dropped files
    window.addEventListener("dragover", handleGlobalDropAndDragOver);
    window.addEventListener("drop", handleGlobalDropAndDragOver);

    return () => {
      handleDragOverViewport &&
        document.body.removeEventListener("dragover", handleDragOverViewport);

      window.removeEventListener("dragover", handleGlobalDropAndDragOver);
      window.removeEventListener("drop", handleGlobalDropAndDragOver);
    };
  });
  return null;
};
