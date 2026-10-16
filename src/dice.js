const PPDice = (() => {
  const layout=[{n:1,x:0,y:0},{n:6,x:0,y:180},{n:3,x:0,y:90},{n:4,x:0,y:-90},{n:2,x:90,y:0},{n:5,x:-90,y:0}];
  const dots={1:[[1,1]],2:[[0,0],[2,2]],3:[[0,0],[1,1],[2,2]],4:[[0,0],[0,2],[2,0],[2,2]],5:[[0,0],[0,2],[1,1],[2,0],[2,2]],6:[[0,0],[0,2],[1,0],[1,2],[2,0],[2,2]]};
  const orientations={1:[0,0],2:[-90,0],3:[0,-90],4:[0,90],5:[90,0],6:[0,180]};
  let x=-20,y=-25,animation=null,timer=null,serial=0;
  let cube,audio=null,sources=[];
  function stopSound(){for(const node of sources){try{node.stop();}catch{}}sources=[];}
  function sound(token,duration){
    try{
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      audio ||= new Audio();
      const play=()=>{if(token!==serial||audio.state!=='running')return;
        const length=Math.floor(audio.sampleRate*.075),buffer=audio.createBuffer(1,length,audio.sampleRate),data=buffer.getChannelData(0);
        for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*Math.exp(-i/(length*.16));
        const hits=duration<200?[0,.065]:[0,.06,.135,.225,.335,.47,.63,.81,1.01,1.18];
        for(const [i,offset] of hits.entries()){
          const t=audio.currentTime+offset,source=audio.createBufferSource(),filter=audio.createBiquadFilter(),gain=audio.createGain();
          source.buffer=buffer;source.playbackRate.value=1.15-i*.035;filter.type='bandpass';filter.frequency.value=1700-i*90;filter.Q.value=.65;
          gain.gain.setValueAtTime(.65*(1-i/(hits.length+2)),t);gain.gain.exponentialRampToValueAtTime(.001,t+.075);
          source.connect(filter).connect(gain).connect(audio.destination);source.start(t);sources.push(source);
          const thud=audio.createOscillator(),low=audio.createGain();thud.type='triangle';thud.frequency.setValueAtTime(230,t);thud.frequency.exponentialRampToValueAtTime(95,t+.055);low.gain.setValueAtTime(.13,t);low.gain.exponentialRampToValueAtTime(.001,t+.06);thud.connect(low).connect(audio.destination);thud.start(t);thud.stop(t+.07);sources.push(thud);
          source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};thud.onended=()=>{thud.disconnect();low.disconnect();};
        }
      };
      if(audio.state==='running')play();else audio.resume().then(play).catch(()=>{});
    }catch{/* A device without audio support still rolls normally. */}
  }
  const transform=(a,b)=>`rotateX(${a}deg) rotateY(${b}deg)`;
  function init(el){cube=el;for(const face of layout){const node=document.createElement('div');node.className='face';node.dataset.face=face.n;node.style.transform=`rotateX(${face.x}deg) rotateY(${face.y}deg) translateZ(calc(var(--cube-size) / 2))`;for(const [r,c] of dots[face.n]){const dot=document.createElement('span');dot.className='pip';dot.style.gridRow=r+1;dot.style.gridColumn=c+1;node.append(dot);}cube.append(node);}cube.style.transform=transform(x,y);}
  function cancel(){serial++;stopSound();clearTimeout(timer);if(animation){animation.onfinish=null;animation.cancel();animation=null;}}
  function reset(result=0){cancel();[x,y]=result?orientations[result]:[-20,-25];cube.style.transform=transform(x,y);cube.setAttribute('aria-label',result?'Ζάρι: '+result:'Τρισδιάστατο ζάρι');}
  function roll(result,complete){cancel();const token=serial;const a=orientations[result];const endX=Math.ceil(x/360)*360+720+a[0],endY=Math.ceil(y/360)*360+1080+a[1];const begin=transform(x,y),end=transform(endX,endY);const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const duration=reduce?120:1250;sound(token,duration);
    let finished=false;const finish=()=>{if(finished||token!==serial)return;finished=true;x=endX;y=endY;cube.style.transform=end;if(animation){animation.onfinish=null;animation.cancel();animation=null;}cube.setAttribute('aria-label','Ζάρι: '+result);complete();};
    if(!reduce&&cube.animate){animation=cube.animate([{transform:begin},{transform:end}],{duration,easing:'cubic-bezier(.16,.65,.22,1)',fill:'forwards'});animation.onfinish=finish;}else{cube.style.transform=end;}
    timer=setTimeout(finish,duration+40);
  }
  return {init,reset,roll,cancel};
})();
