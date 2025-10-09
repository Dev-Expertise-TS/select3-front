/**
 * YYYY.MM.DD 포맷으로 날짜 문자열을 반환합니다.
 * 입력은 string | number | Date 만 허용합니다.
 */
export function formatDateDot(input: string | number | Date): string {
  try {
    const date = new Date(input)
    if (isNaN(date.getTime())) return String(input)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}.${m}.${d}`
  } catch {
    return String(input)
  }
}
