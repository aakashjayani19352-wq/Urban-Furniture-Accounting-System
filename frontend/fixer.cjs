const fs = require('fs');
const path = require('path');
function fix(dir) {
  for (let f of fs.readdirSync(dir)) {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) fix(p);
    else if (p.endsWith('.jsx') || p.endsWith('.js')) {
      let t = fs.readFileSync(p, 'utf8');
      if (t.endsWith('\\n')) {
        fs.writeFileSync(p, t.slice(0, -2));
        console.log('Fixed', p);
      }
    }
  }
}
fix('./src');
console.log('Done');
