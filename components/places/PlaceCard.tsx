'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import { Users, Clock } from 'lucide-react';

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    number: string;
    capacity: number;
    price_per_hour: number;
    description: string | null;
    facilities: string[] | null;
    status: 'available' | 'reserved' | 'occupied' | 'maintenance';
    image_url: string | null;
    place_categories: {
      name: string;
    } | null;
  };
  index?: number;
}

const statusConfig = {
  available: {
    label: 'Tersedia',
    color: 'bg-green-100 text-green-800',
    dotColor: 'bg-green-500',
  },
  reserved: {
    label: 'Direservasi',
    color: 'bg-yellow-100 text-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  occupied: {
    label: 'Terisi',
    color: 'bg-red-100 text-red-800',
    dotColor: 'bg-red-500',
  },
  maintenance: {
    label: 'Maintenance',
    color: 'bg-gray-100 text-gray-800',
    dotColor: 'bg-gray-500',
  },
};

export function PlaceCard({ place, index = 0 }: PlaceCardProps) {
  const status = statusConfig[place.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link href={`/places/${place.id}`}>
        <div className="group relative overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-xl">
          {/* Image */}
          <div className="relative h-48 w-full overflow-hidden bg-gray-200">
            {place.image_url ? (
              <img
                src={place.image_url}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
                <span className="text-4xl font-bold text-primary-600">
                  {place.number}
                </span>
              </div>
            )}

            {/* Status Badge */}
            <div className="absolute right-3 top-3">
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}
              >
                <span className={`h-2 w-2 rounded-full ${status.dotColor}`} />
                {status.label}
              </span>
            </div>

            {/* Category Badge */}
            {place.place_categories && (
              <div className="absolute left-3 top-3">
                <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
                  {place.place_categories.name}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  {place.name}
                </h3>
                <p className="text-sm text-gray-500">Nomor: {place.number}</p>
              </div>
            </div>

            {place.description && (
              <p className="mb-3 line-clamp-2 text-sm text-gray-600">
                {place.description}
              </p>
            )}

            {/* Info */}
            <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{place.capacity} orang</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatCurrency(place.price_per_hour)}/jam</span>
              </div>
            </div>

            {/* Facilities */}
            {place.facilities && place.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {place.facilities.slice(0, 3).map((facility) => (
                  <span
                    key={facility}
                    className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                  >
                    {facility}
                  </span>
                ))}
                {place.facilities.length > 3 && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    +{place.facilities.length - 3} lainnya
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Hover Effect */}
          <div className="absolute inset-0 border-2 border-transparent transition-colors group-hover:border-primary-500 rounded-xl pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}