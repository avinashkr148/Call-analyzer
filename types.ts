
export interface CallEntry {
  number: string;
  timestamp: string;
  durationSeconds: number;
  durationFormatted: string;
}

export interface SummaryStats {
  totalDials: number;
  totalTalkSeconds: number;
  formattedTalkTime: string;
  uniqueNumbers: number;
  connectedCalls: number;
  missedCalls: number;
}

export interface NumberStats {
  number: string;
  dials: number;
  talkTime: number;
  formattedTalkTime: string;
}
