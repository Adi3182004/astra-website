const fs = require('fs');

function analyzeFile(filename) {
  console.log('-------------------------------------------');
  console.log('FILE:', filename);
  if (!fs.existsSync(filename)) {
    console.log('File does not exist');
    return;
  }
  const content = fs.readFileSync(filename, 'utf8');
  console.log('Length:', content.length);

  // Look for sections
  const sectionMatches = content.match(/<section[\s\S]*?<\/section>/gi) || [];
  console.log('Sections found:', sectionMatches.length);
  sectionMatches.forEach((s, idx) => {
    const idMatch = s.match(/id=["']?([^"'\s>]+)/i);
    const classMatch = s.match(/class=["']?([^"'>]+)/i);
    const headings = (s.match(/<h[1-6][\s\S]*?<\/h[1-6]>/gi) || []).map(h => h.replace(/<[^>]+>/g, '').trim());
    console.log(`[Section ${idx}] ID: ${idMatch ? idMatch[1] : 'none'}, Class: ${classMatch ? classMatch[1] : 'none'}`);
    console.log('  Headings:', headings);
  });

  // Look for main header, footer, classes
  const classes = content.match(/class=["']?([^"'>]+)/gi) || [];
  const uniqueClasses = Array.from(new Set(classes.map(c => c.replace(/class=["']?/i, '')))).slice(0, 30);
  console.log('Sample classes:', uniqueClasses);
}

analyzeFile('Potu___HTML_5_Template_Preview.html');
analyzeFile('Potu___Landing_Page.html');
