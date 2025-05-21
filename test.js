const fs = require('fs');
const assert = require('assert');

const html = fs.readFileSync('index.html', 'utf8');
const match = /id="total-questions">\s*0\s*<\/span>/.test(html);
assert(match, 'placeholder for total questions should be 0');
console.log('All tests passed');
