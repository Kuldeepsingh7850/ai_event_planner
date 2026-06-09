const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        results = results.concat(walk(filePath));
      }
    } else if (file.endsWith('.jsx')) {
      results.push(filePath);
    }
  });
  return results;
};

const files = walk('c:/Users/H/Desktop/event/event1/frontend');
let output = `Scanning ${files.length} JSX files...\n\n`;

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  // Match JSX children expressions like > {variable} < or <span> {variable} </span>
  const regex = />\s*\{([a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)\}\s*</g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const expr = match[1];
    
    // We want to check ALL single-word variables, and expressions
    const lineNum = content.substring(0, match.index).split('\n').length;
    output += `Match: {${expr}} in file: ${path.basename(file)} Line: ${lineNum}\n`;
    const index = match.index;
    const start = Math.max(0, index - 60);
    const end = Math.min(content.length, index + 60);
    output += `  Context: ${content.slice(start, end).replace(/\n/g, ' ').trim()}\n`;
    output += `-------------------------------------------\n`;
  }
});

fs.writeFileSync('c:/Users/H/Desktop/event/event1/scratch_scan_results.txt', output);
console.log('Scan completed. Results written to scratch_scan_results.txt');
