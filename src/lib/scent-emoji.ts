// Emoji for accords and notes, so perfumes read at a glance without images.
// Checked in order: the first keyword contained in the name wins, so put
// specific words ("orange blossom", "white floral") before general ones.
const RULES: [keyword: string, emoji: string][] = [
  // Names that contain a more general keyword further down ("rose", "pepper", "pine")
  ["rosemary", "🌿"],
  ["peppermint", "🌱"],
  ["pineapple", "🍍"],

  // Florals
  ["orange blossom", "🌼"],
  ["white floral", "🌼"],
  ["tuberose", "🌼"],
  ["rose", "🌹"],
  ["jasmine", "🌼"],
  ["gardenia", "🌼"],
  ["neroli", "🌼"],
  ["ylang", "🌼"],
  ["magnolia", "🌸"],
  ["peony", "🌸"],
  ["lily", "🌸"],
  ["heliotrope", "🌸"],
  ["violet", "🪻"],
  ["iris", "🪻"],
  ["orris", "🪻"],
  ["lavender", "🪻"],
  ["floral", "🌸"],
  ["flower", "🌸"],

  // Citrus and fruit
  ["orange", "🍊"],
  ["mandarin", "🍊"],
  ["tangerine", "🍊"],
  ["grapefruit", "🍊"],
  ["bergamot", "🍋"],
  ["lemon", "🍋"],
  ["lime", "🍋"],
  ["yuzu", "🍋"],
  ["citrus", "🍋"],
  ["coconut", "🥥"],
  ["tropical", "🍍"],
  ["mango", "🥭"],
  ["apple", "🍏"],
  ["pear", "🍐"],
  ["peach", "🍑"],
  ["apricot", "🍑"],
  ["cherry", "🍒"],
  ["raspberry", "🍓"],
  ["strawberry", "🍓"],
  ["berry", "🫐"],
  ["blackcurrant", "🫐"],
  ["cassis", "🫐"],
  ["plum", "🍇"],
  ["grape", "🍇"],
  ["fig", "🍇"],
  ["fruit", "🍑"],

  // Gourmand
  ["vanilla", "🍦"],
  ["chocolate", "🍫"],
  ["cacao", "🍫"],
  ["cocoa", "🍫"],
  ["coffee", "☕"],
  ["caramel", "🍮"],
  ["praline", "🍬"],
  ["honey", "🍯"],
  ["almond", "🌰"],
  ["hazelnut", "🌰"],
  ["pistachio", "🌰"],
  ["tonka", "🫘"],
  ["milk", "🥛"],
  ["creamy", "🥛"],
  ["gourmand", "🧁"],
  ["sugar", "🍬"],
  ["sweet", "🍬"],

  // Drinks
  ["tea", "🍵"],
  ["cognac", "🥃"],
  ["rum", "🥃"],
  ["whisk", "🥃"],
  ["boozy", "🥃"],
  ["wine", "🍷"],
  ["champagne", "🥂"],

  // Spices (before woods so "warm spicy" isn't caught later)
  ["pepper", "🌶️"],
  ["chili", "🌶️"],
  ["anise", "⭐"],
  ["ginger", "🫚"],
  ["cinnamon", "🫚"],
  ["cardamom", "🫚"],
  ["clove", "🫚"],
  ["nutmeg", "🫚"],
  ["saffron", "🫚"],
  ["spic", "🫚"],

  // Woods and earth
  ["cedar", "🌲"],
  ["pine", "🌲"],
  ["fir", "🌲"],
  ["cypress", "🌲"],
  ["oud", "🪵"],
  ["agarwood", "🪵"],
  ["sandalwood", "🪵"],
  ["oak", "🪵"],
  ["guaiac", "🪵"],
  ["vetiver", "🌾"],
  ["patchouli", "🍂"],
  ["tobacco", "🍂"],
  ["moss", "🍃"],
  ["chypre", "🍃"],
  ["earthy", "🍄"],
  ["mushroom", "🍄"],
  ["wood", "🌳"],

  // Green and aromatic
  ["mint", "🌱"],
  ["basil", "🌿"],
  ["sage", "🌿"],
  ["rosemary", "🌿"],
  ["herb", "🌿"],
  ["aromatic", "🌿"],
  ["green", "🌿"],
  ["leaf", "🍃"],
  ["grass", "🌱"],

  // Fresh and water
  ["aquatic", "🌊"],
  ["marine", "🌊"],
  ["sea", "🌊"],
  ["ozon", "🌊"],
  ["salt", "🧂"],
  ["mineral", "🪨"],
  ["clean", "🫧"],
  ["soap", "🫧"],
  ["aldehyde", "🫧"],
  ["fresh", "🫧"],

  // Warm, resinous and smoky
  ["ambergris", "🌊"],
  ["amber", "🌅"],
  ["resin", "🌅"],
  ["balsam", "🌅"],
  ["benzoin", "🌅"],
  ["labdanum", "🌅"],
  ["myrrh", "🌅"],
  ["frankincense", "🕯️"],
  ["incense", "🕯️"],
  ["smok", "💨"],
  ["tar", "💨"],
  ["birch", "💨"],

  // Skin, leather and the rest
  ["leather", "👜"],
  ["suede", "👜"],
  ["musk", "☁️"],
  ["powder", "🪶"],
  ["animalic", "🐾"],
  ["dark", "🌑"],
];

export function scentEmoji(name: string): string | undefined {
  const lower = name.toLowerCase();
  return RULES.find(([keyword]) => lower.includes(keyword))?.[1];
}

// The emoji for a perfume's overall category: its first accord that has one.
export function perfumeEmoji(accords: string[]): string {
  for (const accord of accords) {
    const emoji = scentEmoji(accord);
    if (emoji) return emoji;
  }
  return "✨";
}
