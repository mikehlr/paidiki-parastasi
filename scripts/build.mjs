import {readFile,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>readFile(path.join(root,p),'utf8');
const manifest=JSON.parse(await read('assets/cards/manifest.json'));
const reference=await read('Paidiki_Parastasi.prototype.html');
const expected=JSON.parse(reference.match(/const CARDS=([\s\S]*?);\nconst META/)[1]);
const cards={blue:[],green:[],red:[]};
for(const color of Object.keys(cards)){
 const entries=manifest.filter(c=>c.color===color).sort((a,b)=>a.index-b.index);
 if(entries.length!==100 || entries.some((e,i)=>e.title!==expected[color][i].t))throw Error('The original deck must remain unchanged: '+color);
 for(const c of entries){const bytes=await readFile(path.join(root,'assets/cards',c.id+'.webp'));cards[color].push({id:c.id,t:c.title,image:'data:image/webp;base64,'+bytes.toString('base64')});}
}
const scenes={};for(const theme of ['stage','nature','magic']){scenes[theme]='data:image/webp;base64,'+(await readFile(path.join(root,'assets/themes',theme+'.webp'))).toString('base64');}
const css=(await Promise.all(['base.css','themes.css','responsive.css','polish.css'].map(n=>read('src/'+n)))).join('\n');
const scripts=(await Promise.all(['storage.js','game.js','dice.js','app.js'].map(n=>read('src/'+n)))).join('\n');
const js='"use strict";\nconst CARDS='+JSON.stringify(cards)+';\nconst SCENES='+JSON.stringify(scenes)+';\n'+scripts;
const html=(await read('src/index.html')).replace('/* STYLES */',css).replace('/* SCRIPTS */',js.replace(/<\/script/gi,'<\\/script'));
if(/(?:src|href)=["']https?:/i.test(html)||/@import\s/i.test(css))throw Error('Runtime network dependencies are not permitted');
await mkdir(path.join(root,'dist'),{recursive:true});
await writeFile(path.join(root,'dist/Paidiki_Parastasi.html'),html);
await writeFile(path.join(root,'dist/index.html'),html);
console.log(JSON.stringify({cards:300,themes:4,standalone:true,bytes:Buffer.byteLength(html),output:'dist/Paidiki_Parastasi.html'}));
