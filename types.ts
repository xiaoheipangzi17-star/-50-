export interface Kana {
  romaji: string;
  hiragana: string;
  katakana: string;
  category: string; // e.g., 'a-row', 'k-row'
}

export type GameMode = 'study' | 'quiz';
export type QuizType = 'romaji-to-kana' | 'kana-to-romaji';
export type KanaType = 'hiragana' | 'katakana' | 'both';

export interface MnemonicResponse {
  mnemonic: string;
  description: string;
}

export interface VocabularyResponse {
  word: string;
  reading: string;
  meaning: string;
}
