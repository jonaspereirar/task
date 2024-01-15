import { parse } from 'csv-parse';
import fs from 'node:fs';

export async function parseCsv(filePath) {
  const csvPath = new URL(filePath, import.meta.url);
  const stream = fs.createReadStream(csvPath);

  const csvParse = parse({
    delimiter: ',',
    skipEmptyLines: true,
    fromLine: 2 
  });

  const linesParse = stream.pipe(csvParse);

  const data = [];
  for await (const line of linesParse) {
    const [title, description] = line;
    data.push({ title, description });
  }

  return data;
}
