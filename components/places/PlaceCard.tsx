"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Users, Clock } from "lucide-react";

interface PlaceCardProps {
  place: {
    id: string;
    name: string;
    number: string;
    capacity: number;
    price_per_hour: number;
    description: string | null;
    facilities: string[] | null;
    status: "available" | "reserved" | "occupied" | "maintenance";
    image_url: string | null;
    place_categories: {
      name: string;
    } | null;
  };
  index?: number;
}

const statusConfig = {
  available: {
    label: "Tersedia",
    color: "bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-1",
    dotColor: "bg-green-500",
  },
  reserved: {
    label: "Direservasi",
    color: "bg-amber-50 text-amber-700 border border-amber-200 rounded-lg px-2 py-1",
    dotColor: "bg-amber-500",
  },
  occupied: {
    label: "Terisi",
    color: "bg-red-50 text-red-700 border border-red-200 rounded-lg px-2 py-1",
    dotColor: "bg-red-500",
  },
  maintenance: {
    label: "Maintenance",
    color: "bg-gray-50 text-gray-700 border border-gray-200 rounded-lg px-2 py-1",
    dotColor: "bg-gray-500",
  },
};

export function PlaceCard({ place, index = 0 }: PlaceCardProps) {
  const status = statusConfig[place.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Link href={`/places/${place.id}`}>
        <div className="group relative overflow-hidden rounded-lg border-2 border-slate-200 bg-white transition-all hover:border-blue-500 hover:shadow-md">
          <div className="relative h-48 w-full overflow-hidden bg-gray-200">
            {place.image_url ? (
              <img
                src={place.image_url}
                alt={place.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                <span className="text-4xl font-bold text-blue-600">
                  {place.number}
                </span>
              </div>
            )}

            <div className="absolute right-3 top-3">
              <span className={status.color}>
                <span className={`h-2 w-2 rounded-full ${status.dotColor}`} />
                {status.label}
              </span>
            </div>

            {place.place_categories && (
              <div className="absolute left-3 top-3">
                <span className="rounded-lg bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm">
                  {place.place_categories.name}
                </span>
              </div>
            )}
          </div>

          <div className="p-4">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
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

            <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span>{place.capacity} orang</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatCurrency(place.price_per_hour)}/jam</span>
              </div>
            </div>

            {place.facilities && place.facilities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {place.facilities.slice(0, 3).map((facility) => (
                  <span key={facility} className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {facility}
                  </span>
                ))}
                {place.facilities.length > 3 && (
                  <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    +{place.facilities.length - 3} lainnya
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="absolute inset-0 border-2 border-transparent transition-colors group-hover:border-blue-500 rounded-lg pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}
