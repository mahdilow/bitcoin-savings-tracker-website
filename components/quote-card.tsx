"use client"

import type { Quote } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Lightbulb } from "lucide-react"

interface QuoteCardProps {
  quote: Quote
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <Card className="p-6 border-border/50 bg-card/50 backdrop-blur animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-lg leading-relaxed text-foreground mb-2">"{quote.text}"</p>
          <p className="text-sm text-muted-foreground">— {quote.author}</p>
        </div>
      </div>
    </Card>
  )
}
