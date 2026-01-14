/**
 * Emoji alias map for SEO-friendly / synonym-friendly search
 * Includes English and Indonesian terms
 */

export const EMOJI_ALIASES: Record<string, string[]> = {
  // === EMOTIONS ===
  'sad': ['😢', '😭', '😞', '😔', '🥺', '😿'],
  'cry': ['😢', '😭', '😿'],
  'crying': ['😢', '😭'],
  'tears': ['😢', '😭', '😂'],
  'laugh': ['😂', '🤣', '😆', '😅'],
  'lol': ['😂', '🤣'],
  'rofl': ['🤣'],
  'haha': ['😂', '🤣', '😆'],
  'love': ['❤️', '💕', '💖', '😍', '🥰', '💗', '💓', '💘', '💝'],
  'heart': ['❤️', '💕', '💖', '💗', '💓', '🫀', '💔', '💜', '💙', '💚', '🧡', '🖤', '🤍'],
  'happy': ['😊', '😃', '😄', '🙂', '😁', '🥳', '😀'],
  'smile': ['😊', '😃', '😄', '🙂', '😁', '😀', '☺️'],
  'grin': ['😁', '😀', '😃'],
  'angry': ['😠', '😡', '🤬', '💢', '😤'],
  'mad': ['😠', '😡', '🤬'],
  'rage': ['😡', '🤬', '💢'],
  'cool': ['😎', '🆒', '🧊'],
  'thinking': ['🤔', '💭', '🧐'],
  'confused': ['😕', '🤔', '😐', '🫤'],
  'worried': ['😟', '😰', '😥'],
  'surprised': ['😮', '😲', '😯', '🤯', '😳'],
  'shocked': ['😮', '😲', '🤯', '😱'],
  'scared': ['😱', '😨', '😰'],
  'sick': ['🤒', '🤕', '🤢', '🤮', '😷'],
  'tired': ['😴', '🥱', '😪'],
  'sleepy': ['😴', '🥱', '😪', '💤'],
  'wink': ['😉', '😜'],
  'kiss': ['😘', '😗', '😙', '😚', '💋'],
  'shy': ['😊', '🙈', '😳'],
  'nerd': ['🤓', '🧐'],
  'party': ['🥳', '🎉', '🎊', '🪩'],
  
  // === GESTURES ===
  'ok': ['👌', '✅', '👍', '🆗'],
  'okay': ['👌', '✅', '👍', '🆗'],
  'check': ['✅', '☑️', '✔️'],
  'yes': ['✅', '👍', '✔️', '🙆', '👌'],
  'no': ['❌', '👎', '🚫', '🙅', '⛔'],
  'thumbs': ['👍', '👎'],
  'thumbsup': ['👍'],
  'thumbsdown': ['👎'],
  'clap': ['👏', '🙌'],
  'applause': ['👏', '🙌'],
  'pray': ['🙏', '🤲'],
  'please': ['🙏', '🥺'],
  'thanks': ['🙏', '🙌'],
  'wave': ['👋', '🤚'],
  'hi': ['👋', '🤚', '✋'],
  'hello': ['👋', '🤚'],
  'bye': ['👋', '🤚'],
  'point': ['👆', '👇', '👈', '👉', '☝️'],
  'fist': ['✊', '👊', '🤛', '🤜'],
  'punch': ['👊', '🤛', '🤜'],
  'peace': ['✌️', '☮️'],
  'victory': ['✌️', '🏆'],
  'rock': ['🤘', '🎸'],
  'call': ['🤙', '📞', '📱'],
  'muscle': ['💪', '🦾'],
  'strong': ['💪', '🦾', '💪🏻'],
  'flex': ['💪'],
  
  // === OBJECTS / CONCEPTS ===
  'fire': ['🔥', '🧯', '🔥'],
  'hot': ['🔥', '🥵', '🌡️', '♨️'],
  'cold': ['🥶', '❄️', '🧊', '⛄'],
  'trash': ['🗑️', '♻️', '🚮'],
  'delete': ['🗑️', '❌', '🚮'],
  'remove': ['🗑️', '❌', '🚮'],
  'money': ['💰', '💵', '💸', '🤑', '💲', '🏦', '💳', '🪙'],
  'cash': ['💵', '💰', '💸'],
  'dollar': ['💵', '💲', '💰'],
  'rich': ['🤑', '💰', '💎'],
  'idea': ['💡', '🧠', '✨', '🤔'],
  'lightbulb': ['💡'],
  'light': ['💡', '🔦', '✨', '☀️', '🌟'],
  'fast': ['⚡', '🚀', '💨', '🏃', '🏎️'],
  'speed': ['⚡', '🚀', '💨'],
  'quick': ['⚡', '🚀', '💨'],
  'rocket': ['🚀', '🛸'],
  'launch': ['🚀', '🎉'],
  'star': ['⭐', '🌟', '✨', '💫', '⭐'],
  'stars': ['⭐', '🌟', '✨', '💫'],
  'sparkle': ['✨', '💫', '⭐', '🌟'],
  'magic': ['✨', '🪄', '💫', '🔮'],
  'warning': ['⚠️', '🚨', '❗', '⚡'],
  'alert': ['🚨', '⚠️', '🔔'],
  'error': ['❌', '🚫', '⛔', '💔'],
  'fail': ['❌', '🚫', '👎'],
  'success': ['✅', '🎉', '✔️', '🏆', '🥇'],
  'win': ['🏆', '🥇', '🎉', '✅'],
  'trophy': ['🏆', '🥇'],
  'search': ['🔍', '🔎'],
  'find': ['🔍', '🔎'],
  'look': ['🔍', '👀', '👁️'],
  'settings': ['⚙️', '🔧', '🛠️'],
  'config': ['⚙️', '🔧'],
  'gear': ['⚙️', '🔧'],
  'tool': ['🔧', '🛠️', '🔨', '⚙️'],
  'fix': ['🔧', '🛠️', '🔨'],
  'build': ['🛠️', '🔨', '🏗️'],
  'lock': ['🔒', '🔐', '🔑'],
  'unlock': ['🔓', '🔑'],
  'secure': ['🔒', '🔐', '🛡️'],
  'key': ['🔑', '🗝️'],
  'password': ['🔑', '🔒', '🔐'],
  'time': ['⏰', '🕐', '⌚', '⏱️'],
  'clock': ['⏰', '🕐', '⌚'],
  'calendar': ['📅', '📆', '🗓️'],
  'date': ['📅', '📆', '🗓️'],
  'schedule': ['📅', '📆', '🗓️', '⏰'],
  'mail': ['📧', '✉️', '📬', '📨'],
  'email': ['📧', '✉️', '📩'],
  'inbox': ['📥', '📧'],
  'send': ['📤', '✈️', '🚀'],
  'folder': ['📁', '📂', '🗂️'],
  'file': ['📄', '📁', '📂', '📃'],
  'document': ['📄', '📝', '📃'],
  'note': ['📝', '🗒️', '📋', '✏️'],
  'write': ['✍️', '📝', '✏️'],
  'edit': ['✏️', '📝', '✍️'],
  'book': ['📚', '📖', '📕', '📗', '📘'],
  'read': ['📖', '📚', '👀'],
  'phone': ['📱', '☎️', '📞'],
  'mobile': ['📱', '📲'],
  'computer': ['💻', '🖥️', '⌨️'],
  'laptop': ['💻'],
  'desktop': ['🖥️', '💻'],
  'chat': ['💬', '🗨️', '💭', '📱'],
  'message': ['💬', '✉️', '📩', '📨'],
  'comment': ['💬', '🗨️'],
  'ai': ['🤖', '🧠', '✨', '🔮'],
  'robot': ['🤖', '🦾'],
  'brain': ['🧠', '💭', '🤔'],
  'smart': ['🧠', '🤓', '💡'],
  'bug': ['🐛', '🐞', '🪲'],
  'debug': ['🐛', '🔧', '🔍'],
  'code': ['💻', '👨‍💻', '👩‍💻', '⌨️'],
  'developer': ['👨‍💻', '👩‍💻', '💻'],
  'home': ['🏠', '🏡', '🏘️'],
  'house': ['🏠', '🏡'],
  'work': ['💼', '🏢', '👔'],
  'office': ['🏢', '💼', '🖥️'],
  'meeting': ['📅', '🤝', '👥'],
  'team': ['👥', '🤝', '👨‍👩‍👧‍👦'],
  'user': ['👤', '👨', '👩', '🧑'],
  'users': ['👥', '👨‍👩‍👧‍👦'],
  'person': ['👤', '🧑', '👨', '👩'],
  'people': ['👥', '👨‍👩‍👧‍👦'],
  'camera': ['📷', '📸', '🎥'],
  'photo': ['📷', '📸', '🖼️'],
  'picture': ['🖼️', '📷', '🎨'],
  'image': ['🖼️', '📷', '🎨'],
  'video': ['🎥', '📹', '🎬'],
  'music': ['🎵', '🎶', '🎼', '🎧'],
  'song': ['🎵', '🎶', '🎤'],
  'mic': ['🎤', '🎙️'],
  'speaker': ['🔊', '📢', '🔈'],
  'sound': ['🔊', '🔉', '🎵'],
  'mute': ['🔇', '🤫'],
  'quiet': ['🤫', '🔇', '🔕'],
  'bell': ['🔔', '🔕', '🛎️'],
  'notification': ['🔔', '📲', '💬'],
  'gift': ['🎁', '🎀', '🎉'],
  'present': ['🎁', '🎀'],
  'birthday': ['🎂', '🎉', '🎈', '🥳'],
  'cake': ['🎂', '🍰', '🧁'],
  'celebrate': ['🎉', '🥳', '🎊', '🍾'],
  'new': ['🆕', '✨', '🌟'],
  'update': ['🔄', '🆙', '♻️'],
  'refresh': ['🔄', '♻️'],
  'loading': ['⏳', '⌛', '🔄'],
  'wait': ['⏳', '⌛', '🕐'],
  'stop': ['🛑', '⛔', '✋'],
  'pause': ['⏸️', '⏯️'],
  'play': ['▶️', '⏯️', '🎮'],
  'game': ['🎮', '🕹️', '👾'],
  'world': ['🌍', '🌎', '🌏', '🗺️'],
  'earth': ['🌍', '🌎', '🌏'],
  'globe': ['🌍', '🌎', '🌏', '🗺️'],
  'sun': ['☀️', '🌞', '🌅'],
  'moon': ['🌙', '🌛', '🌜', '🌝'],
  'weather': ['☀️', '🌤️', '⛅', '🌧️'],
  'rain': ['🌧️', '☔', '🌦️'],
  'snow': ['❄️', '⛄', '🌨️'],
  'cloud': ['☁️', '⛅', '🌥️'],
  'rainbow': ['🌈'],
  'plant': ['🌱', '🌿', '🪴'],
  'tree': ['🌳', '🌲', '🌴'],
  'flower': ['🌸', '🌺', '🌻', '🌹', '💐'],
  'food': ['🍔', '🍕', '🍟', '🍣', '🍜'],
  'drink': ['🍺', '🍻', '🥤', '☕', '🍵'],
  'coffee': ['☕', '🫖'],
  'tea': ['🍵', '🫖'],
  'pizza': ['🍕'],
  'burger': ['🍔', '🍟'],
  'car': ['🚗', '🚙', '🏎️'],
  'drive': ['🚗', '🚙', '🏎️'],
  'airplane': ['✈️', '🛫', '🛬'],
  'fly': ['✈️', '🛫', '🦅'],
  'travel': ['✈️', '🧳', '🗺️', '🌍'],
  'vacation': ['🏖️', '🌴', '✈️', '🧳'],
  'beach': ['🏖️', '🌊', '🌴', '☀️'],
  'mountain': ['⛰️', '🏔️', '🗻'],
  'flag': ['🏳️', '🚩', '🏴'],
  'pin': ['📍', '📌'],
  'location': ['📍', '🗺️', '📌'],
  'target': ['🎯', '🏹'],
  'goal': ['🎯', '🥅', '🏆'],
  
  // === INDONESIAN TERMS ===
  'sedih': ['😢', '😭', '😞', '😔', '🥺'],
  'nangis': ['😢', '😭'],
  'menangis': ['😢', '😭'],
  'ketawa': ['😂', '🤣', '😆'],
  'tertawa': ['😂', '🤣', '😆'],
  'ngakak': ['🤣', '😂'],
  'marah': ['😠', '😡', '🤬', '💢'],
  'kesal': ['😠', '😤', '😡'],
  'uang': ['💰', '💵', '💸', '🤑'],
  'duit': ['💰', '💵', '💸'],
  'receh': ['🪙', '💰'],
  'ide': ['💡', '🧠', '✨'],
  'pikiran': ['🧠', '💭', '🤔'],
  'cepat': ['⚡', '🚀', '💨', '🏃'],
  'hati': ['❤️', '💕', '💖', '💗'],
  'cinta': ['❤️', '💕', '😍', '💘'],
  'sayang': ['❤️', '💕', '🥰'],
  'bintang': ['⭐', '🌟', '✨'],
  'api': ['🔥'],
  'panas': ['🔥', '🥵', '🌡️'],
  'dingin': ['🥶', '❄️', '🧊'],
  'ceklist': ['✅', '☑️', '✔️'],
  'centang': ['✅', '☑️', '✔️'],
  'silang': ['❌', '✖️'],
  'bagus': ['👍', '✅', '👌', '🎉', '💯'],
  'mantap': ['👍', '💪', '🔥', '💯'],
  'oke': ['👌', '✅', '👍', '🆗'],
  'siap': ['👌', '✅', '👍', '🫡'],
  'sukses': ['✅', '🎉', '✔️', '🏆'],
  'berhasil': ['✅', '🎉', '🏆'],
  'gagal': ['❌', '🚫', '😞', '💔'],
  'pesan': ['💬', '✉️', '📩'],
  'cari': ['🔍', '🔎'],
  'kunci': ['🔑', '🔒', '🔐'],
  'waktu': ['⏰', '🕐', '⌚'],
  'jam': ['⏰', '🕐', '⌚'],
  'tanggal': ['📅', '📆'],
  'rumah': ['🏠', '🏡'],
  'kantor': ['🏢', '💼'],
  'kerja': ['💼', '👔', '🏢'],
  'tidur': ['😴', '🛏️', '💤'],
  'makan': ['🍔', '🍽️', '🍜'],
  'minum': ['🥤', '☕', '🍵'],
  'kopi': ['☕'],
  'teh': ['🍵', '🫖'],
  'buku': ['📚', '📖'],
  'baca': ['📖', '👀'],
  'tulis': ['✍️', '📝'],
  'foto': ['📷', '📸'],
  'gambar': ['🖼️', '🎨', '📷'],
  'musik': ['🎵', '🎶', '🎧'],
  'lagu': ['🎵', '🎶', '🎤'],
  'main': ['🎮', '🎲', '⚽'],
  'hadiah': ['🎁', '🎀'],
  'ulang tahun': ['🎂', '🎉', '🥳'],
  'ultah': ['🎂', '🎉', '🥳'],
  'baru': ['🆕', '✨'],
  'dunia': ['🌍', '🌎', '🗺️'],
  'matahari': ['☀️', '🌞'],
  'bulan': ['🌙', '🌛'],
  'hujan': ['🌧️', '☔'],
  'salju': ['❄️', '⛄'],
  'bunga': ['🌸', '🌺', '🌹', '💐'],
  'pohon': ['🌳', '🌲'],
  'mobil': ['🚗', '🚙'],
  'pesawat': ['✈️', '🛫'],
  'pantai': ['🏖️', '🌊'],
  'gunung': ['⛰️', '🏔️'],
  'bendera': ['🏳️', '🚩'],
  'lokasi': ['📍', '🗺️'],
  'sasaran': ['🎯', '🏹'],
  'tujuan': ['🎯', '🏆'],
  'tim': ['👥', '🤝'],
  'orang': ['👤', '🧑'],
  'hewan': ['🐶', '🐱', '🐻'],
  'kucing': ['🐱', '😺', '🐈'],
  'anjing': ['🐶', '🐕', '🦮'],
  
  // === SYMBOLS / SPECIAL ===
  'plus': ['➕', '✚'],
  'minus': ['➖'],
  'multiply': ['✖️', '❌'],
  'divide': ['➗'],
  'equal': ['🟰'],
  'percent': ['💯'],
  'hundred': ['💯'],
  'infinity': ['♾️'],
  'question': ['❓', '❔', '🤔'],
  'exclamation': ['❗', '❕', '‼️'],
  'info': ['ℹ️', '💡'],
  'help': ['❓', '🆘', 'ℹ️'],
  'sos': ['🆘'],
  'free': ['🆓'],
  'baru_tag': ['🆕'],
  'cool_tag': ['🆒', '😎'],
  'top': ['🔝', '⬆️'],
  'up': ['⬆️', '🔝', '👆'],
  'down': ['⬇️', '👇'],
  'left_arrow': ['⬅️', '👈'],
  'right_arrow': ['➡️', '👉'],
  'back_arrow': ['🔙', '⬅️'],
  'forward_arrow': ['🔜', '➡️'],
  'soon': ['🔜'],
  'end_tag': ['🔚'],
  'arrow': ['➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️'],
  'circle': ['⭕', '🔴', '🟢', '🔵'],
  'square': ['⬛', '⬜', '🟥', '🟦'],
  'triangle': ['🔺', '🔻'],
  'diamond_shape': ['💎', '🔷', '🔶'],
};

