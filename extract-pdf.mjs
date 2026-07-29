import * as pdfjsLib from './node_modules/pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { resolve, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const workerPath = resolve(__dirname, 'node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs');
pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const data = new Uint8Array(readFileSync('C:/Users/ELCOT/Downloads/GIREVE - General Presentation - Roaming 03_2026.pdf'));
const pdf = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

console.log('PAGES:', pdf.numPages);
let fullText = '';
for (let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);
  const content = await page.getTextContent();
  const pageText = content.items.map(item => item.str).join(' ');
  fullText += `\n--- PAGE ${i} ---\n${pageText}`;
}
console.log(fullText);
process.exit(0);
