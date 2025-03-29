
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to check if screen is mobile size
    const checkIfMobile = () => {
      const isMobileView = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(isMobileView)
      if (!isInitialized) {
        setIsInitialized(true)
      }
    }

    // Check immediately on mount
    checkIfMobile()

    // Set up media query listener for changes
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleChange = () => checkIfMobile()
    
    // Modern API (addEventListener)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } 
    // Legacy API (addListener) for older browsers
    else if ('addListener' in mediaQuery) {
      // @ts-ignore - for older browsers
      mediaQuery.addListener(handleChange)
    }

    // Also listen to resize events as a fallback
    window.addEventListener('resize', handleChange)

    // Cleanup function
    return () => {
      // Modern API
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } 
      // Legacy API
      else if ('removeListener' in mediaQuery) {
        // @ts-ignore - for older browsers
        mediaQuery.removeListener(handleChange)
      }
      
      window.removeEventListener('resize', handleChange)
    }
  }, [isInitialized])

  // Only return fully initialized state
  return isMobile
}
