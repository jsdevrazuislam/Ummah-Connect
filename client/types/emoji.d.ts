type EmojiMartData = {
  categories: Category[];
  emojis: { [key: string]: Emoji };
  aliases: { [key: string]: string };
  sheet: Sheet;
};

type Category = {
  id: string;
  emojis: string[];
  name: string;
};

type Emoji = {
  id: string;
  name: string;
  keywords: string[];
  skins: Skin[];
  version: number;
  emoticons?: string[];
};

type Skin = {
  unified: string;
  native: string;
  x?: number;
  y?: number;
};

type Sheet = {
  cols: number;
  rows: number;
};
