"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export default function CreateRestaurant() {
  const router = useRouter();
  const create = api.restaurant.create.useMutation({
    onSuccess: (data) => router.push(`/dashboard/restaurants/${data.id}`),
    onError: (error) => toast.error(error.message),
  });

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <div className="mx-auto max-w-2xl p-8">
      <Card className="p-8">
        <h1 className="mb-8 text-3xl font-bold">Create New Restaurant</h1>
        <form
          onSubmit={handleSubmit((d) => create.mutate(d))}
          className="space-y-6"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Restaurant Name
            </label>
            <Input
              {...register("name")}
              placeholder="Super Restaurant Mumbai"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Location</label>
            <Input
              {...register("location")}
              placeholder="Bandra West, Mumbai"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">URL Slug</label>
            <Input
              {...register("slug")}
              placeholder="super-restaurant-mumbai"
            />
            <p className="mt-1 text-xs text-gray-500">
              Lowercase letters, numbers, hyphens only
            </p>
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            Create Restaurant
          </Button>
        </form>
      </Card>
    </div>
  );
}
