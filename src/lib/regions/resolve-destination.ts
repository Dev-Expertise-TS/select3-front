import { createClient } from '@/lib/supabase/server'

export type ResolvedDestination =
  | {
      kind: 'city'
      label: string
      queryText: string
      city_code?: string | null
      country_code?: string | null
      country_label?: string | null
    }
  | {
      kind: 'country' | 'area' | 'unknown'
      label: string
      queryText: string
      country_code?: string | null
      country_label?: string | null
    }

type RegionRowLoose = Record<string, unknown>

function pickFirstString(obj: RegionRowLoose, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k]
    if (typeof v === 'string' && v.trim()) return v.trim()
  }
  return null
}

function isMissingColumnError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const message = (err as { message?: unknown }).message
  return typeof message === 'string' && message.toLowerCase().includes('column') && message.toLowerCase().includes('does not exist')
}

async function safeMaybeSingle(
  destination: string,
  build: (supabase: Awaited<ReturnType<typeof createClient>>) => any
): Promise<RegionRowLoose | null> {
  try {
    const supabase = await createClient()
    const result = await build(supabase)
    if (result?.error) {
      if (isMissingColumnError(result.error)) return null
      // destination 해석 실패는 정상 케이스일 수 있어 error를 삼킨다
      return null
    }
    return (result?.data as RegionRowLoose | null) ?? null
  } catch {
    return null
  }
}

/**
 * /{destination}/... 라우트의 destination 문자열을 select_regions 기반으로 해석합니다.
 * - city_slug 우선
 * - 없으면 (가능한 경우) country_slug / area_slug / city_ko / city_en / country_ko / country_en / area_ko / area_en 순서로 시도
 * - 테이블에 컬럼이 없으면 안전하게 skip
 */
export async function resolveDestination(destinationRaw: string): Promise<ResolvedDestination> {
  const decoded = decodeURIComponent(destinationRaw).trim()
  const destination = decoded

  // 1) city_slug (도시)
  const byCitySlug = await safeMaybeSingle(destination, (supabase) =>
    supabase
      .from('select_regions')
      .select('*')
      .eq('city_slug', destination)
      .eq('status', 'active')
      .maybeSingle()
  )
  if (byCitySlug) {
    const cityLabel = pickFirstString(byCitySlug, ['city_ko', 'city_en', 'city', 'city_name']) ?? destination
    const countryLabel = pickFirstString(byCitySlug, ['country_ko', 'country_en', 'country', 'country_name'])
    const queryText = [cityLabel, countryLabel].filter(Boolean).join(', ')
    return {
      kind: 'city',
      label: cityLabel,
      queryText: queryText || cityLabel,
      city_code: (byCitySlug['city_code'] as string | null | undefined) ?? null,
      country_code: (byCitySlug['country_code'] as string | null | undefined) ?? null,
      country_label: countryLabel ?? null,
    }
  }

  // 2) country_slug (국가) - 컬럼이 없을 수 있음
  const byCountrySlug = await safeMaybeSingle(destination, (supabase) =>
    supabase
      .from('select_regions')
      .select('*')
      .eq('country_slug', destination)
      .eq('status', 'active')
      .maybeSingle()
  )
  if (byCountrySlug) {
    const countryLabel = pickFirstString(byCountrySlug, ['country_ko', 'country_en', 'country', 'country_name']) ?? destination
    return {
      kind: 'country',
      label: countryLabel,
      queryText: countryLabel,
      country_code: (byCountrySlug['country_code'] as string | null | undefined) ?? null,
      country_label: countryLabel,
    }
  }

  // 3) area_slug (지역) - 컬럼이 없을 수 있음
  const byAreaSlug = await safeMaybeSingle(destination, (supabase) =>
    supabase
      .from('select_regions')
      .select('*')
      .eq('area_slug', destination)
      .eq('status', 'active')
      .maybeSingle()
  )
  if (byAreaSlug) {
    const areaLabel = pickFirstString(byAreaSlug, ['area_ko', 'area_en', 'area', 'area_name']) ?? destination
    const countryLabel = pickFirstString(byAreaSlug, ['country_ko', 'country_en', 'country', 'country_name'])
    const queryText = [areaLabel, countryLabel].filter(Boolean).join(', ')
    return {
      kind: 'area',
      label: areaLabel,
      queryText: queryText || areaLabel,
      country_code: (byAreaSlug['country_code'] as string | null | undefined) ?? null,
      country_label: countryLabel ?? null,
    }
  }

  // 4) 값 자체가 city/country/area 이름인 경우 (eq)
  const tryEqColumns: Array<{ kind: 'city' | 'country' | 'area'; col: string; labelKeys: string[]; countryKeys: string[] }> = [
    { kind: 'city', col: 'city_ko', labelKeys: ['city_ko'], countryKeys: ['country_ko', 'country_en'] },
    { kind: 'city', col: 'city_en', labelKeys: ['city_en'], countryKeys: ['country_ko', 'country_en'] },
    { kind: 'country', col: 'country_ko', labelKeys: ['country_ko'], countryKeys: ['country_ko'] },
    { kind: 'country', col: 'country_en', labelKeys: ['country_en'], countryKeys: ['country_en'] },
    { kind: 'area', col: 'area_ko', labelKeys: ['area_ko'], countryKeys: ['country_ko', 'country_en'] },
    { kind: 'area', col: 'area_en', labelKeys: ['area_en'], countryKeys: ['country_ko', 'country_en'] },
  ]

  for (const t of tryEqColumns) {
    const row = await safeMaybeSingle(destination, (supabase) =>
      supabase.from('select_regions').select('*').eq(t.col, destination).eq('status', 'active').maybeSingle()
    )
    if (!row) continue

    const label = pickFirstString(row, t.labelKeys) ?? destination
    const countryLabel = pickFirstString(row, t.countryKeys)
    const queryText = [label, countryLabel].filter(Boolean).join(', ')

    if (t.kind === 'city') {
      return {
        kind: 'city',
        label,
        queryText: queryText || label,
        city_code: (row['city_code'] as string | null | undefined) ?? null,
        country_code: (row['country_code'] as string | null | undefined) ?? null,
        country_label: countryLabel ?? null,
      }
    }

    return {
      kind: t.kind,
      label,
      queryText: queryText || label,
      country_code: (row['country_code'] as string | null | undefined) ?? null,
      country_label: countryLabel ?? null,
    }
  }

  return { kind: 'unknown', label: destination, queryText: destination }
}


