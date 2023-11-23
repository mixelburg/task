import { useEffect, useState } from 'react'
import { ElementSize } from '@/app/interfaces/element'

export const useSelectorSize = (selector: string) => {
  const [size, setSize] = useState<ElementSize>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const targetElement = document.querySelector(selector)
    if (!targetElement) {
      console.warn(`Element with selector '${selector}' not found.`)
      return
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width, height })
      }
    })

    resizeObserver.observe(targetElement)

    return () => {
      resizeObserver.unobserve(targetElement)
    }
  }, [selector])

  return size
}
