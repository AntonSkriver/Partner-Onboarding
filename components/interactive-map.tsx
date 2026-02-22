'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { motion, AnimatePresence } from 'framer-motion'
import { X, School, Users, GraduationCap, Target, TrendingUp, MapPin, Globe, ZoomIn, ZoomOut } from 'lucide-react'

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
    activeStudents?: number // Students currently engaged in projects
    studentAgeRange?: string // e.g., "12-18"
    educators: number
    projects?: string[] // Project names this school is involved in
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

export function InteractiveMap({ countries, onCountrySelect }: InteractiveMapProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [mapControls, setMapControls] = useState<{ zoomIn: () => void; zoomOut: () => void; resetView: () => void } | null>(null)
  const [mounted, setMounted] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const markerLayerRef = useRef<L.LayerGroup | null>(null)
  const schoolLayerRef = useRef<L.LayerGroup | null>(null)
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapId = useMemo(() => `leaflet-map-${Math.random().toString(36).slice(2)}`, [])

  // Mount flag to avoid SSR/strict-mode double render issues
  useEffect(() => {
    setMounted(true)
    return () => {
      if (mapRef.current) {
        const container = mapRef.current.getContainer() as (HTMLElement & { _leaflet_id?: string | null }) | null
        mapRef.current.remove()
        mapRef.current = null
        if (container && container._leaflet_id) {
          container._leaflet_id = null
        }
      }
    }
  }, [])

  // Initialize Leaflet map imperatively to avoid react-leaflet double-init issues
  useEffect(() => {
    if (!mounted || mapRef.current || !mapContainerRef.current) return

    // If the container is already stamped, clear it so we can re-init safely
    const container = mapContainerRef.current as (HTMLDivElement & { _leaflet_id?: string | null })
    if (container._leaflet_id) {
      container._leaflet_id = null
    }
    container.innerHTML = ''
    const targetContainer = container

    const map = L.map(targetContainer, {
      center: [54, 10],
      zoom: 4,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      dragging: true,
      boxZoom: true,
      touchZoom: true,
      keyboard: true,
    })

    mapRef.current = map

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    // Set controls for external buttons
    setMapControls({
      zoomIn: () => map.zoomIn(),
      zoomOut: () => map.zoomOut(),
      resetView: () => map.flyTo([54, 10], 4, { duration: 1.2 }),
    })

    // Cursor affordance
    const mapDom = map.getContainer()
    if (mapDom) {
      mapDom.style.cursor = 'grab'
      map.on('dragstart', () => {
        mapDom.style.cursor = 'grabbing'
      })
      map.on('dragend', () => {
        mapDom.style.cursor = 'grab'
      })
    }

    return () => {
      map.off()
      markerLayerRef.current?.clearLayers()
      schoolLayerRef.current?.clearLayers()
      const container = map.getContainer() as (HTMLElement & { _leaflet_id?: string | null }) | null
      try {
        const mapContainerId = (map as unknown as { _containerId?: number })._containerId
        if (container && mapContainerId && container._leaflet_id !== String(mapContainerId)) {
          container._leaflet_id = String(mapContainerId)
        }
        map.remove()
      } catch (err) {
        if (container) {
          container._leaflet_id = null
          container.innerHTML = ''
        }
      }
      mapRef.current = null
      markerLayerRef.current = null
      schoolLayerRef.current = null
    }
  }, [mounted])

  // Update country markers when data changes
  // Note: mapControls is included as a dependency because it's set after map initialization,
  // ensuring this effect re-runs once the map is ready
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapControls) return

    // Clear old markers
    markerLayerRef.current?.remove()
    const layer = L.layerGroup()

    countries.forEach((country) => {
      const marker = L.marker(country.coordinates, {
        icon: createCustomIcon(
          (function scoreToColor(score: number) {
            if (score >= 4) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            if (score >= 3) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
            return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          })(country.engagementScore),
          (function studentsToSize(students: number): 'sm' | 'md' | 'lg' {
            if (students >= 3000) return 'lg'
            if (students >= 1000) return 'md'
            return 'sm'
          })(country.metrics.students)
        ),
      })
      marker.on('click', () => {
        setSelectedCountry(country)
        onCountrySelect?.(country)
      })
      marker.bindPopup(
        `<div style="text-align:center;">
          <div style="font-weight:600;">${country.flag} ${country.name}</div>
          <div style="font-size:12px;color:#4b5563;margin-top:4px;">${country.metrics.students.toLocaleString()} students</div>
          <div style="font-size:11px;color:#6b7280;">${country.metrics.schools} schools · ${country.metrics.educators} educators</div>
        </div>`
      )
      layer.addLayer(marker)
    })

    layer.addTo(map)
    markerLayerRef.current = layer
  }, [countries, onCountrySelect, mapControls])

  // Fly map when selection changes and render school markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    if (selectedCountry) {
      map.flyTo(selectedCountry.coordinates, 6, { duration: 1.2 })
    } else {
      map.flyTo([54, 10], 4, { duration: 1.2 })
    }

    // Schools
    schoolLayerRef.current?.remove()
    const schoolLayer = L.layerGroup()
    if (selectedCountry) {
      selectedCountry.schools.forEach((school) => {
        if (!school.coordinates) return
        const marker = L.marker(school.coordinates, {
          icon: L.divIcon({
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
          }),
        })
        marker.bindPopup(
          `<div style="font-size:12px;">
            <div style="font-weight:600;">${school.name}</div>
            <div style="color:#6b7280;">${school.city}</div>
            <div style="margin-top:4px;color:#374151;">${school.students} students${school.activeStudents ? ` (${school.activeStudents} active)` : ''} · ${school.educators} educators</div>
            ${school.studentAgeRange ? `<div style="color:#6b7280;margin-top:2px;">Ages: ${school.studentAgeRange}</div>` : ''}
            ${school.projects && school.projects.length > 0 ? `<div style="margin-top:4px;color:#8b5cf6;font-size:11px;">Projects: ${school.projects.join(', ')}</div>` : ''}
          </div>`
        )
        schoolLayer.addLayer(marker)
      })
    }
    schoolLayer.addTo(map)
    schoolLayerRef.current = schoolLayer
  }, [selectedCountry])

  const handleClosePanel = () => {
    setSelectedCountry(null)
    onCountrySelect?.(null)
  }

  return (
    <div className="relative h-full w-full">
      {/* Map Container */}
      <div className="h-full w-full rounded-xl border border-gray-200 shadow-lg" style={{ overflow: 'clip' }}>
        <div
          id={mapId}
          ref={mapContainerRef}
          className="h-full w-full"
          style={{ minHeight: 300 }}
        />
      </div>

      {/* Country Detail Panel */}
      <AnimatePresence>
        {selectedCountry && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden flex flex-col z-[1000]"
          >
            {/* Header - Fixed */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white flex-shrink-0">
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
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">+{Math.round(selectedCountry.growthRate * 100)}%</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-300">★</span>
                  <span className="font-medium">{selectedCountry.engagementScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
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
                <div className="px-4 pb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Active Regions</h4>
                  <div className="space-y-2">
                    {selectedCountry.regions.map((region, idx) => {
                      // Distribute students approximately across regions for visualization
                      const regionStudents = Math.round(selectedCountry.metrics.students / selectedCountry.regions.length)
                      const percent = Math.round((regionStudents / selectedCountry.metrics.students) * 100)
                      return (
                        <div key={region} className="bg-gray-50 rounded-lg p-2.5">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-purple-500" />
                              <span className="text-sm font-medium text-gray-700">{region}</span>
                            </div>
                            <span className="text-xs text-gray-500">~{regionStudents.toLocaleString()} students</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-purple-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.5, delay: idx * 0.1 }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Schools List */}
              <div className="px-4 pb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Schools ({selectedCountry.schools.length})</h4>
                <div className="space-y-2">
                  {selectedCountry.schools.map((school, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                          <School className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{school.name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{school.city}</span>
                            {school.studentAgeRange && (
                              <span className="ml-1 text-purple-500">· Ages {school.studentAgeRange}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-blue-600">{school.students.toLocaleString()}</p>
                          {school.activeStudents && (
                            <p className="text-xs text-emerald-600">{school.activeStudents} active</p>
                          )}
                          <p className="text-xs text-gray-400">{school.educators} educators</p>
                        </div>
                      </div>
                      {school.projects && school.projects.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {school.projects.map((project, pIdx) => (
                            <span key={pIdx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">
                              {project}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls - Top Left */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-[1000]">
        {/* World View / Reset Button */}
        <button
          onClick={() => {
            handleClosePanel()
            mapControls?.resetView()
          }}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          title="Return to world view"
        >
          <Globe className="h-4 w-4 text-purple-600" />
          <span className="text-xs font-medium text-gray-700">World View</span>
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => mapControls?.zoomIn()}
            className="p-2 hover:bg-gray-100 transition-colors border-b border-gray-200"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => mapControls?.zoomOut()}
            className="p-2 hover:bg-gray-100 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Breadcrumb Navigation - Top Center */}
      {selectedCountry && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]"
        >
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
            <button
              onClick={() => {
                handleClosePanel()
                mapControls?.resetView()
              }}
              className="text-xs text-gray-500 hover:text-purple-600 transition-colors"
            >
              World
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
              {selectedCountry.flag} {selectedCountry.name}
            </span>
          </div>
        </motion.div>
      )}

      {/* Legend - Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 z-[1000]">
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
        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Marker Size</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-500">&lt;1k</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-500">1-3k</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span className="text-xs text-gray-500">3k+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
