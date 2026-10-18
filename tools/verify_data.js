const fs=require('fs'),path=require('path'),vm=require('vm'); const root=path.join(__dirname,'..');
const sourceDir=process.env.CAMP_SOURCE_DIR||'C:\\Users\\Aditya\\Downloads'; const files=['Day1.txt','Day2.txt','Day3.txt','Day4.txt','Day5 (1).txt','Day6.txt','Day7.txt'];
const code=fs.readFileSync(path.join(root,'data.js'),'utf8');const sandbox={window:{}};vm.runInNewContext(code,sandbox);const packed=JSON.stringify(sandbox.window.CAMP_DATA);
let tests=0, failed=[];function check(label,x){tests++;if(!packed.includes(x))failed.push(`${label}: ${x}`)}
for(const file of files){const raw=fs.readFileSync(path.join(sourceDir,file),'utf8').replace(/\r/g,'');for(const line of raw.split('\n')){if(/^\s*\d/.test(line)&&line.includes('|')){const a=line.split('|').map(x=>x.trim());check(file,a[1]);check(file,a[0])}if(/^\d+\. /.test(line)&&/:/.test(line))check(file,line.trim());if(/^(Talk sessions used:|Placed so far:)/.test(line))check(file,line.trim())}}
console.log(`Verification ${failed.length?'FAILED':'PASSED'}: ${tests-failed.length}/${tests} source checks present.`);if(failed.length){console.log(failed.join('\n'));process.exitCode=1;}

