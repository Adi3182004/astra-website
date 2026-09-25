const fs = require('fs');

const html = fs.readFileSync('Potu___Landing_Page.html', 'utf8');

// Extract all <style> contents
const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let match;
let allCss = '';
while ((match = styleRegex.exec(html)) !== null) {
  allCss += match[1] + '\n\n';
}

fs.writeFileSync('public/potu-landing.css', allCss);
console.log('Saved public/potu-landing.css, length:', allCss.length);
