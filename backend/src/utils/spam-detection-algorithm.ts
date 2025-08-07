const spamCache = new Map<string, { messages: string[]; lastMessageTime?: number }>();

export function isSpam(userId: string, content: string): boolean {
  const now = Date.now();
  const user = spamCache.get(userId) || { messages: [] };

  if (user.lastMessageTime !== undefined) {
    const timeDiff = now - user.lastMessageTime;
    if (timeDiff < 500) {
      return true;
    }
  }

  user.lastMessageTime = now;

  user.messages.push(content);
  if (user.messages.length > 5) {
    user.messages.shift();
  }

  if (user.messages.length === 5 && user.messages.every(msg => msg === content)) {
    return true;
  }

  const bannedWords = ["buy now", "subscribe", "click here", "visit my channel"];
  if (bannedWords.some(w => content.toLowerCase().includes(w))) {
    return true;
  }

  spamCache.set(userId, user);
  return false;
}
