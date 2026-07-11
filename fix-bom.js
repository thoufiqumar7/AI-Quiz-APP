const fs = require('fs');

['server', 'client'].forEach(dir => {
  const p = `D:/AI-QUIZ-APP/${dir}/package.json`;
  let c = fs.readFileSync(p, 'utf8');
  if (c.charCodeAt(0) === 0xFEFF) {
    c = c.slice(1);
    console.log(dir + ' BOM stripped');
  } else {
    console.log(dir + ' no BOM found');
  }
  fs.writeFileSync(p, c, 'utf8');
});