/**
 * Normalize search query: lowercase, trim, collapse multiple spaces
 */
export function normalizeQuery(query: string): string {
  return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Get emojis matching a single token via alias lookup
 */
export function getAliasMatches(token: string): string[] {
  const normalized = token.toLowerCase();
  
  // Direct match
  if (EMOJI_ALIASES[normalized]) {
    return EMOJI_ALIASES[normalized];
  }
  
  // Partial match (token is prefix of alias key)
  const partialMatches: string[] = [];
  for (const [key, emojis] of Object.entries(EMOJI_ALIASES)) {
    if (key.startsWith(normalized) || key.includes(normalized)) {
      partialMatches.push(...emojis);
    }
  }
  
  // Deduplicate
  return [...new Set(partialMatches)];
}

/**
 * Search emojis using multi-token query with alias expansion
 * Returns ranked results: exact alias > partial alias
 */
export function searchEmojisWithAliases(query: string): string[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];
  
  const tokens = normalized.split(' ').filter(Boolean);
  
  // Collect all matches from all tokens
  const exactMatches: Set<string> = new Set();
  const partialMatches: Set<string> = new Set();
  
  for (const token of tokens) {
    const normalizedToken = token.toLowerCase();
    
    // Check for exact alias match
    if (EMOJI_ALIASES[normalizedToken]) {
      EMOJI_ALIASES[normalizedToken].forEach(e => exactMatches.add(e));
    }
    
    // Check for partial matches
    for (const [key, emojis] of Object.entries(EMOJI_ALIASES)) {
      if (key !== normalizedToken && (key.startsWith(normalizedToken) || key.includes(normalizedToken))) {
        emojis.forEach(e => partialMatches.add(e));
      }
    }
  }
  
  // Combine: exact first, then partial (excluding already added)
  const results: string[] = [...exactMatches];
  partialMatches.forEach(e => {
    if (!exactMatches.has(e)) {
      results.push(e);
    }
  });
  
  return results;
}

// === RECENTS STORAGE ===

const RECENTS_KEY = 'numa-emoji-recents';
const MAX_RECENTS = 20;

/**
 * Get recent emojis from localStorage
 */
export function getRecentEmojis(): string[] {
  try {
    const stored = localStorage.getItem(RECENTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_RECENTS);
      }
    }
  } catch {
    // Ignore parse errors
  }
  return [];
}

/**
 * Add an emoji to recents (moves to front if already exists)
 */
export function addRecentEmoji(emoji: string): void {
  try {
    const recents = getRecentEmojis();
    // Remove if already exists
    const filtered = recents.filter(e => e !== emoji);
    // Add to front
    filtered.unshift(emoji);
    // Limit to max
    const limited = filtered.slice(0, MAX_RECENTS);
    localStorage.setItem(RECENTS_KEY, JSON.stringify(limited));
  } catch {
    // Ignore storage errors
  }
}
