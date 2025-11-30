export enum SearchIntent {
  Informational = 'Informational',
  Commercial = 'Commercial',
  Transactional = 'Transactional',
  Navigational = 'Navigational',
}

export enum KeywordType {
  ShortTail = 'Short Tail',
  LongTail = 'Long Tail',
  Question = 'Question',
  Commercial = 'Commercial',
}

export interface KeywordEntry {
  keyword: string;
  keywordType: KeywordType | string;
  searchIntent: SearchIntent | string;
  priorityScore: number;
  importance: string;
}

export interface GenerationStats {
  totalKeywords: number;
  avgPriority: number;
  intentDistribution: { name: string; value: number }[];
  typeDistribution: { name: string; value: number }[];
}