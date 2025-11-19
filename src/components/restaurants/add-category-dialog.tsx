"use client";
import { useState } from "react";
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
import { Plus } from "lucide-react";
import { toast } from "sonner";

export default function AddCategoryDialog({
  restaurantId,
}: {
  restaurantId: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const utils = api.useUtils();
  const create = api.category.create.useMutation({
    onSuccess: async () => {
      await utils.category.list.invalidate(restaurantId);
      setName("");
      setOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-5 w-5" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({ name, restaurantId });
          }}
          className="space-y-4"
        >
          <Input
            placeholder="e.g., Starters, Desserts, Beverages"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={create.isPending}>
            Create Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
