import type { SPICE_LEVELS } from "~/lib/constants";

export interface Dish {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
  spiceLevel?: (typeof SPICE_LEVELS)[number];
  isVegetarian: boolean;
}
