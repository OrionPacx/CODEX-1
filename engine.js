/* Browser-only scheduling engine. State is supplied by app.js and never sent anywhere. */
(function(){
  const clone = o => JSON.parse(JSON.stringify(o));
  const pad = n => String(n).padStart(2,'0');
  function time(n){ n=((n%1440)+1440)%1440; let h=Math.floor(n/60),m=n%60, suffix=n>=720?' PM':' AM'; h=h%12||12; return h+':'+pad(m)+suffix; }
  function category(block){return block.type||'activity'}
  function configFor(state,id){return state.edits[id]||{}}
  function calc(day,state){
    const previous=state.before||{}; let cursor=null, free=[]; const blocks=[];
    day.schedule.forEach(source=>{
      const edit=configFor(state,source.id); let duration=edit.duration==null?source.originalDuration:edit.duration;
      const removed=!!edit.removed; let start=source.originalStart;
      if(cursor!==null && source.flexibility!=='fixed') start=Math.max(start,cursor);
      if(edit.start!=null && source.flexibility!=='fixed') start=edit.start;
      let end=start+duration;
      if(source.flexibility==='fixed' && cursor!==null && cursor>start) {
        // Fixed items cannot move: retain their original time and report the collision below.
        end=source.originalEnd;
      }
      if(!removed && cursor!=null && start>cursor+30) free.push({start:cursor,end:start,duration:start-cursor});
      const result={...clone(source),...edit,currentStart:start,currentEnd:end,currentDuration:duration,removed,changed:start!==source.originalStart||duration!==source.originalDuration||removed,ghost:source.originalStart!==start?time(source.originalStart):null};
      blocks.push(result); if(!removed) cursor=Math.max(cursor==null?0:cursor,end);
    });
    return {blocks,free,end:cursor};
  }
  function health(day,result,state){
    const alerts=[]; const active=result.blocks.filter(x=>!x.removed);
    for(const block of active){
      if(block.currentDuration>120 && (block.type==='talk'||/mun|chat|ceremony/i.test(block.title))) alerts.push({rule:'R2',level:'bad',text:`${block.title} is longer than 120 minutes of seated/listening time.`});
      if(block.setting==='outdoor' && state.weather!=='normal' && !day.backups) alerts.push({rule:'R6',level:'bad',text:`${block.title} needs a visible weather Plan B.`});
      if(block.minDuration>0 && block.currentDuration<block.minDuration) alerts.push({rule:'Minimum',level:'bad',text:`${block.title} is shorter than its minimum duration.`});
    }
    const lunch=active.find(x=>/lunch/i.test(x.title)); if(lunch && (lunch.currentStart<720||lunch.currentEnd>840)) alerts.push({rule:'R1',level:'bad',text:'Lunch must begin no earlier than 12:00 PM and end no later than 2:00 PM.'});
    const end=result.end||0, limit=state.dayEnd||1320; if(end>limit) alerts.push({rule:'R4',level:'bad',text:`Overrun: the day ends ${time(end)}, beyond the ${time(limit)} limit.`});
    result.free.filter(x=>x.duration>30).forEach(x=>alerts.push({rule:'R5',level:'bad',text:`An unlabelled ${x.duration}-minute gap opens at ${time(x.start)}.`}));
    const rest=active.find(x=>/rest and freshen/i.test(x.title));const evening=active.find(x=>x.currentStart>=1080&&/night|chat|ceremony|stairs|showcase/i.test(x.title));if(rest&&evening&&evening.currentStart-rest.currentEnd<60)alerts.push({rule:'R7',level:'bad',text:'Less than 60 minutes of rest remains before the evening programme.'});
    if(!alerts.length)alerts.push({rule:'Healthy',level:'good',text:'This day meets the active timing checks.'});
    return alerts;
  }
  function apply(state,operation){
    const next=clone(state); next.edits=next.edits||{}; const id=operation.id; const prior=clone(next.edits[id]||{});
    if(operation.kind==='reset-block') delete next.edits[id];
    else if(operation.kind==='extend'||operation.kind==='shorten') {let base=operation.block.originalDuration;let current=prior.duration==null?base:prior.duration;next.edits[id]={...prior,duration:Math.max(operation.block.minDuration,current+(operation.kind==='extend'?operation.minutes:-operation.minutes))};}
    else if(operation.kind==='delay') next.edits[id]={...prior,start:(prior.start==null?operation.block.originalStart:prior.start)+operation.minutes};
    else if(operation.kind==='remove') next.edits[id]={...prior,removed:true};
    else if(operation.kind==='restore') next.edits[id]={...prior,removed:false};
    else if(operation.kind==='replace') next.edits[id]={...prior,replacement:operation.substitute.title,duration:operation.substitute.defaultDuration,substitute:operation.substitute};
    next.log=(next.log||[]).concat(operation.label||`${operation.kind} ${id}`); return next;
  }
  function weekly(data,state){return data.days.map(day=>{const plan=calc(day,state);return {day,plan,health:health(day,plan,state)}})}
  window.CampEngine={time,calc,health,apply,weekly,category};
})();

