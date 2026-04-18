"use client"

import { motion, AnimatePresence } from "framer-motion"

interface ScreenEffectsProps {
  isLowSentiment: boolean
  isCritical: boolean  // sentiment < 20
  showFlash?: boolean  // triggered on new negative comment
}

export function ScreenEffects({ isLowSentiment, isCritical, showFlash }: ScreenEffectsProps) {
  return (
    <>
      {/* Red border glow when sentiment is low */}
      <AnimatePresence>
        {isLowSentiment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {/* Red vignette effect */}
            <div 
              className="absolute inset-0"
              style={{
                boxShadow: isCritical 
                  ? "inset 0 0 150px rgba(239, 68, 68, 0.4), inset 0 0 300px rgba(239, 68, 68, 0.2)"
                  : "inset 0 0 100px rgba(239, 68, 68, 0.2), inset 0 0 200px rgba(239, 68, 68, 0.1)"
              }}
            />

            {/* Pulsing border when critical */}
            {isCritical && (
              <motion.div
                animate={{
                  boxShadow: [
                    "inset 0 0 0 0 rgba(239, 68, 68, 0)",
                    "inset 0 0 0 4px rgba(239, 68, 68, 0.6)",
                    "inset 0 0 0 0 rgba(239, 68, 68, 0)",
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flash effect on new negative comment */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-red-500/30 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Screen shake effect using CSS variable */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        .shake-screen {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </>
  )
}

// Hook to trigger screen shake
export function useScreenShake() {
  const triggerShake = () => {
    document.body.classList.add("shake-screen")
    setTimeout(() => {
      document.body.classList.remove("shake-screen")
    }, 500)
  }

  return { triggerShake }
}
