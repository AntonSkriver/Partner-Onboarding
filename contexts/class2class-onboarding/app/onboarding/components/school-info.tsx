"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProfileForm, type SchoolType } from "../context/profile-form-context"
import { Search, Plus } from "lucide-react"

interface SchoolInfoProps {
  onNext: () => void
  onPrevious: () => void
  onGoToStep: (step: number) => void
}

// Mock database of schools
const schoolsDatabase = [
  {
    id: 1,
    name: "Washington High School",
    type: "public",
    country: "United States",
    region: "California",
    city: "San Francisco",
  },
  {
    id: 2,
    name: "St. Mary's Academy",
    type: "private",
    country: "United States",
    region: "New York",
    city: "New York City",
  },
  {
    id: 3,
    name: "Lincoln Elementary",
    type: "public",
    country: "United States",
    region: "Illinois",
    city: "Chicago",
  },
  {
    id: 4,
    name: "Cambridge International School",
    type: "private",
    country: "United Kingdom",
    region: "England",
    city: "London",
  },
  {
    id: 5,
    name: "Colegio Nacional de Buenos Aires",
    type: "public",
    country: "Argentina",
    region: "Buenos Aires",
    city: "Buenos Aires",
  },
  {
    id: 6,
    name: "Beijing No. 4 High School",
    type: "public",
    country: "China",
    region: "Beijing",
    city: "Beijing",
  },
]

// Type definitions for location data
interface LocationData {
  [key: string]: string[]
}

interface CityData {
  [key: string]: string[]
}

// Countries database
const countries = [
  "United States",
  "Canada",
  "Mexico",
  "Brazil",
  "Argentina",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "China",
  "Japan",
  "India",
  "Australia",
  "South Africa",
  "Peru",
  "Colombia",
  "Chile",
  "Ecuador",
  "Venezuela"
] as const

// Regions by country (mock data)
const regionsByCountry: LocationData = {
  "United States": ["California", "New York", "Texas", "Florida", "Illinois", "Washington", "Massachusetts", "Colorado"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "France": ["Île-de-France", "Provence-Alpes-Côte d'Azur", "Normandy", "Brittany", "Occitanie", "Auvergne-Rhône-Alpes"],
  "Argentina": ["Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán", "Salta", "Entre Ríos"],
  "China": ["Beijing", "Shanghai", "Guangdong", "Sichuan", "Jiangsu", "Zhejiang", "Fujian"],
  "Canada": ["Ontario", "Quebec", "British Columbia", "Alberta", "Manitoba", "Saskatchewan"],
  "Mexico": ["Mexico City", "Jalisco", "Nuevo León", "Puebla", "Veracruz", "Michoacán"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Minas Gerais", "Bahia", "Paraná", "Rio Grande do Sul"],
  "Peru": ["Lima", "Arequipa", "Cusco", "La Libertad", "Piura", "Lambayeque"],
  "Colombia": ["Bogotá", "Antioquia", "Valle del Cauca", "Santander", "Cundinamarca", "Atlántico"],
  "Chile": ["Santiago", "Valparaíso", "Biobío", "Maule", "Araucanía", "Los Lagos"],
  "Ecuador": ["Pichincha", "Guayas", "Azuay", "Manabí", "El Oro", "Loja"],
  "Venezuela": ["Distrito Capital", "Zulia", "Miranda", "Carabobo", "Lara", "Aragua"],
  "Japan": ["Tokyo", "Osaka", "Kyoto", "Hokkaido", "Fukuoka", "Aichi"],
  "India": ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "West Bengal"],
  "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania"],
  "South Africa": ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State", "Limpopo"],
  "Germany": ["Berlin", "Bavaria", "North Rhine-Westphalia", "Baden-Württemberg", "Lower Saxony", "Hesse"],
  "Spain": ["Madrid", "Catalonia", "Andalusia", "Valencia", "Galicia", "Basque Country"],
  "Italy": ["Lombardy", "Lazio", "Campania", "Sicily", "Veneto", "Emilia-Romagna"]
}

