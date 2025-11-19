import { api } from "~/trpc/server";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

export default async function DashboardHome() {
  const restaurants = await api.restaurant.list();

  return (
    <div className="mx-auto max-w-7xl p-8">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-4xl font-bold">My Restaurants</h1>
        <Link href="/dashboard/restaurants">
          <Button>
            <Plus className="mr-2 h-5 w-5" />
            Add Restaurant
          </Button>
        </Link>
      </div>

      {restaurants.length === 0 ? (
        <div className="rounded-xl bg-white py-20 text-center shadow">
          <p className="text-lg text-gray-500">
            No restaurants yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <Link key={r.id} href={`/dashboard/restaurants/${r.id}`}>
              <div className="rounded-xl bg-white p-6 shadow transition-shadow hover:shadow-xl">
                <h3 className="text-2xl font-bold">{r.name}</h3>
                <p className="text-gray-600">{r.location}</p>
                <p className="mt-4 text-sm text-gray-500">
                  {r.categories.length} categories •{" "}
                  {/*{r.categories.reduce((acc, c) => acc + c.dishLinks.length, 0)}{" "}*/}
                  dishes
                </p>
                <p className="mt-3 font-medium text-rose-600">/{r.slug}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
