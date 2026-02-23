'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SDGIcon, SDG_DATA } from '@/components/sdg-icons'

const sdgOptions = [
  { id: '1', title: 'No Poverty', color: 'bg-red-500' },
  { id: '2', title: 'Zero Hunger', color: 'bg-yellow-500' },
  { id: '3', title: 'Good Health', color: 'bg-green-500' },
  { id: '4', title: 'Quality Education', color: 'bg-red-600' },
  { id: '5', title: 'Gender Equality', color: 'bg-orange-500' },
  { id: '6', title: 'Clean Water', color: 'bg-blue-400' },
  { id: '7', title: 'Clean Energy', color: 'bg-yellow-600' },
  { id: '8', title: 'Economic Growth', color: 'bg-red-700' },
  { id: '9', title: 'Innovation', color: 'bg-orange-600' },
  { id: '10', title: 'Reduced Inequalities', color: 'bg-pink-500' },
  { id: '11', title: 'Sustainable Cities', color: 'bg-yellow-700' },
  { id: '12', title: 'Responsible Consumption', color: 'bg-green-600' },
  { id: '13', title: 'Climate Action', color: 'bg-green-700' },
  { id: '14', title: 'Life Below Water', color: 'bg-blue-500' },
  { id: '15', title: 'Life on Land', color: 'bg-green-800' },
  { id: '16', title: 'Peace & Justice', color: 'bg-blue-600' },
  { id: '17', title: 'Partnerships', color: 'bg-blue-800' },
]

interface SdgAlignmentSectionProps {
  selectedSDGs: string[]
  onSDGToggle: (sdgId: string) => void
}

export function SdgAlignmentSection({
  selectedSDGs,
  onSDGToggle,
}: SdgAlignmentSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SDG Alignment *</CardTitle>
        <CardDescription>Which UN Sustainable Development Goals does this resource support?</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {sdgOptions.map((sdg) => {
            const isSelected = selectedSDGs.includes(sdg.id)
            const sdgNumber = parseInt(sdg.id)
            const sdgData = SDG_DATA[sdgNumber]

            return (
              <div
                key={sdg.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => onSDGToggle(sdg.id)}
              >
                <div className={`relative transition-all ${
                  isSelected
                    ? 'ring-4 ring-purple-500 ring-offset-2 rounded-lg shadow-lg scale-105'
                    : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}>
                  <SDGIcon
                    number={sdgNumber}
                    size="md"
                    showTitle={false}
                    className="w-16 h-16 object-cover rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                  />
                </div>
                <p className="text-xs text-gray-600 text-center mt-1 leading-tight">
                  {sdgData?.title || sdg.title}
                </p>
              </div>
            )
          })}
        </div>
        {selectedSDGs.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Selected SDGs ({selectedSDGs.length}):</p>
            <div className="flex flex-wrap gap-2">
              {selectedSDGs.map(sdgId => {
                const sdg = sdgOptions.find(s => s.id === sdgId)
                return sdg ? (
                  <Badge key={sdgId} variant="secondary" className="text-xs">
                    SDG {sdg.id}: {sdg.title}
                  </Badge>
                ) : null
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
