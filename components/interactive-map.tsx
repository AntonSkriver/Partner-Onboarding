'use client'

import { useEffect, useLayoutEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion, AnimatePresence } from 'framer-motion'
import { X, School, Users, GraduationCap, Target, TrendingUp, MapPin } from 'lucide-react'

// Fix for default marker icons in webpack - only run once
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

export interface CountryData {
  id: string
  name: string
  flag: string
  coordinates: [number, number] // [lat, lng]
  metrics: {
    students: number
    schools: number
    educators: number
    projects: number
    completedProjects: number
  }
  regions: string[]
  engagementScore: number
  growthRate: number
  schools: {
    name: string
    city: string
    students: number
    educators: number
    coordinates?: [number, number]
  }[]
}

interface InteractiveMapProps {
  countries: CountryData[]
  onCountrySelect?: (country: CountryData | null) => void
}

// Custom marker icon creator
function createCustomIcon(color: string, size: 'sm' | 'md' | 'lg' = 'md') {
  const sizes = { sm: 24, md: 32, lg: 40 }
  const iconSize = sizes[size]

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${iconSize}px;
        height: ${iconSize}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <div style="
          width: ${iconSize * 0.4}px;
          height: ${iconSize * 0.4}px;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
        "></div>
      </div>
    `,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
    popupAnchor: [0, -iconSize / 2],
  })
}

// Component to handle map view changes
function MapController({ selectedCountry }: { selectedCountry: CountryData | null }) {
  const map = useMap()

  useEffect(() => {
    if (selectedCountry) {
      map.flyTo(selectedCountry.coordinates, 6, { duration: 1.5 })
    } else {
      // Reset to show Europe
      map.flyTo([54, 10], 4, { duration: 1.5 })
    }
  }, [selectedCountry, map])

  return null
}

export function InteractiveMap({ countries, onCountrySelect }: InteractiveMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const containerIdRef = useRef(`interactive-map-${Math.random().toString(36).slice(2)}`)

  // Avoid React strict-mode double init and ensure cleanup on hot reload/unmount
  useEffect(() => {
    setMounted(true)
    return () => {
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // If Leaflet has already attached to this DOM node (hot reload / fast refresh),
  // clear the stored id before react-leaflet tries to initialize again.
  useLayoutEffect(() => {
    if (!mounted) return
    const container = L.DomUtil.get(containerIdRef.current) as (HTMLElement & { _leaflet_id?: string | null }) | null
    if (container && container._leaflet_id) {
      container._leaflet_id = null
    }
  }, [mounted])

  const handleCountryClick = (country: CountryData) => {
    setSelectedCountry(country)
    onCountrySelect?.(country)
  }

  const handleClosePanel = () => {
    setSelectedCountry(null)
    onCountrySelect?.(null)
  }

  // Get marker color based on engagement
  const getMarkerColor = (score: number) => {
    if (score >= 4) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    if (score >= 3) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  }

  // Get marker size based on student count
  const getMarkerSize = (students: number): 'sm' | 'md' | 'lg' => {
    if (students >= 3000) return 'lg'
    if (students >= 1000) return 'md'
    return 'sm'
  }

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div className="h-full w-full rounded-xl overflow-hidden border border-gray-200 shadow-lg">
        {!mounted ? null : (
        <MapContainer
          key="interactive-map"
          id={containerIdRef.current}
          center={[54, 10]}
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          whenReady={() => setMapReady(true)}
          whenCreated={(map) => {
            mapInstanceRef.current = map
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <MapController selectedCountry={selectedCountry} />

          {mapReady && countries.map((country) => (
            <Marker
              key={country.id}
              position={country.coordinates}
              icon={createCustomIcon(
                getMarkerColor(country.engagementScore),
                getMarkerSize(country.metrics.students)
              )}
              eventHandlers={{
                click: () => handleCountryClick(country),
              }}
            >
              <Popup>
                <div className="text-center p-1">
                  <span className="text-xl mr-1">{country.flag}</span>
                  <span className="font-semibold">{country.name}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {country.metrics.students.toLocaleString()} students
                  </div>
                  <button
                    onClick={() => handleCountryClick(country)}
                    className="mt-2 text-xs text-purple-600 hover:text-purple-800 font-medium"
                  >
                    View details →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* School markers when country is selected */}
          {selectedCountry && selectedCountry.schools.map((school, idx) => (
            school.coordinates && (
              <Marker
                key={`school-${idx}`}
                position={school.coordinates}
                icon={L.divIcon({
                  className: 'school-marker',
                  html: `
                    <div style="
                      width: 20px;
                      height: 20px;
                      background: #3b82f6;
                      border: 2px solid white;
                      border-radius: 4px;
                      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    "></div>
                  `,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-semibold text-sm">{school.name}</p>
                    <p className="text-xs text-gray-500">{school.city}</p>
                    <div className="flex gap-3 mt-1 text-xs">
                      <span>{school.students} students</span>
                      <span>{school.educators} educators</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
        )}
      </div>

      {/* Country Detail Panel */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedCountry.flag}</span>
                  <h3 className="text-lg font-semibold">{selectedCountry.name}</h3>
                </div>
                <button
                  onClick={handleClosePanel}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  <span>+{Math.round(selectedCountry.growthRate * 100)}% growth</span>
                </div>
                <span className="text-white/60">•</span>
                <div className="flex items-center gap-1 text-sm">
                  <span>★ {selectedCountry.engagementScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <GraduationCap className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-purple-700">{selectedCountry.metrics.students.toLocaleString()}</p>
                  <p className="text-xs text-purple-600">Students</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <School className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-blue-700">{selectedCountry.metrics.schools}</p>
                  <p className="text-xs text-blue-600">Schools</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <Users className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-amber-700">{selectedCountry.metrics.educators}</p>
                  <p className="text-xs text-amber-600">Educators</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 text-center">
                  <Target className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-emerald-700">{selectedCountry.metrics.projects}</p>
                  <p className="text-xs text-emerald-600">Projects</p>
                </div>
              </div>
            </div>

            {/* Regions */}
            {selectedCountry.regions.length > 0 && (
              <div className="px-4 pb-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Regions</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCountry.regions.map((region) => (
                    <span
                      key={region}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Schools List */}
            <div className="px-4 pb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Schools</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedCountry.schools.map((school, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                      <School className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{school.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{school.city}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">{school.students}</p>
                      <p className="text-xs text-gray-400">students</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">Engagement Level</p>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
            <span className="text-xs text-gray-600">High (4+ rating)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600" />
            <span className="text-xs text-gray-600">Medium (3-4 rating)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-red-600" />
            <span className="text-xs text-gray-600">Needs attention</span>
          </div>
        </div>
      </div>
    </div>
  )
}
