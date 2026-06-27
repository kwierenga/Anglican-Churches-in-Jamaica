// Central place for site-wide contribution settings.
// NOTE: this address is shown publicly via mailto links on church pages
// (photo + history contribution prompts). Change it if you'd rather route
// contributions elsewhere.
export const CONTRIBUTE_EMAIL = 'klaaswierenga@gmail.com'

export function contributeMailto(churchName: string, kind: 'photo' | 'history'): string {
  const subject = kind === 'photo'
    ? `Photo contribution — ${churchName}`
    : `History / correction — ${churchName}`
  const body = kind === 'photo'
    ? `I have a photograph of ${churchName} to contribute.\n\n(Please attach your image, and include where/when it was taken and how you'd like to be credited.)`
    : `I have additional history or a correction for ${churchName}.\n\n`
  return `mailto:${CONTRIBUTE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
