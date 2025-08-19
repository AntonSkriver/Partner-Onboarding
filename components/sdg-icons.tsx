'use client'

// Official UN SDG Colors and Data
export const SDG_DATA = {
  1: { title: 'No Poverty', color: '#E5243B' },
  2: { title: 'Zero Hunger', color: '#DDA63A' },
  3: { title: 'Good Health and Well-being', color: '#4C9F38' },
  4: { title: 'Quality Education', color: '#C5192D' },
  5: { title: 'Gender Equality', color: '#FF3A21' },
  6: { title: 'Clean Water and Sanitation', color: '#26BDE2' },
  7: { title: 'Affordable and Clean Energy', color: '#FCC30B' },
  8: { title: 'Decent Work and Economic Growth', color: '#A21942' },
  9: { title: 'Industry, Innovation and Infrastructure', color: '#FD6925' },
  10: { title: 'Reduced Inequalities', color: '#DD1367' },
  11: { title: 'Sustainable Cities and Communities', color: '#FD9D24' },
  12: { title: 'Responsible Consumption and Production', color: '#BF8B2E' },
  13: { title: 'Climate Action', color: '#3F7E44' },
  14: { title: 'Life Below Water', color: '#0A97D9' },
  15: { title: 'Life on Land', color: '#56C02B' },
  16: { title: 'Peace, Justice and Strong Institutions', color: '#00689D' },
  17: { title: 'Partnerships for the Goals', color: '#19486A' },
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

  return (
    <div className={`text-center ${className}`}>
      <div className={`${sizeClasses[size]} rounded-lg flex items-center justify-center mx-auto mb-3 overflow-hidden shadow-md`}>
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
    17: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxOTQ4NkEiLz48dGV4dCB4PSIxNSIgeT0iMzAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIj4xNzwvdGV4dD48dGV4dCB4PSIxMCIgeT0iNTAiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPlBBUlRORVJTSElQUzwvdGV4dD48dGV4dCB4PSIxOCIgeT0iNjIiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iOCIgZm9udC13ZWlnaHQ9ImJvbGQiPkZPUiBUSEU8L3RleHQ+PHRleHQgeD0iMjYiIHk9Ijc0IiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZvbnQtd2VpZ2h0PSJib2xkIj5HT0FMUzwvdGV4dD48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgzNSw4MCkiPjxjaXJjbGUgY3g9IjAiIGN5PSIwIiByPSI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMCIgcj0iNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiLz48Y2lyY2xlIGN4PSI1IiBjeT0iLTgiIHI9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+PGNpcmNsZSBjeD0iNSIgY3k9IjgiIHI9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+PGNpcmNsZSBjeD0iNSIgY3k9IjAiIHI9IjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41Ii8+PC9nPjwvc3ZnPg=='
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