// Cities by region (mock data)
const citiesByRegion: CityData = {
  "California": ["San Francisco", "Los Angeles", "San Diego", "Sacramento", "San Jose", "Oakland"],
  "New York": ["New York City", "Buffalo", "Rochester", "Syracuse", "Albany", "Yonkers"],
  "Illinois": ["Chicago", "Springfield", "Peoria", "Rockford", "Naperville", "Aurora"],
  "England": ["London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Bristol"],
  "Buenos Aires": ["Buenos Aires", "La Plata", "Mar del Plata", "Quilmes", "Bahía Blanca", "Tandil"],
  "Beijing": ["Beijing", "Tongzhou", "Changping", "Daxing", "Shunyi", "Fangshan"],
  "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London"],
  "Mexico City": ["Mexico City", "Iztapalapa", "Gustavo A. Madero", "Álvaro Obregón", "Coyoacán", "Cuauhtémoc"],
  "São Paulo": ["São Paulo", "Guarulhos", "Campinas", "São Bernardo do Campo", "Santo André", "Osasco"],
  "Lima": ["Lima", "Callao", "Ate", "Comas", "San Juan de Lurigancho", "Villa El Salvador"],
  "Bogotá": ["Bogotá", "Soacha", "Bosa", "Kennedy", "Suba", "Engativá"],
  "Santiago": ["Santiago", "Puente Alto", "Maipú", "La Florida", "Las Condes", "Ñuñoa"],
  "Pichincha": ["Quito", "Sangolquí", "Cumbayá", "Tumbaco", "Machachi", "Calderón"],
  "Distrito Capital": ["Caracas", "Petare", "Baruta", "Chacao", "El Hatillo", "Sucre"],
  "Tokyo": ["Tokyo", "Shinjuku", "Shibuya", "Chiyoda", "Minato", "Toshima"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"],
  "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Central Coast", "Parramatta", "Liverpool"],
  "Gauteng": ["Johannesburg", "Pretoria", "Vereeniging", "Krugersdorp", "Randburg", "Roodepoort"],
  "Berlin": ["Berlin", "Charlottenburg", "Kreuzberg", "Prenzlauer Berg", "Friedrichshain", "Mitte"],
  "Madrid": ["Madrid", "Alcalá de Henares", "Getafe", "Leganés", "Alcorcón", "Móstoles"],
  "Lombardy": ["Milan", "Brescia", "Monza", "Bergamo", "Como", "Varese"],
  "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso"],
  "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "Tallahassee"],
  "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Everett"],
  "Massachusetts": ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton"],
  "Colorado": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood", "Thornton"],
  "Scotland": ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Stirling"],
  "Wales": ["Cardiff", "Swansea", "Newport", "Bangor", "Aberystwyth", "Wrexham"],
  "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Armagh", "Coleraine"],
  "Île-de-France": ["Paris", "Versailles", "Saint-Denis", "Boulogne-Billancourt", "Nanterre", "Créteil"],
  "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon", "Cannes"],
  "Normandy": ["Rouen", "Le Havre", "Caen", "Cherbourg", "Évreux", "Dieppe"],
  "Brittany": ["Rennes", "Brest", "Quimper", "Lorient", "Vannes", "Saint-Malo"],
  "Córdoba": ["Córdoba", "Río Cuarto", "Villa María", "San Francisco", "Villa Carlos Paz", "Alta Gracia"],
  "Santa Fe": ["Rosario", "Santa Fe", "Rafaela", "Venado Tuerto", "Santo Tomé", "Villa Gobernador Gálvez"],
  "Mendoza": ["Mendoza", "San Rafael", "Godoy Cruz", "Las Heras", "Luján de Cuyo", "Maipú"],
  "Shanghai": ["Shanghai", "Pudong", "Huangpu", "Xuhui", "Changning", "Jing'an"],
  "Guangdong": ["Guangzhou", "Shenzhen", "Dongguan", "Foshan", "Zhongshan", "Huizhou"],
  "Sichuan": ["Chengdu", "Mianyang", "Deyang", "Yibin", "Zigong", "Leshan"],
  "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke"],
  "British Columbia": ["Vancouver", "Victoria", "Surrey", "Burnaby", "Richmond", "Kelowna"],
  "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "St. Albert", "Medicine Hat"],
  "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta", "Tepatitlán"],
  "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca", "Santa Catarina", "San Pedro Garza García"],
  "Puebla": ["Puebla", "Tehuacán", "San Martín Texmelucan", "Atlixco", "San Pedro Cholula", "Cuautlancingo"],
  "Rio de Janeiro": ["Rio de Janeiro", "Niterói", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "São João de Meriti"],
  "Minas Gerais": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros"],
  "Bahia": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna", "Juazeiro"],
  "Arequipa": ["Arequipa", "Camaná", "Mollendo", "Chivay", "Chala", "Majes"],
  "Cusco": ["Cusco", "Quillabamba", "Sicuani", "Urubamba", "Calca", "Pisac"],
  "La Libertad": ["Trujillo", "Chiclayo", "Pacasmayo", "Chepén", "Guadalupe", "Virú"],
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Rionegro", "Apartadó"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "San Gil"],
  "Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio", "Quillota"],
  "Biobío": ["Concepción", "Talcahuano", "Chillán", "Los Ángeles", "Coronel", "Lota"],
  "Maule": ["Talca", "Curicó", "Linares", "Constitución", "Cauquenes", "Molina"],
  "Guayas": ["Guayaquil", "Daule", "Samborondón", "Durán", "Milagro", "Nobol"],
  "Azuay": ["Cuenca", "Gualaceo", "Paute", "Sigsig", "Santa Isabel", "Girón"],
  "Manabí": ["Portoviejo", "Manta", "Chone", "Jipijapa", "Montecristi", "Pedernales"],
  "Zulia": ["Maracaibo", "Cabimas", "Ciudad Ojeda", "Santa Rita", "Machiques", "La Villa del Rosario"],
  "Miranda": ["Los Teques", "Petare", "Guarenas", "Guatire", "Santa Teresa", "Ocumare del Tuy"],
  "Carabobo": ["Valencia", "Puerto Cabello", "Guacara", "Mariara", "San Diego", "Los Guayos"],
  "Osaka": ["Osaka", "Sakai", "Higashiosaka", "Hirakata", "Toyonaka", "Suita"],
  "Kyoto": ["Kyoto", "Uji", "Kameoka", "Yawata", "Muko", "Nagaokakyo"],
  "Hokkaido": ["Sapporo", "Hakodate", "Asahikawa", "Kushiro", "Obihiro", "Tomakomai"],
  "Delhi": ["New Delhi", "Delhi", "Noida", "Gurgaon", "Faridabad", "Ghaziabad"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum", "Gulbarga"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli"],
  "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Warrnambool"],
  "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns", "Toowoomba"],
  "Western Australia": ["Perth", "Mandurah", "Bunbury", "Geraldton", "Kalgoorlie", "Albany"],
  "Western Cape": ["Cape Town", "Stellenbosch", "Paarl", "Worcester", "George", "Knysna"],
  "KwaZulu-Natal": ["Durban", "Pietermaritzburg", "Newcastle", "Richards Bay", "Ladysmith", "Pinetown"],
  "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Würzburg", "Ingolstadt"],
  "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum"],
  "Catalonia": ["Barcelona", "L'Hospitalet de Llobregat", "Terrassa", "Badalona", "Sabadell", "Lleida"],
  "Andalusia": ["Seville", "Malaga", "Córdoba", "Granada", "Jerez de la Frontera", "Almería"],
  "Lazio": ["Rome", "Latina", "Guidonia Montecelio", "Aprilia", "Fiumicino", "Viterbo"],
  "Campania": ["Naples", "Salerno", "Torre del Greco", "Giugliano in Campania", "Casoria", "Castellammare di Stabia"]
}

