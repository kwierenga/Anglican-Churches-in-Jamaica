const CLOUDINARY_HOST = 'res.cloudinary.com'

function isCloudinary(url: string): boolean {
  return url.includes(CLOUDINARY_HOST) && url.includes('/upload/')
}

function withTransform(url: string, transform: string): string {
  return isCloudinary(url) ? url.replace('/upload/', `/upload/${transform}/`) : url
}

export function optimized(url: string, transform = 'q_auto,f_auto,w_1200'): string {
  return withTransform(url, transform)
}

interface SrcSetOpts {
  widths?: number[]
  height?: number
  crop?: 'fill' | 'fit' | 'limit'
  extra?: string
}

export function buildSrcSet(url: string, opts: SrcSetOpts = {}): string {
  if (!isCloudinary(url)) return ''
  const { widths = [400, 800, 1200, 1600, 2000], height, crop, extra } = opts
  return widths
    .map(w => {
      const parts: string[] = ['q_auto', 'f_auto', `w_${w}`]
      if (height) {
        parts.push(`h_${height}`)
        parts.push(`c_${crop ?? 'fill'}`)
      } else if (crop) {
        parts.push(`c_${crop}`)
      }
      if (extra) parts.push(extra)
      return `${withTransform(url, parts.join(','))} ${w}w`
    })
    .join(', ')
}

export function responsiveSrc(url: string, width: number, opts: Omit<SrcSetOpts, 'widths'> = {}): string {
  if (!isCloudinary(url)) return url
  const { height, crop, extra } = opts
  const parts: string[] = ['q_auto', 'f_auto', `w_${width}`]
  if (height) {
    parts.push(`h_${height}`)
    parts.push(`c_${crop ?? 'fill'}`)
  } else if (crop) {
    parts.push(`c_${crop}`)
  }
  if (extra) parts.push(extra)
  return withTransform(url, parts.join(','))
}
