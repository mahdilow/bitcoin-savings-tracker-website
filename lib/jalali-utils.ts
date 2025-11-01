// Jalali to Gregorian conversion
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  const jy2 = jm > 6 ? jy + 1 : jy
  let days =
    365 * jy +
    Math.floor((jy2 + 3) / 4) -
    Math.floor((jy2 + 99) / 100) +
    Math.floor((jy2 + 399) / 400) -
    80 +
    jd +
    [0, 31, 62, 93, 124, 155, 186, 216, 246, 276, 306, 336][jm - 1]

  let gy = 400 * Math.floor(days / 146097)
  days %= 146097

  let flag = true
  if (days >= 36525) {
    days--
    gy += 100 * Math.floor(days / 36524)
    days %= 36524
    if (days >= 365) days++
    else flag = false
  }

  gy += 4 * Math.floor(days / 1461)
  days %= 1461

  if (flag) {
    if (days >= 366) {
      days--
      gy += Math.floor(days / 365)
      days %= 365
    }
  }

  const gd = days + 1
  const sal_a = [0, 31, flag && gy % 4 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm = 0
  for (let v = 0; v < 13; v++) {
    if (gd <= sal_a[v]) {
      gm = v
      break
    }
  }

  return { gy, gm, gd: gd - sal_a[gm - 1] }
}

// Gregorian to Jalali conversion
export function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  const gy2 = gm > 2 ? gy + 1 : gy
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1]

  let jy = -1595 + 33 * Math.floor(days / 12053)
  days %= 12053

  jy += 4 * Math.floor(days / 1461)
  days %= 1461

  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }

  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)

  return { jy, jm, jd }
}

// Format Jalali date as string
export function formatJalaliDate(jy: number, jm: number, jd: number): string {
  const monthNames = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ]
  return `${jd} ${monthNames[jm - 1]} ${jy}`
}

// Convert ISO date string to Jalali formatted string
export function isoToJalali(isoDate: string): string {
  const date = new Date(isoDate)
  const gy = date.getFullYear()
  const gm = date.getMonth() + 1
  const gd = date.getDate()
  const { jy, jm, jd } = gregorianToJalali(gy, gm, gd)
  return formatJalaliDate(jy, jm, jd)
}

// Convert Jalali date to ISO string
export function jalaliToIso(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = jalaliToGregorian(jy, jm, jd)
  return new Date(gy, gm - 1, gd).toISOString()
}

// Parse Jalali date input (YYYY/MM/DD format)
export function parseJalaliInput(input: string): { jy: number; jm: number; jd: number } | null {
  const parts = input.split("/").map((p) => Number.parseInt(p.trim()))
  if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
    return null
  }
  return { jy: parts[0], jm: parts[1], jd: parts[2] }
}

// Get current Jalali date
export function getCurrentJalali(): { jy: number; jm: number; jd: number } {
  const now = new Date()
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate())
}

// Format Jalali date for input field (YYYY/MM/DD)
export function formatJalaliInput(jy: number, jm: number, jd: number): string {
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`
}
