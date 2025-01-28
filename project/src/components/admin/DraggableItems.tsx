import React, { useEffect } from 'react';
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
import { SortableItem } from './SortableItem';

interface Props<T extends { _id: string; order?: number }> {
  items: T[];
  onOrderChange: (newOrder: T[]) => void;
  renderItem: (item: T) => React.ReactNode;
}

export function DraggableItems<T extends { _id: string; order?: number }>({ 
  items, 
  onOrderChange,
  renderItem 
}: Props<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item._id === active.id);
      const newIndex = items.findIndex(item => item._id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        const updatedItems = newItems.map((item, index) => ({
          ...item,
          order: index
        }));
        onOrderChange(updatedItems as T[]);
      }
    }
  }

  useEffect(() => {
    // Ensure items have order values on initial load
    if (items.some(item => item.order === undefined)) {
      const orderedItems = items.map((item, index) => ({
        ...item,
        order: index
      }));
      onOrderChange(orderedItems as T[]);
    }
  }, [items]);

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
          {[...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((item) => (
            <SortableItem key={item._id} id={item._id}>
              {renderItem(item)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
