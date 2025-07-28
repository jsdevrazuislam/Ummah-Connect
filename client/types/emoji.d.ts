interface EmojiMartData {
  categories: Category[]
  emojis: { [key: string]: Emoji }
  aliases: { [key: string]: string }
  sheet: Sheet
}

interface Category {
  id: string
  emojis: string[]
  name: string
}

interface Emoji {
  id: string
  name: string
  keywords: string[]
  skins: Skin[]
  version: number
  emoticons?: string[]
}

interface Skin {
  unified: string
  native: string
  x?: number
  y?: number
}

interface Sheet {
  cols: number
  rows: number
}
