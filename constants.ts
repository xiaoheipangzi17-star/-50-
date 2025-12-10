
import { Kana } from './types';

export const KANA_DATA: Kana[] = [
  // Seion (Basic)
  { romaji: 'a', hiragana: 'あ', katakana: 'ア', category: 'a' },
  { romaji: 'i', hiragana: 'い', katakana: 'イ', category: 'a' },
  { romaji: 'u', hiragana: 'う', katakana: 'ウ', category: 'a' },
  { romaji: 'e', hiragana: 'え', katakana: 'エ', category: 'a' },
  { romaji: 'o', hiragana: 'お', katakana: 'オ', category: 'a' },
  
  { romaji: 'ka', hiragana: 'か', katakana: 'カ', category: 'ka' },
  { romaji: 'ki', hiragana: 'き', katakana: 'キ', category: 'ka' },
  { romaji: 'ku', hiragana: 'く', katakana: 'ク', category: 'ka' },
  { romaji: 'ke', hiragana: 'け', katakana: 'ケ', category: 'ka' },
  { romaji: 'ko', hiragana: 'こ', katakana: 'コ', category: 'ka' },
  
  { romaji: 'sa', hiragana: 'さ', katakana: 'サ', category: 'sa' },
  { romaji: 'shi', hiragana: 'し', katakana: 'シ', category: 'sa' },
  { romaji: 'su', hiragana: 'す', katakana: 'ス', category: 'sa' },
  { romaji: 'se', hiragana: 'せ', katakana: 'セ', category: 'sa' },
  { romaji: 'so', hiragana: 'そ', katakana: 'ソ', category: 'sa' },
  
  { romaji: 'ta', hiragana: 'た', katakana: 'タ', category: 'ta' },
  { romaji: 'chi', hiragana: 'ち', katakana: 'チ', category: 'ta' },
  { romaji: 'tsu', hiragana: 'つ', katakana: 'ツ', category: 'ta' },
  { romaji: 'te', hiragana: 'て', katakana: 'テ', category: 'ta' },
  { romaji: 'to', hiragana: 'と', katakana: 'ト', category: 'ta' },
  
  { romaji: 'na', hiragana: 'な', katakana: 'ナ', category: 'na' },
  { romaji: 'ni', hiragana: 'に', katakana: 'ニ', category: 'na' },
  { romaji: 'nu', hiragana: 'ぬ', katakana: 'ヌ', category: 'na' },
  { romaji: 'ne', hiragana: 'ね', katakana: 'ネ', category: 'na' },
  { romaji: 'no', hiragana: 'の', katakana: 'ノ', category: 'na' },
  
  { romaji: 'ha', hiragana: 'は', katakana: 'ハ', category: 'ha' },
  { romaji: 'hi', hiragana: 'ひ', katakana: 'ヒ', category: 'ha' },
  { romaji: 'fu', hiragana: 'ふ', katakana: 'フ', category: 'ha' },
  { romaji: 'he', hiragana: 'へ', katakana: 'ヘ', category: 'ha' },
  { romaji: 'ho', hiragana: 'ほ', katakana: 'ホ', category: 'ha' },
  
  { romaji: 'ma', hiragana: 'ま', katakana: 'マ', category: 'ma' },
  { romaji: 'mi', hiragana: 'み', katakana: 'ミ', category: 'ma' },
  { romaji: 'mu', hiragana: 'む', katakana: 'ム', category: 'ma' },
  { romaji: 'me', hiragana: 'め', katakana: 'メ', category: 'ma' },
  { romaji: 'mo', hiragana: 'も', katakana: 'モ', category: 'ma' },
  
  { romaji: 'ya', hiragana: 'や', katakana: 'ヤ', category: 'ya' },
  { romaji: 'yu', hiragana: 'ゆ', katakana: 'ユ', category: 'ya' },
  { romaji: 'yo', hiragana: 'よ', katakana: 'ヨ', category: 'ya' },
  
  { romaji: 'ra', hiragana: 'ら', katakana: 'ラ', category: 'ra' },
  { romaji: 'ri', hiragana: 'り', katakana: 'リ', category: 'ra' },
  { romaji: 'ru', hiragana: 'る', katakana: 'ル', category: 'ra' },
  { romaji: 're', hiragana: 'れ', katakana: 'レ', category: 'ra' },
  { romaji: 'ro', hiragana: 'ろ', katakana: 'ロ', category: 'ra' },
  
  { romaji: 'wa', hiragana: 'わ', katakana: 'ワ', category: 'wa' },
  { romaji: 'wo', hiragana: 'を', katakana: 'ヲ', category: 'wa' },
  { romaji: 'n', hiragana: 'ん', katakana: 'ン', category: 'n' },

  // Dakuon (Voiced)
  { romaji: 'ga', hiragana: 'が', katakana: 'ガ', category: 'ga' },
  { romaji: 'gi', hiragana: 'ぎ', katakana: 'ギ', category: 'ga' },
  { romaji: 'gu', hiragana: 'ぐ', katakana: 'グ', category: 'ga' },
  { romaji: 'ge', hiragana: 'げ', katakana: 'ゲ', category: 'ga' },
  { romaji: 'go', hiragana: 'ご', katakana: 'ゴ', category: 'ga' },

  { romaji: 'za', hiragana: 'ざ', katakana: 'ザ', category: 'za' },
  { romaji: 'ji', hiragana: 'じ', katakana: 'ジ', category: 'za' },
  { romaji: 'zu', hiragana: 'ず', katakana: 'ズ', category: 'za' },
  { romaji: 'ze', hiragana: 'ぜ', katakana: 'ゼ', category: 'za' },
  { romaji: 'zo', hiragana: 'ぞ', katakana: 'ゾ', category: 'za' },

  { romaji: 'da', hiragana: 'だ', katakana: 'ダ', category: 'da' },
  { romaji: 'di', hiragana: 'ぢ', katakana: 'ヂ', category: 'da' }, // di (ji)
  { romaji: 'du', hiragana: 'づ', katakana: 'ヅ', category: 'da' }, // du (zu)
  { romaji: 'de', hiragana: 'で', katakana: 'デ', category: 'da' },
  { romaji: 'do', hiragana: 'ど', katakana: 'ド', category: 'da' },

  { romaji: 'ba', hiragana: 'ば', katakana: 'バ', category: 'ba' },
  { romaji: 'bi', hiragana: 'び', katakana: 'ビ', category: 'ba' },
  { romaji: 'bu', hiragana: 'ぶ', katakana: 'ブ', category: 'ba' },
  { romaji: 'be', hiragana: 'べ', katakana: 'ベ', category: 'ba' },
  { romaji: 'bo', hiragana: 'ぼ', katakana: 'ボ', category: 'ba' },

  // Handakuon (Semi-voiced)
  { romaji: 'pa', hiragana: 'ぱ', katakana: 'パ', category: 'pa' },
  { romaji: 'pi', hiragana: 'ぴ', katakana: 'ピ', category: 'pa' },
  { romaji: 'pu', hiragana: 'ぷ', katakana: 'プ', category: 'pa' },
  { romaji: 'pe', hiragana: 'ぺ', katakana: 'ペ', category: 'pa' },
  { romaji: 'po', hiragana: 'ぽ', katakana: 'ポ', category: 'pa' },
];
