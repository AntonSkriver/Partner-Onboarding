'use client'

// Official UN SDG Colors and Data
export const SDG_DATA: Record<number, { title: string; color: string; description: string }> = {
  1: { title: 'No Poverty', color: '#E5243B', description: 'End poverty in all its forms everywhere' },
  2: { title: 'Zero Hunger', color: '#DDA63A', description: 'End hunger, achieve food security and improved nutrition' },
  3: { title: 'Good Health and Well-being', color: '#4C9F38', description: 'Ensure healthy lives and promote well-being for all' },
  4: { title: 'Quality Education', color: '#C5192D', description: 'Ensure inclusive and equitable quality education' },
  5: { title: 'Gender Equality', color: '#FF3A21', description: 'Achieve gender equality and empower all women and girls' },
  6: { title: 'Clean Water and Sanitation', color: '#26BDE2', description: 'Ensure availability and sustainable management of water' },
  7: { title: 'Affordable and Clean Energy', color: '#FCC30B', description: 'Ensure access to affordable, reliable and sustainable energy' },
  8: { title: 'Decent Work and Economic Growth', color: '#A21942', description: 'Promote sustained, inclusive and sustainable economic growth' },
  9: { title: 'Industry, Innovation and Infrastructure', color: '#FD6925', description: 'Build resilient infrastructure and foster innovation' },
  10: { title: 'Reduced Inequalities', color: '#DD1367', description: 'Reduce inequality within and among countries' },
  11: { title: 'Sustainable Cities and Communities', color: '#FD9D24', description: 'Make cities and communities inclusive, safe and sustainable' },
  12: { title: 'Responsible Consumption and Production', color: '#BF8B2E', description: 'Ensure sustainable consumption and production patterns' },
  13: { title: 'Climate Action', color: '#3F7E44', description: 'Take urgent action to combat climate change' },
  14: { title: 'Life Below Water', color: '#0A97D9', description: 'Conserve and sustainably use the oceans and marine resources' },
  15: { title: 'Life on Land', color: '#56C02B', description: 'Protect, restore and promote sustainable use of terrestrial ecosystems' },
  16: { title: 'Peace, Justice and Strong Institutions', color: '#00689D', description: 'Promote peaceful and inclusive societies for sustainable development' },
  17: { title: 'Partnerships for the Goals', color: '#19486A', description: 'Strengthen the means of implementation and revitalize global partnerships' },
}

interface SDGIconProps {
  number: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showTitle?: boolean
  className?: string
  customTitle?: string
}

const sizeClasses = {
  sm: 'w-12 h-12 text-sm',
  md: 'w-16 h-16 text-base',
  lg: 'w-20 h-20 text-lg',
  xl: 'w-24 h-24 text-xl',
}

export function SDGIcon({ number, size = 'lg', showTitle = true, className = '', customTitle }: SDGIconProps) {
  const sdg = SDG_DATA[number as keyof typeof SDG_DATA]
  
  if (!sdg) return null

  const displayTitle = customTitle || sdg.title
  const imageUrl = getSDGImageUrl(number)
  const iconSpacingClass = showTitle ? 'mb-3' : 'mb-1'

  return (
    <div className={`text-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center mx-auto ${iconSpacingClass} overflow-hidden shadow-md`}>
        <img 
          src={imageUrl}
          alt={`SDG ${number}: ${sdg.title}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to colored box with number if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.style.backgroundColor = sdg.color;
              parent.innerHTML = `<span class="font-bold text-white">${number}</span>`;
            }
          }}
        />
      </div>
      {showTitle && (
        <p className="text-sm text-gray-600 max-w-20 mx-auto leading-tight">{displayTitle}</p>
      )}
    </div>
  )
}

// Official UN SDG image URLs from Wikimedia Commons
function getSDGImageUrl(number: number): string {
  const urls: { [key: number]: string } = {
    1: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Sustainable_Development_Goal_1.png',
    2: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Sustainable_Development_Goal_2.png',
    3: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Sustainable_Development_Goal_3.png',
    4: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Sustainable_Development_Goal_4.png',
    5: 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Sustainable_Development_Goal_5.png',
    6: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Sustainable_Development_Goal_6.png',
    7: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Sustainable_Development_Goal_7.png',
    8: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Sustainable_Development_Goal_8.png',
    9: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Sustainable_Development_Goal_9.png',
    10: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Sustainable_Development_Goal_10.png',
    11: 'https://upload.wikimedia.org/wikipedia/commons/8/81/Sustainable_Development_Goal_11.png',
    12: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Sustainable_Development_Goal_12.png',
    13: 'https://upload.wikimedia.org/wikipedia/commons/7/70/Sustainable_Development_Goal_13.png',
    14: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Sustainable_Development_Goal_14.png',
    15: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Sustainable_Development_Goal_15.png',
    16: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Sustainable_Development_Goal_16.png',
    17: '/sdg/sdg-17.webp'
  }
  return urls[number] || urls[1] // Fallback to SDG 1 if number not found
}

interface SDGIconsGridProps {
  sdgNumbers: number[]
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showTitles?: boolean
  className?: string
  customTitles?: { [key: number]: string }
}

export function SDGIconsGrid({ sdgNumbers, size = 'lg', showTitles = true, className = '', customTitles }: SDGIconsGridProps) {
  return (
    <div className={`flex justify-center items-center space-x-6 ${className}`}>
      {sdgNumbers.map((number) => (
        <SDGIcon 
          key={number} 
          number={number} 
          size={size} 
          showTitle={showTitles}
          customTitle={customTitles?.[number]}
        />
      ))}
    </div>
  )
}
