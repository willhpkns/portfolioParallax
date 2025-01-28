import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { ResumeSectionType } from '../../services/api';

interface Props {
  id: ResumeSectionType;
  children: React.ReactNode;
}

export function SortableSection({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="relative bg-white rounded-lg shadow-md">
        <div
          {...attributes}
          {...listeners}
          className="absolute left-4 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
        >
          <GripVertical size={20} />
        </div>
        <div className="pl-12">{children}</div>
      </div>
    </div>
  );
}
