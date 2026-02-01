
import { CallEntry } from '../types';

export const parseRawLogs = (rawInput: string): CallEntry[] => {
  const entries: CallEntry[] = [];
  
  // Split the raw data into individual entries based on multiple spaces
  // This mimics the Python re.split(r'\s{2,}', raw_data.strip())
  const splitEntries = rawInput.trim().split(/\s{2,}/);

  // Regex to match number, date/time, and optional duration
  // Pattern updated to allow any length of digits for the phone number
  const entryPattern = /^\+?(\d+)\s+(\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s+[AP]M)(?:,\s*(\d{2}:\d{2}:\d{2}))?$/;

  splitEntries.forEach(entry => {
    const trimmed = entry.trim();
    const match = entryPattern.exec(trimmed);

    if (match) {
      const number = match[1];
      const timestamp = match[2];
      const durationStr = match[3];

      let durationSeconds = 0;
      if (durationStr) {
        const [h, m, s] = durationStr.split(':').map(Number);
        durationSeconds = (h * 3600) + (m * 60) + s;
      }

      entries.push({
        number,
        timestamp,
        durationSeconds,
        durationFormatted: durationStr || '00:00:00'
      });
    }
  });

  return entries;
};

export const formatSecondsToTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const h = String(hours).padStart(2, '0');
  const m = String(minutes).padStart(2, '0');
  const s = String(seconds).padStart(2, '0');

  return `${h}:${m}:${s}`;
};
