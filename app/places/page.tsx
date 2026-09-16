import { getPlaces, getPlaceCategories } from '@/lib/places/queries';
import { PlaceCard } from '@/components/places/PlaceCard';
import { Search } from 'lucide-react';

export default async function PlacesPage() {
  const places = await getPlaces();
  const categories = await getPlaceCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Temukan Tempat Anda
          </h1>
          <p className="text-gray-600">
            Pilih dari {places.length} tempat yang tersedia
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Categories Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button className="rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white">
                Semua
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Places Grid */}
        {places.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {places.map((place, index) => (
              <PlaceCard key={place.id} place={place} index={index} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada tempat ditemukan
            </h3>
            <p className="text-gray-600">
              Belum ada tempat yang tersedia saat ini
            </p>
          </div>
        )}
      </div>
    </div>
  );
}