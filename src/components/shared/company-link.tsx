'use client'

import Link from 'next/link'
import { withCompanyParam } from '@/lib/url-utils'
import type { LinkProps } from 'next/link'

/**
 * company 파라미터를 자동으로 추가하는 Link 컴포넌트
 */
export function CompanyLink({ href, ...props }: LinkProps & { href: string }) {
  const hrefWithCompany = withCompanyParam(href)
  return <Link href={hrefWithCompany} {...props} />
}
