const PPStorage = (() => {
  const KEY = 'paidiki-parastasi-session-v3';
  const THEME = 'paidiki-parastasi-theme-v1';
  let available = true;
  const read = key => { try { return localStorage.getItem(key); } catch { available = false; return null; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); return true; } catch { available = false; return false; } };
  const parse = value => { try { return JSON.parse(value); } catch { return null; } };
  return {
    load() { const current = parse(read(KEY)); if (current && current.version === 3) return current;
      const legacyPlayers = parse(read('paidiki-parastasi-players-v2'));
      const legacyUsed = parse(read('paidiki-parastasi-used-v1'));
      return {version:3, players:Array.isArray(legacyPlayers?.players)?legacyPlayers.players.map(p=>p?.name):[], current:legacyPlayers?.current, used:legacyUsed, legacy:true};
    },
    save(state) { return write(KEY, JSON.stringify(state)); },
    theme() { const t=read(THEME); return ['simple','stage','nature','magic'].includes(t) ? t : 'simple'; },
    dice() { const d=read('paidiki-parastasi-dice-v1'); return ['theme','red','ivory','blue','wood'].includes(d)?d:'theme'; },
    setDice(dice) { return write('paidiki-parastasi-dice-v1', dice); },
    setTheme(theme) { return write(THEME, theme); },
    restart(state) { this.save(state); for(const key of ['paidiki-parastasi-players-v2','paidiki-parastasi-used-v1'])try{localStorage.removeItem(key);}catch{available=false;} },
    available() { return available; }
  };
})();
