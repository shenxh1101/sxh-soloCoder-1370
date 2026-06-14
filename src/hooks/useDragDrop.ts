import { useState, useCallback, useRef, DragEvent } from 'react';

interface DragState {
  isDragging: boolean;
  draggedItem: string | null;
  dragPosition: { x: number; y: number };
}

export const useDragDrop = (
  onDrop: (itemId: string, volume: number) => void,
  defaultVolume: number = 20
) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedItem: null,
    dragPosition: { x: 0, y: 0 },
  });

  const [isOver, setIsOver] = useState(false);
  const [dragVolume, setDragVolume] = useState(defaultVolume);
  const dragImageRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback(
    (e: DragEvent<HTMLDivElement>, itemId: string) => {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', itemId);

      setDragState({
        isDragging: true,
        draggedItem: itemId,
        dragPosition: { x: e.clientX, y: e.clientY },
      });

      const dragImage = document.createElement('div');
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-9999px';
      dragImage.style.left = '-9999px';
      dragImage.style.width = '40px';
      dragImage.style.height = '60px';
      dragImage.style.background = 'linear-gradient(to bottom, transparent 30%, #4fc3f7 30%)';
      dragImage.style.borderRadius = '0 0 4px 4px';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 20, 30);
      dragImageRef.current = dragImage;
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedItem: null,
      dragPosition: { x: 0, y: 0 },
    });
    setIsOver(false);
    if (dragImageRef.current) {
      document.body.removeChild(dragImageRef.current);
      dragImageRef.current = null;
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const itemId = e.dataTransfer.getData('text/plain');
      if (itemId) {
        onDrop(itemId, dragVolume);
      }
      setIsOver(false);
      handleDragEnd();
    },
    [onDrop, dragVolume, handleDragEnd]
  );

  const handleClickAdd = useCallback(
    (itemId: string) => {
      onDrop(itemId, dragVolume);
    },
    [onDrop, dragVolume]
  );

  return {
    isDragging: dragState.isDragging,
    draggedItem: dragState.draggedItem,
    isOver,
    dragVolume,
    setDragVolume,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleClickAdd,
  };
};
