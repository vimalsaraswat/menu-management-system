"use client";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { api } from "~/trpc/react";
import DishDialog from "./dish-dialog";
import VegNonVegDot from "../menu/veg-nonveg-dot";
import type { Dish } from "~/types";
import { toast } from "sonner";

export default function DishCard({
  dish,
  categoryId,
  restaurantId,
}: {
  dish: Dish;
  categoryId: string;
  restaurantId: string;
}) {
  const utils = api.useUtils();
  const deleteDish = api.dish.delete.useMutation({
    onSuccess: () => utils.category.list.invalidate(),
    onError: (error) => toast.error(error.message),
  });
  return (
    <div className="overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md">
      {dish.imageUrl && (
        <div className="relative h-48">
          <Image
            src={dish.imageUrl}
            alt={dish.name}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <VegNonVegDot isVegetarian={dish.isVegetarian} />
            <div>
              <h4 className="text-lg font-semibold">{dish.name}</h4>
              <p className="text-2xl font-bold text-rose-600">₹{dish.price}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <DishDialog
              dish={dish}
              categoryId={categoryId}
              restaurantId={restaurantId}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteDish.mutate(dish.id)}
              disabled={deleteDish.isPending}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
        {dish.description && (
          <p className="mt-3 line-clamp-2 text-sm text-gray-600">
            {dish.description}
          </p>
        )}
      </div>
    </div>
  );
}
