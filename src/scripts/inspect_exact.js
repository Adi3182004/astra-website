const fs = require('fs');

const html = fs.readFileSync('Potu___HTML_5_Template_Preview.html', 'utf8');

console.log('Total HTML length:', html.length);

// Let's find the <body> content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
if (bodyMatch) {
  console.log('Body length:', bodyMatch[1].length);
}

// Let's find all <style> tags or CSS
const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
console.log('Style tags found:', styleMatches.length);
styleMatches.forEach((s, idx) => {
  console.log(`Style ${idx} length:`, s.length);
});

// Let's check the main sections inside the body
const boxedWrapper = html.match(/<div class="?boxed_wrapper[^>]*>([\s\S]*?)<\/div>\s*<!--\s*main-footer/i) ||
                    html.match(/<div class="?boxed_wrapper[^>]*>([\s\S]*?)<\/body>/i);

if (boxedWrapper) {
  console.log('boxed_wrapper found, length:', boxedWrapper[1].length);
}
