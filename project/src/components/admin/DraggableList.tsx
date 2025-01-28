import React from 'react';
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
import { SortableSection } from './SortableSection';

interface Props<T> {
  items: T[];
  onOrderChange: (newOrder: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
}

export function DraggableList<T extends { _id: string }>({ 
  items, 
  onOrderChange, 
  renderItem 
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Add a small threshold before dragging starts
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item._id === active.id);
      const newIndex = items.findIndex(item => item._id === over.id);
      
      const newOrder = arrayMove(items, oldIndex, newIndex);
      onOrderChange(newOrder);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(item => item._id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {items.map((item) => (
            <SortableSection key={item._id} id={item._id}>
              {renderItem(item)}
            </SortableSection>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
