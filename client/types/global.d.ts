type Children = {
  children: React.ReactNode;
};

type EmojiPicker = {
  id: string;
  name: string;
  native: string;
  unified: string;
  keywords?: (string)[] | null;
  shortcodes: string;
  aliases?: (string)[] | null;
  emoticons?: (string)[] | null;
};
