'use client'

import { motion, useInView, useMotionValue, animate } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface AnimatedCounterProps {
  value: number
  format?: (value: number) => string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  format,
  duration = 1,
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const motionValue = useMotionValue(0)

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: 'easeOut',
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = format
              ? format(latest)
              : Math.round(latest).toLocaleString('id-ID')
          }
        },
      })

      return () => controls.stop()
    }
  }, [inView, value, motionValue, format, duration])

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: inView ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      0
    </motion.span>
  )
}
