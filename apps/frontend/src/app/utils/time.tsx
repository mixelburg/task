import React from "react";

/**
 * converts frame to time in MM:SS format
 * @param frame frame number to convert
 * @param fps
 */
export const frameToTime = (frame: number, fps: number) => {
  return `${zeroPadding(Math.floor(frame / fps / 60))}:${zeroPadding(Math.floor((frame / fps) % 60))}:${zeroPadding(
    frame % fps,
  )}`
}

/**
 * converts second to frame number
 * @param sec second number to convert
 * @param fps frames per second
 */
export const secToFrame = (sec: number, fps: number) => {
  return Math.floor(sec * fps)
}

/**
 * padds a number with leading zeros
 * @param num number to pad
 * @param zero number of zeros to pad with
 */
const zeroPadding = (num: number, zero: number = 2) => {
  const str = num.toString()
  const len = str.length
  return len < zero ? `${'0'.repeat(zero - len)}${str}` : str
}

const fullKeys = ['days', 'hours', 'minutes', 'seconds', 'mil']
const shortKeys = ['d', 'h', 'm', 's', 'mil']
const calculators = [
  (delta: number) => Math.floor(delta / (1000 * 60 * 60 * 24)),
  (delta: number) => Math.floor(delta / (1000 * 60 * 60)) % 24,
  (delta: number) => Math.floor(delta / (1000 * 60)) % 60,
  (delta: number) => Math.floor(delta / 1000) % 60,
  (delta: number) => Math.floor(delta % 1000),
]

export const deltaToTime = (delta: number, short: boolean) => {
  const keys = short ? shortKeys : fullKeys
  const time: any = {}
  keys.forEach((key, i) => {
    time[key] = calculators[i](delta)
  })

  if (time.mil < 1000) {
    delete time.mil
  }

  return time
}

export const deltaToComponents = (delta: number, short: boolean, firstN: number = -1) => {
  let time: any = deltaToTime(delta, short)

  let components: React.ReactNode[] = []

  // Find the largest non-zero time component
  let startIndex = Object.values(time).findIndex((value: any) => value > 0)

  Object.keys(time).forEach((key, index) => {
    if (index >= startIndex) {
      let displayValue = (index === startIndex) ? time[key].toString() : zeroPadding(time[key])

      components.push(
        <span key={key}>
            {displayValue}
          <span style={{ color: 'grey' }}>{key}</span>{' '}
          </span>,
      )
    }
  })

  if (firstN > 0) {
    components = components.slice(0, firstN)
  }

  return components
}

export const formatDate = (date: Date | null | undefined) => {
  return date ? date.toLocaleDateString() : ''
}
