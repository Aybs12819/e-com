import { Users, MapPin, Heart, ShieldCheck } from "lucide-react"

export function MapitaCommunity() {
  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-video overflow-hidden rounded-2xl shadow-xl">
            <img src="/mapita-community-landscape-and-people.jpg" alt="Mapita Community" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-sm font-medium uppercase tracking-widest text-accent">Our Heritage</p>
              <h3 className="text-2xl font-bold">The Heart of Aguilar, Pangasinan</h3>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              About Mapita Community
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Preserving Tradition, <span className="text-primary">Empowering People</span>
            </h2>
            <p className="text-lg leading-relaxed text-gray-600">
              LinkHabi is more than just a marketplace; it is a bridge connecting the rich cultural heritage of the
              Mapita Community in Aguilar, Pangasinan to the world. Our platform empowers local artisans by providing a
              sustainable ecosystem for their traditional handloom weaving and unique local delicacies.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Aguilar Based</h4>
                  <p className="text-sm text-gray-500">Rooted in the highlands of Aguilar, Pangasinan.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Community Driven</h4>
                  <p className="text-sm text-gray-500">Directly supporting Mapita families and weavers.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Authentic Heritage</h4>
                  <p className="text-sm text-gray-500">100% genuine handmade woven products.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Quality Assured</h4>
                  <p className="text-sm text-gray-500">Each piece is meticulously crafted with care.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
