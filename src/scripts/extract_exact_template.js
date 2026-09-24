const fs = require('fs');
const path = require('path');

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}
if (!fs.existsSync('src/components')) {
  fs.mkdirSync('src/components', { recursive: true });
}

const html = fs.readFileSync('Potu___HTML_5_Template_Preview.html', 'utf8');

// 1. Extract all <style> contents
const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let match;
let allCss = '';
while ((match = styleRegex.exec(html)) !== null) {
  allCss += match[1] + '\n\n';
}

fs.writeFileSync('public/potu-exact.css', allCss);
console.log('Saved public/potu-exact.css, size:', allCss.length);

// 2. Extract <body ...> ... </body>
const bodyTagMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
if (bodyTagMatch) {
  let bodyContent = bodyTagMatch[2];

  // Remove any inline <script> tags from body content if needed, or save them
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let allScripts = '';
  while ((match = scriptRegex.exec(bodyContent)) !== null) {
    allScripts += match[1] + '\n\n';
  }
  fs.writeFileSync('public/potu-exact.js', allScripts);
  console.log('Saved public/potu-exact.js, size:', allScripts.length);

  // Clean bodyContent of <script> tags
  const cleanBody = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '');
  fs.writeFileSync('public/potu-exact-body.html', cleanBody);
  console.log('Saved public/potu-exact-body.html, size:', cleanBody.length);
}
