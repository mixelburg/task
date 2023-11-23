import { FC, memo, useEffect, useState } from 'react'
import { deltaToComponents } from "../../utils/time";

interface IProps {
  start: Date
  short?: boolean
  updateInterval?: number
}


const ElapsedCounter: FC<IProps> = memo((props) => {
  const [elapsedPoint, setElapsedPoint] = useState<number>(+Date.now())
  const short = props.short || false
  const updateInterval = props.updateInterval || 1000

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedPoint(+Date.now())
    }, updateInterval)
    return () => {
      clearInterval(interval)
    }
  }, [])

  const roundToInterval = (milliseconds: number) => Math.round(milliseconds / updateInterval) * updateInterval

  const elapsedTime = +elapsedPoint - +props.start;
  const roundedElapsedTime = roundToInterval(elapsedTime);

  return <>
    {deltaToComponents(roundedElapsedTime, short)}
  </>
})

export default ElapsedCounter
