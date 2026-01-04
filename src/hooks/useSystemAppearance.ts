import { useState, useEffect } from 'react'

const useSystemAppearance = () => {
    const [systemAppearance, setSystemAppearance] = useState<'light' | 'dark'>(() => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    })

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemAppearance(e.matches ? 'dark' : 'light')
        }

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange)
        } else {
            ;(mediaQuery as any).addListener(handleChange)
        }

        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', handleChange)
            } else {
                ;(mediaQuery as any).removeListener(handleChange)
            }
        }
    }, [])

    return systemAppearance
}

export default useSystemAppearance