export function SchoolInfo({ onNext, onPrevious, onGoToStep: _onGoToStep }: SchoolInfoProps) {
  const { formData, updateFormData, isStepComplete } = useProfileForm()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<typeof schoolsDatabase>([])
  const [showResults, setShowResults] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [availableRegions, setAvailableRegions] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const searchResultsRef = useRef<HTMLDivElement>(null)
  const [selectedFromDatabase, setSelectedFromDatabase] = useState(false)
  const [showLocationFields, setShowLocationFields] = useState(false)

  // Update available regions when country changes
  useEffect(() => {
    if (formData.location?.country && regionsByCountry[formData.location.country]) {
      setAvailableRegions(regionsByCountry[formData.location.country] || [])
    } else {
      setAvailableRegions([])
    }
  }, [formData.location?.country])

  // Update available cities when region changes
  useEffect(() => {
    if (formData.location?.region && citiesByRegion[formData.location.region]) {
      setAvailableCities(citiesByRegion[formData.location.region] || [])
    } else {
      setAvailableCities([])
    }
  }, [formData.location?.region])

  // Search for schools when search term changes
  useEffect(() => {
    if (searchTerm.length > 2) {
      const results = schoolsDatabase.filter((school) => school.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setSearchResults(results)
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [searchTerm])

  // Close search results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSchoolTypeChange = (value: string) => {
    updateFormData({ schoolType: value as SchoolType })
    setShowLocationFields(true)
  }

  const handleLocationChange = (field: "country" | "region" | "city", value: string) => {
    // Create a new location object to avoid mutation issues
    const newLocation = {
      ...(formData.location || { country: "", region: "", city: "" }),
    }

    // Update the specified field
    newLocation[field] = value

    // Reset dependent fields
    if (field === "country") {
      newLocation.region = ""
      newLocation.city = ""
    } else if (field === "region") {
      newLocation.city = ""
    }

    // Update the form data
    updateFormData({ location: newLocation })
  }

  const handleSchoolSelect = (school: (typeof schoolsDatabase)[0]) => {
    // Update all form fields with the selected school's data
    updateFormData({
      schoolName: school.name,
      schoolType: school.type as SchoolType,
      location: {
        country: school.country,
        region: school.region,
        city: school.city,
      },
    })

    setShowResults(false)
    setSearchTerm("")
    setIsAddingNew(false)
    setSelectedFromDatabase(true) // Set flag when school is selected from database
  }

  const handleAddNewSchool = () => {
    setIsAddingNew(true)
    setShowResults(false)
    setSelectedFromDatabase(false) // Clear flag when adding a new school
    // Clear form fields for new entry but keep the search term as the school name
    updateFormData({
      schoolName: searchTerm,
      schoolType: null,
      location: {
        country: "",
        region: "",
        city: "",
      },
    })
  }

  return (
    <div className="space-y-6 pt-16 sm:pt-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Tell us about your educational institution</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2 relative">
          <Label htmlFor="school-search">Search for your school</Label>

          {!selectedFromDatabase ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="school-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for your school"
                className="pl-10 h-12 text-base"
                onFocus={() => searchTerm.length > 2 && setShowResults(true)}
                inputMode="search"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
              />
            </div>
          ) : (
            <div className="p-3 border rounded-md bg-gray-50">
              <div className="font-medium text-base">{formData.schoolName}</div>
              <div className="text-sm text-gray-500">
                {formData.location?.city}, {formData.location?.region}, {formData.location?.country}
              </div>
              <Button
                variant="link"
                className="p-0 h-auto text-sm mt-1 text-primary touch-manipulation"
                onClick={() => {
                  setSelectedFromDatabase(false)
                  setSearchTerm("")
                  setIsAddingNew(false)
                }}
              >
                Change school
              </Button>
            </div>
          )}

          {/* Search results dropdown */}
          {showResults && searchResults.length > 0 && (
            <div
              ref={searchResultsRef}
              className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-[60vh] overflow-auto overscroll-contain"
            >
              {searchResults.map((school) => (
                <div
                  key={school.id}
                  className="p-4 hover:bg-gray-100 active:bg-gray-200 cursor-pointer border-b border-gray-100 last:border-0 touch-manipulation"
                  onClick={() => handleSchoolSelect(school)}
                >
                  <div className="font-medium text-base">{school.name}</div>
                  <div className="text-sm text-gray-500">
                    {school.city}, {school.region}, {school.country}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results found */}
          {showResults && searchTerm.length > 2 && searchResults.length === 0 && (
            <div
              ref={searchResultsRef}
              className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center overscroll-contain"
            >
              <p className="text-gray-600 mb-3 text-base">No schools found with that name.</p>
              <Button 
                variant="outline" 
                className="w-full bg-[#8157D9] hover:bg-[#8157D9]/90 text-white hover:text-white h-12 text-base touch-manipulation whitespace-nowrap overflow-hidden text-ellipsis px-4" 
                onClick={handleAddNewSchool}
              >
                <Plus className="mr-2 h-5 w-5 flex-shrink-0" />
                <span className="truncate">Add &quot;{searchTerm}&quot; as a new school</span>
              </Button>
            </div>
          )}
        </div>

        {/* Only show Type and Location fields if adding new school or no school selected */}
        {(isAddingNew || (formData.schoolName && !selectedFromDatabase)) && (
          <>
            <div className="space-y-2">
              <Label>Type</Label>
              <RadioGroup
                value={formData.schoolType || ""}
                onValueChange={handleSchoolTypeChange}
                className="grid grid-cols-2 gap-3"
              >
                <Label
                  htmlFor="public"
                  className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.schoolType === "public" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="public" id="public" className="sr-only" />
                  <div className="text-center">
                    <h3 className="font-medium">Public</h3>
                    <p className="text-xs text-muted-foreground">Government-funded institution</p>
                  </div>
                </Label>
                <Label
                  htmlFor="private"
                  className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.schoolType === "private" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="private" id="private" className="sr-only" />
                  <div className="text-center">
                    <h3 className="font-medium">Private</h3>
                    <p className="text-xs text-muted-foreground">Independently funded institution</p>
                  </div>
                </Label>
              </RadioGroup>
            </div>

            {showLocationFields && (
              <div className="space-y-4">
                <Label className="text-base">Location</Label>

                <div className="space-y-2">
                  <Select
                    value={formData.location?.country || ""}
                    onValueChange={(value) => handleLocationChange("country", value)}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((countryName) => (
                        <SelectItem key={countryName} value={countryName} className="text-base">
                          {countryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Select
                    value={formData.location?.region || ""}
                    onValueChange={(value) => handleLocationChange("region", value)}
                    disabled={!formData.location?.country || availableRegions.length === 0}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select State/Province/Region" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRegions.map((regionName) => (
                        <SelectItem key={regionName} value={regionName} className="text-base">
                          {regionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Select
                    value={formData.location?.city || ""}
                    onValueChange={(value) => handleLocationChange("city", value)}
                    disabled={!formData.location?.region || availableCities.length === 0}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((cityName) => (
                        <SelectItem key={cityName} value={cityName} className="text-base">
                          {cityName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" onClick={onPrevious} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          className="flex-1 bg-[#8157D9] hover:bg-[#8157D9]/90 text-white"
          disabled={!isStepComplete(3)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}

