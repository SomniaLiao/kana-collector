const makeRow = (label, category, kanaList, romajiList) => ({
  label,
  category,
  pairs: kanaList.map((kana, index) => ({ kana, romaji: romajiList[index] })),
});

const basicRows = [
  makeRow("あ行", "basic", [..."あいうえお"], ["a", "i", "u", "e", "o"]),
  makeRow("か行", "basic", [..."かきくけこ"], ["ka", "ki", "ku", "ke", "ko"]),
  makeRow("さ行", "basic", [..."さしすせそ"], ["sa", "shi", "su", "se", "so"]),
  makeRow("た行", "basic", [..."たちつてと"], ["ta", "chi", "tsu", "te", "to"]),
  makeRow("な行", "basic", [..."なにぬねの"], ["na", "ni", "nu", "ne", "no"]),
  makeRow("は行", "basic", [..."はひふへほ"], ["ha", "hi", "fu", "he", "ho"]),
  makeRow("ま行", "basic", [..."まみむめも"], ["ma", "mi", "mu", "me", "mo"]),
  makeRow("や行", "basic", [..."やゆよ"], ["ya", "yu", "yo"]),
  makeRow("ら行", "basic", [..."らりるれろ"], ["ra", "ri", "ru", "re", "ro"]),
  makeRow("わ行・ん", "basic", [..."わをん"], ["wa", "wo", "n"]),
];

const voicedRows = [
  makeRow("が行", "voiced", [..."がぎぐげご"], ["ga", "gi", "gu", "ge", "go"]),
  makeRow("ざ行", "voiced", [..."ざじずぜぞ"], ["za", "ji", "zu", "ze", "zo"]),
  makeRow("だ行", "voiced", [..."だぢづでど"], ["da", "ji", "zu", "de", "do"]),
  makeRow("ば行", "voiced", [..."ばびぶべぼ"], ["ba", "bi", "bu", "be", "bo"]),
  makeRow("ぱ行", "voiced", [..."ぱぴぷぺぽ"], ["pa", "pi", "pu", "pe", "po"]),
];

const yoonRows = [
  makeRow("きゃ行", "yoon", ["きゃ", "きゅ", "きょ"], ["kya", "kyu", "kyo"]),
  makeRow("ぎゃ行", "yoon", ["ぎゃ", "ぎゅ", "ぎょ"], ["gya", "gyu", "gyo"]),
  makeRow("しゃ行", "yoon", ["しゃ", "しゅ", "しょ"], ["sha", "shu", "sho"]),
  makeRow("じゃ行", "yoon", ["じゃ", "じゅ", "じょ"], ["ja", "ju", "jo"]),
  makeRow("ちゃ行", "yoon", ["ちゃ", "ちゅ", "ちょ"], ["cha", "chu", "cho"]),
  makeRow("にゃ行", "yoon", ["にゃ", "にゅ", "にょ"], ["nya", "nyu", "nyo"]),
  makeRow("ひゃ行", "yoon", ["ひゃ", "ひゅ", "ひょ"], ["hya", "hyu", "hyo"]),
  makeRow("びゃ行", "yoon", ["びゃ", "びゅ", "びょ"], ["bya", "byu", "byo"]),
  makeRow("ぴゃ行", "yoon", ["ぴゃ", "ぴゅ", "ぴょ"], ["pya", "pyu", "pyo"]),
  makeRow("みゃ行", "yoon", ["みゃ", "みゅ", "みょ"], ["mya", "myu", "myo"]),
  makeRow("りゃ行", "yoon", ["りゃ", "りゅ", "りょ"], ["rya", "ryu", "ryo"]),
];

const toKatakana = (rows) =>
  rows.map((row) => ({
    ...row,
    pairs: row.pairs.map((pair) => ({
      ...pair,
      kana: pair.kana.replace(/[ぁ-ゖ]/g, (character) =>
        String.fromCharCode(character.charCodeAt(0) + 0x60),
      ),
    })),
  }));

export const SCRIPT_ROWS = {
  hiragana: [...basicRows, ...voicedRows, ...yoonRows],
  katakana: toKatakana([...basicRows, ...voicedRows, ...yoonRows]),
};

export const CATEGORY_LABELS = {
  all: "全部假名",
  basic: "清音",
  voiced: "濁音與半濁音",
  yoon: "拗音",
};

export function getRounds(script, category) {
  const rows = SCRIPT_ROWS[script] ?? SCRIPT_ROWS.hiragana;
  return category === "all" ? rows : rows.filter((row) => row.category === category);
}
