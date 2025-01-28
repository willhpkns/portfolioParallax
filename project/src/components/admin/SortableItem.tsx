import React, { cloneElement, isValidElement } from 'react';
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
  } = useSortable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // If a handle is provided, clone it and add the drag listeners
  // Otherwise, the entire item becomes draggable
  const dragHandle = handle && isValidElement(handle)
    ? cloneElement(handle, { ...listeners, ...attributes })
    : null;

  return (
    <div ref={setNodeRef} style={style} className="flex gap-2 items-start w-full group">
      <div className="flex items-center">
        {dragHandle}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
