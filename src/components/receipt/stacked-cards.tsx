'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

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
  cards: initialCards,
  activeCardId,
  onCardChange,
  className,
}: StackedCardsWithTabsProps) {
  // Internal ordered array — last element is on top
  const [orderedCards, setOrderedCards] = useState<CardConfig[]>(initialCards)

  const handleCardClick = (clickedId: string) => {
    const clickedIndex = orderedCards.findIndex((c) => c.id === clickedId)

    // Already on top
    if (clickedIndex === orderedCards.length - 1) return

    // Move clicked card to top (end of array)
    const newCards = [...orderedCards]
    const [clickedCard] = newCards.splice(clickedIndex, 1)
    newCards.push(clickedCard)
    setOrderedCards(newCards)

    // Notify parent
    onCardChange?.(clickedId)
  }

  // If parent controls active card, reorder to match
  if (activeCardId) {
    const topCard = orderedCards[orderedCards.length - 1]
    if (topCard && topCard.id !== activeCardId) {
      const idx = orderedCards.findIndex((c) => c.id === activeCardId)
      if (idx !== -1) {
        const newCards = [...orderedCards]
        const [card] = newCards.splice(idx, 1)
        newCards.push(card)
        // Schedule state update (can't setState during render)
        queueMicrotask(() => setOrderedCards(newCards))
      }
    }
  }

  const topCardId = orderedCards[orderedCards.length - 1]?.id

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Card stack */}
      <div className="relative w-full max-w-sm mx-auto" style={{ height: 420 }}>
        {orderedCards.map((card, index) => {
          const isTop = index === orderedCards.length - 1
          const cardsFromTop = orderedCards.length - 1 - index
          const offsetY = cardsFromTop * 15
          const offsetX = cardsFromTop * 15
          const rotation = cardsFromTop * 2
          const scale = 1 - cardsFromTop * 0.02

          return (
            <motion.div
              key={card.id}
              layout
              initial={false}
              animate={{
                x: offsetX,
                y: offsetY,
                rotate: rotation,
                scale,
                zIndex: index,
              }}
              transition={springTransition}
              onClick={() => handleCardClick(card.id)}
              className={cn(
                'absolute left-0 top-0 rounded-2xl shadow-2xl overflow-hidden bg-card border',
                !isTop && 'cursor-pointer',
              )}
              style={{
                width: '100%',
                height: 350,
              }}
            >
              <div className="h-full overflow-auto">{card.content}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Tabs at bottom — pill style, centered */}
      <div className="flex gap-2 bg-muted/50 backdrop-blur-sm rounded-full p-1.5">
        {initialCards.map((card) => {
          const isActive = card.id === topCardId
          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card.id)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-1.5">
                {card.icon}
                {card.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
