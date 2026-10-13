const PPGame = (() => {
  const COLORS = ['blue','green','red'];
  const blank = () => ({version:3,players:[],current:0,phase:'roll',result:0,card:null,used:{blue:[],green:[],red:[]}});
  const normalize = raw => {
    const state = blank(); if (!raw || typeof raw !== 'object') return state;
    if(Array.isArray(raw.players) && raw.players.length>=2 && raw.players.length<=6 && raw.players.every(p=>typeof p==='string' && p.trim())) state.players=raw.players.map(p=>p.trim().slice(0,24));
    if(state.players.length && Number.isInteger(raw.current) && raw.current>=0 && raw.current<state.players.length) state.current=raw.current;
    for(const color of COLORS) { const values=Array.isArray(raw.used?.[color])?raw.used[color]:[];
      state.used[color]=[...new Set(values.map(v=>raw.legacy && Number.isInteger(v) ? CARDS[color][v]?.id : v).filter(v=>typeof v==='string' && CARDS[color].some(c=>c.id===v)))];
    }
    if(state.players.length && Number.isInteger(raw.result) && raw.result>=1 && raw.result<=6 && ['select','card'].includes(raw.phase)) {
      state.result=raw.result;state.phase='select';
      if(raw.phase==='card' && COLORS.includes(raw.card?.color) && CARDS[raw.card.color].some(c=>c.id===raw.card.id)) {
        state.phase='card';state.card={color:raw.card.color,id:raw.card.id};
        if(!state.used[state.card.color].includes(state.card.id))state.used[state.card.color].push(state.card.id);
      }
    }
    return state;
  };
  const start=(state,names)=>{if(!Array.isArray(names)||names.length<2||names.length>6)return false;state.players=names.map((n,i)=>String(n).trim().slice(0,24)||'Παίκτης '+(i+1));state.current=0;state.phase='roll';state.result=0;state.card=null;return true;};
  const rolled=(state,n)=>{if(state.phase!=='roll'||!state.players.length||!Number.isInteger(n)||n<1||n>6)return false;state.phase='select';state.result=n;return true;};
  const draw=(state,color,random=Math.random)=>{if(state.phase!=='select'||!COLORS.includes(color))return null;
    if(state.used[color].length>=CARDS[color].length)state.used[color]=[];
    const choices=CARDS[color].filter(c=>!state.used[color].includes(c.id));
    const card=choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))];
    if(!card)return null;state.used[color].push(card.id);state.card={color,id:card.id};state.phase='card';return card;
  };
  const next=state=>{if(state.phase!=='card'||!state.players.length)return false;state.current=(state.current+1)%state.players.length;state.phase='roll';state.result=0;state.card=null;return true;};
  return {COLORS,blank,normalize,start,rolled,draw,next};
})();
