import { useCallback, useEffect, useState } from 'react'

export type RouteId = 'login' | 'dashboard' | 'patients' | 'alerts' | 'analytics' | 'reports' | 'settings'
const ROUTES: RouteId[] = ['login', 'dashboard', 'patients', 'alerts', 'analytics', 'reports', 'settings']

function parse(): RouteId {
  const id = window.location.hash.replace(/^#\/?/, '').split('/')[0] as RouteId
  return ROUTES.includes(id) ? id : 'login'
}

export function navigate(route: RouteId) {
  window.location.hash = `#/${route}`
}

export function useRoute(): RouteId {
  const [route, setRoute] = useState<RouteId>(parse)
  useEffect(() => {
    const onChange = () => setRoute(parse())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export function useNavigate() {
  return useCallback((r: RouteId) => navigate(r), [])
}
