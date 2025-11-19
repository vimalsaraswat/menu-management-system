"use client";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { api } from "~/trpc/react";
import AddCategoryDialog from "./add-category-dialog";
import DishCard from "./dish-card";
import DishDialog from "./dish-dialog";
import type { Dish } from "~/types";
import { toast } from "sonner";

interface DishLink {
  dish: Dish;
}

interface Category {
  id: string;
  name: string;
  dishLinks: DishLink[];
}

function SortableCategory({
  category,
  restaurantId,
}: {
  category: Category;
  restaurantId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`mb-8 rounded-xl bg-white shadow-lg ${isDragging ? "z-50" : ""}`}
    >
      <div className="flex items-center justify-between border-b p-6">
        <div className="flex items-center gap-4">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none active:cursor-grabbing"
          >
            <GripVertical className="h-6 w-6 text-gray-400" />
          </button>
          <h3 className="text-2xl font-bold">{category.name}</h3>
          <span className="text-gray-500">
            ({category.dishLinks?.length} items)
          </span>
        </div>
        <DishDialog restaurantId={restaurantId} categoryId={category.id} />
      </div>
      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
        {category.dishLinks?.map(({ dish }) => (
          <DishCard
            key={dish.id}
            dish={dish}
            categoryId={category.id}
            restaurantId={restaurantId}
          />
        ))}
      </div>
    </div>
  );
}

export default function CategoryList({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const utils = api.useUtils();
  const { data: categories = [] } = api.category.list.useQuery(restaurantId);
  const updateCategoryOrder = api.category.updateOrder.useMutation({
    onSuccess: async () => {
      await utils.category.list.invalidate(restaurantId);
    },
    onError: async (error) => {
      toast.error(error.message);
      await utils.category.list.invalidate(restaurantId);
      console.error("Failed to update category order:", error);
    },
  });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const newOrder = arrayMove(categories, oldIndex, newIndex);
    utils.category.list.setData(restaurantId, newOrder);
    updateCategoryOrder.mutate({
      restaurantId,
      orders: newOrder.map((c) => c.id),
    });
  };
  const categoryIds = categories.map((c) => c.id);
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-bold">Menu Categories</h2>
        <AddCategoryDialog restaurantId={restaurantId} />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categoryIds}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((category) => (
            <SortableCategory
              key={category.id}
              category={category as Category}
              restaurantId={restaurantId}
            />
          ))}
        </SortableContext>
      </DndContext>
      {categories.length === 0 && (
        <p className="text-center text-gray-500">
          No categories yet. Create one!
        </p>
      )}
    </div>
  );
}
