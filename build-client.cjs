const fs = require('fs');
const path = require('path');

const dir = __dirname;

const jpg = fs.readFileSync(path.join(dir, 'preset-wallpaper.jpg'));
const b64 = jpg.toString('base64');

const cardCss = fs.readFileSync(path.join(dir, 'plugin-card.css'), 'utf8');

let template = fs.readFileSync(path.join(dir, 'client.template.js'), 'utf8');
if (!template.includes('__PRESET_BASE64__') || !template.includes('__PLUGIN_CARD_CSS__')) {
  console.error('template missing placeholders');
  process.exit(1);
}
template = template.split('__PRESET_BASE64__').join(b64);
if (/["\\]/.test(cardCss)) {
  console.error('card css contains unsafe characters');
  process.exit(1);
}
template = template.split('__PLUGIN_CARD_CSS__').join(cardCss);

fs.writeFileSync(path.join(dir, 'lib', 'client.js'), template);
console.log('wrote lib/client.js (' + Math.round(template.length / 1024) + ' KB, preset b64 ' + Math.round(b64.length / 1024) + ' KB, card css ' + cardCss.length + ' chars)');
