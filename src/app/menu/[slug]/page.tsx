import MenuClient from "~/components/menu/menu-client";
import { api } from "~/trpc/server";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params)?.slug;
  const restaurant = await api.menu.getBySlug(slug);

  if (!restaurant)
    return <div className="p-8 text-center">Restaurant not found</div>;

  return <MenuClient restaurant={restaurant} />;
}
