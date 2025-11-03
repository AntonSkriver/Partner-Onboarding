type CountryMetadata = {
  code: string
  name: string
  flag: string
}

const COUNTRIES: CountryMetadata[] = [
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'TN', name: 'Tunisia', flag: '🇹🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
] as const

const LOOKUP = new Map<string, CountryMetadata>()

const registerCountry = (country: CountryMetadata) => {
  LOOKUP.set(country.code.toLowerCase(), country)
  LOOKUP.set(country.name.toLowerCase(), country)
}

COUNTRIES.forEach(registerCountry)

const alias = (value: string, code: CountryMetadata['code']) => {
  const country = COUNTRIES.find((entry) => entry.code === code)
  if (country) {
    LOOKUP.set(value.toLowerCase(), country)
  }
}

alias('usa', 'US')
alias('u.s.a.', 'US')
alias('u.s.', 'US')
alias('united states of america', 'US')
alias('america', 'US')
alias('uk', 'GB')
alias('u.k.', 'GB')
alias('great britain', 'GB')

export const getCountryDisplay = (value?: string | null): { flag: string; name: string } => {
  if (!value) {
    return { flag: '🌍', name: 'Global' }
  }

  const normalized = value.trim().toLowerCase()
  const match = LOOKUP.get(normalized)

  if (match) {
    return { flag: match.flag, name: match.name }
  }

  return { flag: '🌍', name: value }
}

