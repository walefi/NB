import { useEffect } from 'react'

export function useScrollToTop(...deps: unknown[]): void {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
