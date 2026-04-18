"use client"

import { useCallback, useRef, useEffect } from "react"

// Sound effect types
type SoundType = "negative" | "positive" | "alert" | "notification" | "achievement"

// Generate sounds using Web Audio API
export function useSoundEffects(enabled: boolean = true) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    // Create AudioContext lazily (needs user interaction first)
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playSound = useCallback((type: SoundType) => {
    if (!enabled) return

    try {
      const ctx = getAudioContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      switch (type) {
        case "negative":
          // Low warning tone
          oscillator.type = "sawtooth"
          oscillator.frequency.setValueAtTime(150, ctx.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2)
          gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.3)
          break

        case "positive":
          // Happy chime
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(523, ctx.currentTime) // C5
          oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1) // E5
          oscillator.frequency.setValueAtTime(784, ctx.currentTime + 0.2) // G5
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.4)
          break

        case "alert":
          // Urgent alert
          oscillator.type = "square"
          oscillator.frequency.setValueAtTime(440, ctx.currentTime)
          oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.1)
          oscillator.frequency.setValueAtTime(440, ctx.currentTime + 0.2)
          oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.3)
          gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.5)
          break

        case "notification":
          // Soft notification
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(880, ctx.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
          gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
          oscillator.start(ctx.currentTime)
          oscillator.stop(ctx.currentTime + 0.2)
          break

        case "achievement":
          // Victory fanfare
          oscillator.type = "triangle"
          const notes = [523, 659, 784, 1047] // C5, E5, G5, C6
          notes.forEach((freq, i) => {
            const noteOsc = ctx.createOscillator()
            const noteGain = ctx.createGain()
            noteOsc.type = "triangle"
            noteOsc.connect(noteGain)
            noteGain.connect(ctx.destination)
            noteOsc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15)
            noteGain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.15)
            noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3)
            noteOsc.start(ctx.currentTime + i * 0.15)
            noteOsc.stop(ctx.currentTime + i * 0.15 + 0.3)
          })
          // Don't play the main oscillator for achievement
          return
      }
    } catch (error) {
      // Audio API might not be available
      console.log("Audio not available")
    }
  }, [enabled, getAudioContext])

  return { playSound }
}
