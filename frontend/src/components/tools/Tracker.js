class Tracker {
  constructor () {
    window._paq = window._paq || []

    Tracker.push(['trackPageView'])
    Tracker.push(['enableLinkTracking'])
    Tracker.push(['setTrackerUrl', 'https://analytics.lionskins.co/push'])
    Tracker.push(['setSiteId', '1'])

    return {
      push: this.push,
      track: this.track,
      connectToHistory: this.connectToHistory,
      disconnectFromHistory: this.disconnectFromHistory
    }
  }

  static push (args) {
    window._paq.push(args)
  }

  connectToHistory (history) {
    const prevLoc = history.location
    this.previousPath = prevLoc.path || (prevLoc.pathname + prevLoc.search).replace(/^\//, '')
    this.unlistenFromHistory = history.listen((loc) => {
      this.track(loc)
    })

    return history
  }

  disconnectFromHistory () {
    if (this.unlistenFromHistory) {
      this.unlistenFromHistory()
      return true
    }
    return false
  }

  track (loc) {
    const currentPath = loc.path || (loc.pathname + loc.search).replace(/^\//, '')

    if (this.previousPath === currentPath) {
      return
    }

    if (this.previousPath) {
      Tracker.push(['setReferrerUrl', `${window.location.origin}/${this.previousPath}`])
    }
    Tracker.push(['setCustomUrl', `${window.location.origin}/${currentPath}`])
    Tracker.push(['setGenerationTimeMs', 0])
    Tracker.push(['trackPageView'])
    Tracker.push(['enableLinkTracking'])

    Tracker.previousPath = currentPath
  }
}

export default Tracker
