/** Browser dalam aplikasi Instagram atau TikTok memblokir login Google. */
export function isInAppBrowser(userAgent: string): boolean {
  return /Instagram|musical_ly|BytedanceWebview|TikTok|trill/i.test(userAgent)
}
