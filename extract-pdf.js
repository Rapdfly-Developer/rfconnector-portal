const fs = require('fs');
const pdfParse = require('pdf-parse');
const buf = fs.readFileSync('C:/Users/ELCOT/Downloads/GIREVE - General Presentation - Roaming 03_2026.pdf');
pdfParse(buf).then(data => {
  console.log('PAGES:', data.numpages);
  // Print all text
  console.log(data.text);
}).catch(e => console.error(e.message));
