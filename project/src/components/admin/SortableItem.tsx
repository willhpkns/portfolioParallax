import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props {
  id: string;
  children: React.ReactNode;
  handle?: React.ReactElement;
}

export function SortableItem({ id, children, handle }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: id,
    animateLayoutChanges: () => false
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'transform 120ms cubic-bezier(0.25, 1, 0.5, 1)',
    position: 'relative',
    zIndex: isDragging ? 999 : 'auto',
    touchAction: 'none',
    opacity: isDragging ? 0.8 : 1
  } as const;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex gap-2 items-start w-full group touch-none will-change-transform ${isDragging ? 'shadow-lg bg-white/50 backdrop-blur-sm rounded-lg' : ''}`}
    >
      {handle && (
        <div 
          className="flex items-center cursor-grab" 
          {...listeners} 
          {...attributes}
        >
          {handle}
        </div>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
