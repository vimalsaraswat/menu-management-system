export default function VegNonVegDot({
  isVegetarian,
}: {
  isVegetarian: boolean;
}) {
  return (
    <div
      className={`mt-1 h-5 w-5 flex-shrink-0 rounded-sm border-2 ${
        isVegetarian ? "border-green-600" : "border-red-600"
      } flex items-center justify-center`}
    >
      <div
        className={`h-2.5 w-2.5 rounded-sm ${
          isVegetarian ? "bg-green-600" : "bg-red-600"
        }`}
      />
    </div>
  );
}
