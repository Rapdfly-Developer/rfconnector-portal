const fs = require('fs');
const { PDFParse } = require('./node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs');
const buf = fs.readFileSync('C:/Users/ELCOT/Downloads/GIREVE - General Presentation - Roaming 03_2026.pdf');
const parser = new PDFParse();
parser.parse(buf).then(data => {
  console.log('PAGES:', data.numpages);
  console.log(data.text);
}).catch(e => {
  // Try alternative method
  console.log('parse failed, trying getText:', e.message);
});
