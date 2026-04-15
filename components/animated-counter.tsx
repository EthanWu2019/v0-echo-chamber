"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AnimatedCounterProps {
  value: number
  className?: string
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isIncreasing, setIsIncreasing] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (value !== prevValue.current) {
      setIsIncreasing(value > prevValue.current)
      setDisplayValue(value)
      prevValue.current = value
    }
  }, [value])

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <span className={`inline-flex overflow-hidden ${className}`}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={displayValue}
          initial={{ y: isIncreasing ? 20 : -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: isIncreasing ? -20 : 20, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30,
            mass: 0.8
          }}
          className="tabular-nums"
        >
          {formatNumber(displayValue)}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
