import { createObjectCsvWriter } from 'csv-writer';
import { join } from 'path';
import { tmpdir } from 'os';
import { readFile, unlink } from 'fs/promises';

export interface CSVRecord {
  [key: string]: string | number | boolean | null | undefined;
}

export async function createCSV(data: CSVRecord[]): Promise<Uint8Array> {
  if (!data || data.length === 0) {
    throw new Error('No data provided for CSV creation');
  }

  // Generate temporary file path
  const tempPath = join(tmpdir(), `csv-export-${Date.now()}.csv`);

  // Extract headers from first record
  const headers = Object.keys(data[0]).map(key => ({
    id: key,
    title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
  }));

  // Create CSV writer
  const csvWriter = createObjectCsvWriter({
    path: tempPath,
    header: headers,
  });

  try {
    // Write data to CSV
    await csvWriter.writeRecords(data);

    // Read file as buffer
    const buffer = await readFile(tempPath);

    // Clean up temp file
    await unlink(tempPath);

    return new Uint8Array(buffer);
  } catch (error) {
    // Attempt cleanup on error
    try {
      await unlink(tempPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

export function sanitizeForCSV(value: any): string {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // Escape quotes by doubling them
  if (str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  // Quote if contains comma, newline, or starts/ends with whitespace
  if (str.includes(',') || str.includes('\n') || str.includes('\r') || 
      str.startsWith(' ') || str.endsWith(' ')) {
    return `"${str}"`;
  }
  
  return str;
}

export function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current);
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add final field
  result.push(current);
  
  return result;
}
