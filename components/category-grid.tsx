import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    name: "Handloom and Woven",
    image: "/woven-fabric-icon.jpg",
    color: "bg-blue-50",
  },
  {
    name: "Local Food & Delicacies",
    image: "/food-delicacy-icon.jpg",
    color: "bg-orange-50",
  },
  {
    name: "Handmade Accessories",
    image: "/handicraft-icon.jpg",
    color: "bg-emerald-50",
  },
  {
    name: "Home Décor & Souvenirs",
    image: "/home-decor-icon.png",
    color: "bg-purple-50",
  },
]

export function CategoryGrid() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="mb-6 flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">Categories</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <Card
            key={i}
            className="group cursor-pointer border-none shadow-none transition-all hover:translate-y-[-4px]"
          >
            <CardContent className={`flex flex-col items-center justify-center p-6 ${cat.color} rounded-xl border`}>
              <img
                src={cat.image || "/placeholder.svg"}
                alt={cat.name}
                className="h-16 w-16 transition-transform group-hover:scale-110"
              />
              <p className="mt-4 text-center text-sm font-semibold group-hover:text-primary">{cat.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
