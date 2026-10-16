(() => {
  const $=id=>document.getElementById(id);
  const META={blue:{name:'Αντικείμενα',instruction:'Δείξε το αντικείμενο χωρίς να πεις τη λέξη!'},green:{name:'Ζώα',instruction:'Μιμήσου το ζώο με κινήσεις και ήχους!'},red:{name:'Ενέργειες',instruction:'Δείξε την ενέργεια χωρίς να πεις τη λέξη!'}};
  const PAWNS=['#e95159','#39a568','#328fda','#edbc36','#9662cd','#ee8d39'];
  const COLORS=['Κόκκινο','Πράσινο','Μπλε','Κίτρινο','Μωβ','Πορτοκαλί'];
  let state=PPGame.normalize(PPStorage.load()),busy=false,count=2,generation=0,pawnId=0,doneLock=0;
  const draft=Array(6).fill('');
  if(state.players.length){count=state.players.length;state.players.forEach((n,i)=>draft[i]=n);}
  function pawn(index){const id='pawn-'+(++pawnId),color=PAWNS[index];const holder=document.createElement('span');holder.innerHTML=`<svg class="pawn" viewBox="0 0 42 64" role="img" aria-label="${COLORS[index]} πιόνι"><defs><linearGradient id="${id}" x2=".8" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity=".8"/></linearGradient></defs><ellipse cx="21" cy="57" rx="17" ry="4" fill="#16273822"/><path d="M13 29Q9 42 6 51c-2 9 32 9 30 0L29 29Z" fill="url(#${id})" stroke="${color}" stroke-width="2"/><circle cx="21" cy="17" r="12" fill="url(#${id})" stroke="${color}" stroke-width="2"/><ellipse cx="17" cy="13" rx="5" ry="4" fill="#fff" opacity=".38"/><path d="M13 36 9 50" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".25"/></svg>`;return holder.firstElementChild;}
  function fields(){document.querySelectorAll('#player-fields input').forEach((input,i)=>draft[i]=input.value);$('player-count').replaceChildren();for(let n=2;n<=6;n++){const button=document.createElement('button');button.type='button';button.textContent=n;button.setAttribute('aria-label',n+' παίκτες');button.setAttribute('aria-pressed',String(n===count));button.onclick=()=>{count=n;fields();};$('player-count').append(button);}
    $('player-fields').replaceChildren();for(let i=0;i<count;i++){const label=document.createElement('label');label.className='player-field';label.append(pawn(i));const input=document.createElement('input');input.name='player-'+(i+1);input.placeholder='Παίκτης '+(i+1);input.setAttribute('aria-label','Όνομα παίκτη '+(i+1));input.autocomplete='off';input.maxLength=24;input.value=draft[i];label.append(input);$('player-fields').append(label);}
  }
  function save(){PPStorage.save(state);}
  function settingsStatus(){const lines=PPGame.COLORS.map(c=>META[c].name+': '+(CARDS[c].length-state.used[c].length)+' διαθέσιμες');$('deck-status').textContent=lines.join('\n');$('storage-status').textContent=PPStorage.available()?'Η πρόοδος αποθηκεύεται σε αυτή τη συσκευή.':'Η πρόοδος διατηρείται μόνο όσο η σελίδα μένει ανοιχτή.';$('reset-cards').disabled=busy||state.phase==='card';}
  function render(){const playing=state.players.length>0;document.body.dataset.screen=playing?'game':'setup';document.body.dataset.phase=state.phase;$('setup').hidden=playing;$('game').hidden=!playing;if(!playing){settingsStatus();return;}
    $('game').setAttribute('aria-busy',String(busy));$('roster').style.setProperty('--player-count',state.players.length);$('roster').replaceChildren();state.players.forEach((name,i)=>{const li=document.createElement('li');if(i===state.current){li.className='active';li.setAttribute('aria-current','true');}li.append(pawn(i));const label=document.createElement('span');label.className='player-label';label.textContent=name;label.title=name;li.append(label);$('roster').append(li);});$('active-name').textContent=state.players[state.current];
    $('dice-result').textContent=state.result?String(state.result):'';
    $('roll').disabled=busy||state.phase==='card';
    $('roll').setAttribute('aria-label',busy?'Το ζάρι κυλάει':state.result?'Ξαναρίξε το ζάρι. Προηγούμενο αποτέλεσμα: '+state.result:'Ρίξε το ζάρι');
    $('dice-hint').textContent=busy?'Το ζάρι κυλάει…':state.result?'Πάτησε το ζάρι για νέα ρίψη':'Πάτησε το ζάρι για να το ρίξεις';$('dice-hint').hidden=state.phase==='card';
    $('category-view').hidden=state.phase==='card';$('card-view').hidden=state.phase!=='card';
    $('step-label').textContent=state.phase==='select'?'Τώρα το χρώμα':'Πρώτα το ζάρι';$('category-heading').textContent=state.phase==='select'?'Σε ποιο χρώμα έφτασες;':'Ρίξε το ζάρι.';$('board-hint').textContent=state.phase==='select'?'Διάλεξε το χρώμα της θέσης στο πραγματικό ταμπλό.':'Μετά μετακίνησε το πιόνι σου στο ταμπλό.';
    document.querySelectorAll('[data-color]').forEach(b=>b.disabled=busy||state.phase!=='select');
    if(state.phase==='card'){const c=CARDS[state.card.color].find(c=>c.id===state.card.id);$('card').className='card '+state.card.color;$('card-category').textContent=META[state.card.color].name.toLocaleUpperCase('el-GR');$('card-image').src=c.image;$('card-image').alt=c.t;$('card-title').textContent=c.t;$('card-instruction').textContent=META[state.card.color].instruction;$('done').disabled=performance.now()<doneLock;}
    settingsStatus();
  }
  function setTheme(t){if(!['simple','stage','nature','magic'].includes(t))t='simple';document.body.dataset.theme=t;document.querySelectorAll('[data-theme-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.themeChoice===t)));document.querySelector('meta[name=theme-color]').content={simple:'#f7f4ed',stage:'#321224',nature:'#e4ead6',magic:'#162151'}[t];PPStorage.setTheme(t);settingsStatus();}
  function setDice(d){if(!['theme','red','ivory','blue','wood'].includes(d))d='theme';document.body.dataset.dice=d;document.querySelectorAll('[data-dice-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.diceChoice===d)));PPStorage.setDice(d);settingsStatus();}
  document.querySelectorAll('[data-dice-choice]').forEach(b=>b.onclick=()=>setDice(b.dataset.diceChoice));
  function turnStart(){busy=false;generation++;doneLock=0;PPDice.reset(state.result);save();render();}
  $('setup-form').onsubmit=e=>{e.preventDefault();if(PPGame.start(state,[...document.querySelectorAll('#player-fields input')].map(x=>x.value))){turnStart();$('roll').focus({preventScroll:true});}};
  $('roll').onclick=()=>{if(busy||!state.players.length||!['roll','select'].includes(state.phase))return;busy=true;const token=++generation;state.phase='roll';state.result=0;state.card=null;save();render();const result=Math.floor(Math.random()*6)+1;PPDice.roll(result,()=>{if(token!==generation||!state.players.length)return;busy=false;PPGame.rolled(state,result);save();render();});};
  document.querySelectorAll('[data-color]').forEach(button=>button.onclick=()=>{if(busy)return;const card=PPGame.draw(state,button.dataset.color);if(!card)return;doneLock=performance.now()+350;save();render();$('card-title').focus({preventScroll:true});const token=generation;setTimeout(()=>{if(token===generation&&state.phase==='card')$('done').disabled=false;},360);});
  $('done').onclick=()=>{if(busy||performance.now()<doneLock)return;if(PPGame.next(state)){turnStart();$('roll').focus({preventScroll:true});}};
  $('settings-open').onclick=()=>{settingsStatus();$('settings').showModal();};$('settings-close').onclick=()=>$('settings').close();$('settings').onclick=e=>{if(e.target!==$('settings'))return;const r=$('settings').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('settings').close();};
  document.querySelectorAll('[data-theme-choice]').forEach(b=>b.onclick=()=>setTheme(b.dataset.themeChoice));
  $('restart').onclick=()=>{if(!confirm('Επιστροφή στην αρχική οθόνη; Οι παίκτες και οι χρησιμοποιημένες κάρτες θα μηδενιστούν. Το θέμα θα διατηρηθεί.'))return;generation++;busy=false;PPDice.cancel();state=PPGame.blank();PPStorage.restart(state);count=2;draft.fill('');fields();PPDice.reset();render();$('settings').close();};
  $('reset-cards').onclick=()=>{if(busy||state.phase==='card')return;if(confirm('Να ξαναμπούν και οι 300 κάρτες στις τράπουλες;')){state.used={blue:[],green:[],red:[]};save();settingsStatus();}};
  for(const [theme,image] of Object.entries(SCENES)){document.documentElement.style.setProperty('--scene-'+theme,`url("${image}")`);document.querySelector(`[data-scene="${theme}"]`).style.backgroundImage=`url("${image}")`;}
  document.querySelectorAll('[data-art]').forEach(img=>{const id=img.dataset.art;const c=Object.values(CARDS).flat().find(c=>c.id===id);img.src=c.image;});
  PPDice.init($('cube'));fields();setTheme(PPStorage.theme());setDice(PPStorage.dice());turnStart();
  window.PaidikiParastasi=Object.freeze({version:'3.1.0',getState:()=>JSON.parse(JSON.stringify(state))});
})();
