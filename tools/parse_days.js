/* Run with Node only when the supplied Day*.txt files are available. The site itself never needs Node. */
const fs = require('fs'), path = require('path');
const sourceDir = process.env.CAMP_SOURCE_DIR || 'C:\\Users\\Aditya\\Downloads';
const names = ['Day1.txt','Day2.txt','Day3.txt','Day4.txt','Day5 (1).txt','Day6.txt','Day7.txt'];
const clean = s => s.replace(/\r/g, '').trimEnd();
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const heading = line => (/^(NEEDS\b|PLACE IDEAS\b|EXTRAS OUR CLUB CAN ADD\b|SCHEDULE|[A-Z][A-Z0-9 /&:'-]{3,}(?:\s*\([^)]*\))?|DAY \d+ STAMPS.*)$/i.test(line)) &&
  (line === line.toUpperCase() || /^DAY \d+ STAMPS|^NEEDS\b|^PLACE IDEAS\b|^EXTRAS OUR CLUB CAN ADD\b/i.test(line));
function parseTime(value, previous) {
  const m = value.match(/(\d{1,2}):(\d{2})/); if (!m) return null;
  let v = (+m[1] % 12) * 60 + +m[2];
  if (previous != null && v + 180 < previous) v += 720;
  return v;
}
function duration(start, end) { let d = end - start; if (d <= 0) d += 720; return d; }
function parseSchedule(lines, day) {
  const i = lines.findIndex(x => /^TIME\s*\|/i.test(x)); if (i < 0) return [];
  let last = null, result = [];
  for (let n = i + 1; n < lines.length; n++) {
    const row = lines[n]; if (!row.includes('|') || !/^\s*\d/.test(row)) break;
    const [time, title, ...description] = row.split('|').map(x => x.trim());
    const pieces = time.match(/(\d{1,2}:\d{2})\s*(?:-|to)\s*(\d{1,2}:\d{2})/);
    let start = parseTime(time, last), end = pieces ? parseTime(pieces[2], start) : start;
    if (start == null) continue; if (pieces && end != null && end <= start) end += 720;
    const name = title || time;
    result.push({id:`d${day}-${slug(name)}`,day,title:name,time,originalStart:start,originalEnd:end,originalDuration:end == null ? 0 : end-start,description:description.join(' | ')});
    last = start;
  }
  return result;
}
function parseSections(lines) {
  const sections = [], buckets = {}; let current = null;
  for (const line of lines) {
    if (heading(line.trim())) { current = {title:line.trim(), body:[]}; sections.push(current); continue; }
    if (current) current.body.push(line);
  }
  sections.forEach(s => { buckets[s.title] = s.body.join('\n').trim(); });
  return {sections,buckets};
}
function extractStamps(raw, day) {
  let match;
  if (day === 1) match = raw.match(/Day 1 stamps \(9 designs\) and who wins them:\s*\n([\s\S]*)$/i);
  else if (day === 6) match = raw.match(/Two new stamps for the passports[^\n]*\n([\s\S]*?)(?=\n- Summit Photo Challenge)/i);
  else match = raw.match(new RegExp(`(?:^|\\n)DAY ${day} STAMPS[^\\n]*\\n([\\s\\S]*?)(?=\\n(?:Content for|BACKUPS AND PLAN B)|$)`, 'i'));
  return match ? (match[1].match(/^\s*\d+\.\s+.+$/gm) || []).map(x => x.trim()) : [];
}
function infer(block) {
  const t = block.title.toLowerCase();
  let type='activity', flexibility='movable', priority='should', setting='either', energy='medium';
  if (/breakfast|lunch|dinner|gala/.test(t)) {type='meal'; flexibility=t.includes('breakfast')?'fixed':'movable';}
  if (/free time|walk|break|freshen|rest|cool-down|water/.test(t)) {type='buffer';flexibility='buffer';priority='could';energy='low';}
  if (/fixed:|back to hostels/.test(t)) {type='fixed';flexibility='fixed';priority='must';}
  if (/guest|fireside/.test(t)) {type='talk'; flexibility='anchored'; priority='must'; energy='low';}
  if (/moon|sports|league|relay|tug|procession|stairs|rocket/.test(t)) setting='outdoor';
  if (/mun|trailer|dance|dj|studio|quiz|ceremony|street-food|cook-off|festival/.test(t)) setting='indoor';
  if (/dj|league|relay|dance|tug|quest/.test(t)) energy='high';
  if (/flex/.test(t)) {type='conditional';flexibility='buffer';priority='could';}
  const min=block.originalDuration===0?0:Math.max(5, Math.round((block.originalDuration||30) * (flexibility==='buffer' ? .15 : .5)));
  return {...block,type,flexibility,priority,setting,energy,minDuration:min,maxDuration:Math.max(block.originalDuration||30,(block.originalDuration||30)*2),isTalk:type==='talk',listeningMinutes:type==='talk'?(block.originalDuration||0):0,condition:/rocket/.test(t)?'day2RocketRainedOut':/moon telescope/.test(t)?'day2MoonCloudy':null,feeds:/movie trailer/i.test(t)?['d5-red-carpet-trailer-premiere']:[]};
}
const days = names.map((name,index) => {
  const raw = clean(fs.readFileSync(path.join(sourceDir,name),'utf8')); const lines=raw.split('\n');
  const title=lines.find(x=>/^DAY \d+:/i.test(x)) || `DAY ${index+1}`;
  const teamLine=(lines.find(x=>/^Teams:/i.test(x))||'').trim(); const parsed=parseSections(lines);
  const schedule=parseSchedule(lines,index+1).map(infer);
  const stamps = extractStamps(raw, index+1);
  const faculty = (()=>{const m=raw.match(/LIKELY FACULTY QUESTIONS\s*\n([\s\S]*?)(?=\nTalk sessions used:|$)/i);return m?(m[1].match(/^- .+$/gm)||[]):[]})();
  const counters=(raw.match(/^(?:Talk sessions used:|Placed so far:).+$/gm)||[]);
  const backups=parsed.sections.find(s=>/BACKUPS AND PLAN B/i.test(s.title));
  const needs=parsed.sections.find(s=>/^NEEDS/i.test(s.title));
  return {id:index+1,title,teamLine,raw,schedule,sections:parsed.sections,stamps,faculty,counters,backups:backups&&backups.body.join('\n').trim(),needs:needs&&needs.body.join('\n').trim(),isManagementDay:index===5};
});
fs.mkdirSync(path.join(__dirname,'..','data'),{recursive:true});
fs.writeFileSync(path.join(__dirname,'..','data','days.generated.json'),JSON.stringify(days,null,2));
console.log(`Parsed ${days.length} day files and ${days.reduce((n,d)=>n+d.schedule.length,0)} schedule rows.`);

