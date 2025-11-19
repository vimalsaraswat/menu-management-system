import { api } from "~/trpc/server";
import CategoryList from "~/components/restaurants/category-list";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const restaurantId = (await params).id;
  const restaurant = await api.restaurant.getById(restaurantId);

  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold">{restaurant.name}</h1>
            <p className="text-gray-600">/{restaurant.slug}</p>
          </div>
        </div>
        <Button asChild>
          <a href={`/menu/${restaurant.slug}`} target="_blank">
            View Live Menu →
          </a>
        </Button>
      </div>

      <CategoryList restaurantId={restaurantId} />
    </div>
  );
}
