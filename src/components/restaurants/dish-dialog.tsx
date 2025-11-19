"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Plus, Pencil } from "lucide-react";
import { UploadButton, UploadDropzone } from "../uploadthing";
import { SPICE_LEVELS } from "~/lib/constants";
import type { Dish } from "~/types";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  description: z.string().optional(),
  spiceLevel: z.enum(SPICE_LEVELS).optional(),
  isVegetarian: z.boolean(),
  imageUrl: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function DishDialog({
  dish,
  categoryId,
  restaurantId,
}: {
  dish?: Dish;
  categoryId: string;
  restaurantId: string;
}) {
  const isEdit = !!dish;
  const utils = api.useUtils();
  const create = api.dish.create.useMutation({
    onSuccess: () => utils.category.list.invalidate(),
    onError: (error) => toast.error(error.message),
  });
  const update = api.dish.update.useMutation({
    onSuccess: () => utils.category.list.invalidate(),
    onError: (error) => toast.error(error.message),
  });
  const { register, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: dish ?? { isVegetarian: true, price: 0 },
  });
  const imageUrl = watch("imageUrl");
  const onSubmit = (data: FormData) => {
    if (isEdit) {
      update.mutate({ id: dish.id, ...data });
    } else {
      create.mutate({ ...data, categoryIds: [categoryId], restaurantId });
    }
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "ghost" : "default"}
          size={isEdit ? "sm" : "default"}
        >
          {isEdit ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <>
              <Plus className="mr-1 h-4 w-4" /> Add Dish
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit" : "Add"} Dish</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {!imageUrl ? (
            <UploadDropzone
              config={{
                mode: "auto",
              }}
              endpoint="imageUploader"
              onClientUploadComplete={(res) => {
                setValue("imageUrl", res[0]?.ufsUrl);
                console.log("Files: ", res);
              }}
              onUploadError={(error: Error) => {
                alert(`ERROR! ${error.message}`);
              }}
            />
          ) : (
            <div className="relative">
              <img
                src={imageUrl}
                alt="dish"
                className="h-64 w-full rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setValue("imageUrl", undefined)}
              >
                Remove
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <Input {...register("name")} placeholder="Cappuccino" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Price (₹)
              </label>
              <Input type="number" {...register("price")} placeholder="80" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Description (optional)
            </label>
            <Textarea
              {...register("description")}
              placeholder="Rich espresso with steamed milk..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">
                Spice Level
              </label>
              <Select
                onValueChange={(v) =>
                  setValue("spiceLevel", v as (typeof SPICE_LEVELS)[number])
                }
                defaultValue={dish?.spiceLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mild">Mild</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Spicy">Spicy</SelectItem>
                  <SelectItem value="Very Spicy">Very Spicy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={watch("isVegetarian")}
                onCheckedChange={(checked) => setValue("isVegetarian", checked)}
              />
              <span className="text-sm font-medium">Vegetarian</span>
            </div>
          </div>
          <Button type="submit" className="w-full">
            {isEdit ? "Update" : "Create"} Dish
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
