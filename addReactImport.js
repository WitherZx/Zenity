const fs = require('fs');
const path = require('path');

function addReactImportToFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('import React')) {
    const newContent = `import React from "react";\n${content}`;
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.tsx')) {
      addReactImportToFile(fullPath);
    }
  });
}

walkDir(path.join(__dirname, 'src')); 