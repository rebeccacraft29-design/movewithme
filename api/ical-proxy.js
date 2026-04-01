/**
 * Vercel serverless function — proxies iCal feed URLs to avoid CORS errors in the browser.
 * GET /api/ical-proxy?url=<encoded-ical-url>
 */
export default async function handler(req, res) {
  const { url } = req.query

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' })
  }

  // Normalise webcal:// → https://
  const target = url.replace(/^webcal:/i, 'https:')

  // Only allow http(s) to prevent SSRF against internal services
  if (!/^https?:\/\//i.test(target)) {
    return res.status(400).json({ error: 'URL must use http or https scheme' })
  }

  // Block private/loopback ranges
  const blocked = /^https?:\/\/(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i
  if (blocked.test(target)) {
    return res.status(400).json({ error: 'Private URLs are not allowed' })
  }

  try {
    const upstream = await fetch(target, {
      headers: {
        'User-Agent': 'MoveWithMe Calendar Sync/1.0',
        Accept: 'text/calendar, */*',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10_000),
    })

    if (!upstream.ok) {
      return res.status(502).json({ error: `Upstream returned ${upstream.status}` })
    }

    const body = await upstream.text()

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300') // 5-min cache
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).send(body)
  } catch (err) {
    const msg = err.name === 'TimeoutError' ? 'Request timed out' : 'Failed to fetch calendar feed'
    return res.status(502).json({ error: msg })
  }
}
