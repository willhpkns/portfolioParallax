import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableSection } from '../admin/SortableSection';
import type { ResumeSectionType } from '../../services/api';
import { settingsApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Props {
  sections: ResumeSectionType[];
  onOrderChange: (newOrder: ResumeSectionType[]) => void;
  children: (section: ResumeSectionType) => React.ReactNode;
}

export function DraggableSections({ sections, onOrderChange, children }: Props) {
  const [items, setItems] = useState<ResumeSectionType[]>(sections);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as ResumeSectionType);
        const newIndex = items.indexOf(over.id as ResumeSectionType);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        onOrderChange(newOrder);
        return newOrder;
      });
    }
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {items.map((section) => (
              <SortableSection key={section} id={section}>
                {children(section)}
              </SortableSection>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
