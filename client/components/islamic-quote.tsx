"use client" 

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote } from "lucide-react"

const quotes = [
  {
    text: "The best among you are those who have the best manners and character",
    source: "Prophet Muhammad ﷺ (Bukhari)",
  },
  {
    text: "Verily with hardship comes ease",
    source: "Quran 94:6",
  },
  {
    text: "Speak good or remain silent",
    source: "Prophet Muhammad ﷺ (Tirmidhi)",
  },
  {
    text: "The strongest among you is the one who controls his anger",
    source: "Prophet Muhammad ﷺ (Bukhari)",
  },
  {
    text: "Be in this world as if you were a stranger or a traveler",
    source: "Prophet Muhammad ﷺ (Bukhari)",
  },
]

export function IslamicQuote() {
  const [currentQuote, setCurrentQuote] = useState({
    text: "The best among you are those who have the best manners and character",
    source: "Prophet Muhammad ﷺ (Bukhari)",
  });

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(randomQuote);
  }, []); 

  if (!currentQuote) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Quote className="h-4 w-4" />
            Daily Reminder
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="border-l-2 pl-4 italic text-sm text-muted-foreground">
            Loading daily reminder...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Quote className="h-4 w-4" />
          Daily Reminder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="border-l-2 pl-4 italic text-sm">
          {currentQuote.text}{" "}
          <span className="text-xs text-muted-foreground mt-1 block">
            {currentQuote.source}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}