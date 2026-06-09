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
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
};

const files = walk('c:/Users/H/Desktop/event/event1');
console.log(`Scanning ${files.length} JS/JSX files for {name, description} patterns...`);

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  // Match object declarations or assignments containing name and description
  // E.g. { name: ..., description: ... } or { name, description }
  
  // We can search for files containing both "name" and "description"
  if (content.includes('name') && content.includes('description')) {
    // Let's print occurrences where they might form an object
    // Simple check: name and description within 150 chars of each other
    let index = 0;
    while ((index = content.indexOf('description', index)) !== -1) {
      const start = Math.max(0, index - 150);
      const end = Math.min(content.length, index + 150);
      const snippet = content.slice(start, end);
      if (snippet.includes('name')) {
        console.log(`Possible match in ${path.relative('c:/Users/H/Desktop/event/event1', file)}:`);
        console.log(snippet.replace(/\s+/g, ' ').trim());
        console.log('-------------------------------------------');
      }
      index += 11;
    }
  }
});
