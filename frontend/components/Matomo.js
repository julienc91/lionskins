import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Script from 'react-load-script'

const push = args => {
  try {
    window._paq.push(args)
  } catch {
    window._paq = window._paq || []
    push(args)
  }
}

const Matomo = () => {
  const router = useRouter()

  const handleRouteChange = path => {
    push(['setCustomUrl', path])
    push(['trackPageView'])
  }

  useEffect(() => {
    push(['trackPageView'])
    push(['enableLinkTracking'])
    push(['setTrackerUrl', 'https://analytics.lionskins.co/push'])
    push(['setSiteId', '1'])

    router.events.on('routeChangeComplete', handleRouteChange)
  }, [])

  return (
    <Script url='https://analytics.lionskins.co/init.js' attributes={{ async: true, defer: true }} />
  )
}

export default Matomo
