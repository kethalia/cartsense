'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

export type CardConfig = {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

type StackedCardsWithTabsProps = {
  cards: CardConfig[]
  activeCardId?: string
  onCardChange?: (id: string) => void
  className?: string
}

const springTransition = { type: 'spring' as const, stiffness: 300, damping: 30 }

export function StackedCardsWithTabs({
  cards,
  activeCardId,
  onCardChange,
  className,
}: StackedCardsWithTabsProps) {
  const [internalActiveId, setInternalActiveId] = React.useState(cards[0]?.id ?? '')
  const activeId = activeCardId ?? internalActiveId

  const handleCardChange = React.useCallback(
    (id: string) => {
      if (onCardChange) {
        onCardChange(id)
      } else {
        setInternalActiveId(id)
      }
    },
    [onCardChange],
  )

  // Build the ordered list: active card first, then others in original order
  const orderedCards = React.useMemo(() => {
    const active = cards.find((c) => c.id === activeId)
    const rest = cards.filter((c) => c.id !== activeId)
    return active ? [active, ...rest] : cards
  }, [cards, activeId])

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Tab bar */}
      <div className="flex gap-1 relative">
        {cards.map((card) => {
          const isActive = card.id === activeId
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardChange(card.id)}
              className={cn(
                'relative px-3 py-1.5 text-sm rounded-t-md transition-colors',
                isActive
                  ? 'text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute inset-0 bg-primary rounded-t-md"
                  transition={springTransition}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {card.icon}
                {card.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Card stack */}
      <div className="relative" style={{ minHeight: 300 }}>
        <AnimatePresence mode="popLayout">
          {orderedCards.map((card, index) => {
            const isActive = card.id === activeId
            const zIndex = 40 - index * 10

            return (
              <motion.div
                key={card.id}
                layout
                transition={springTransition}
                animate={{
                  scale: isActive ? 1 : 0.97 - index * 0.01,
                  y: isActive ? 0 : 8 * index,
                  x: isActive ? 0 : 4 * index,
                  opacity: isActive ? 1 : 0.7 - index * 0.1,
                }}
                style={{ zIndex }}
                className={cn(
                  'absolute inset-0',
                  !isActive && 'pointer-events-none',
                )}
                onClick={!isActive ? () => handleCardChange(card.id) : undefined}
              >
                <Card
                  className={cn(
                    'h-full overflow-auto',
                    isActive ? 'shadow-lg' : 'shadow-sm',
                  )}
                >
                  {card.content}
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
