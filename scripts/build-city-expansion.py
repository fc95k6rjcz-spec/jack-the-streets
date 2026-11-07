"""Embed the editable game expansions in a deterministic order."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'index.html'
s=p.read_text(encoding='utf-8')
modules=[('CITY EXPANSION','city-expansion.inc.js'),('SUBURBAN NEIGHBOURHOODS','suburbs.inc.js'),('URBAN NEIGHBOURHOODS','urban.inc.js'),('SPECIALTY WORKSHOPS','workshop.inc.js'),('READABLE MESSAGES','hud-messages.inc.js'),('OFFICER VEHICLE CLEARANCE','officer-vehicles.inc.js')]

for name,file in modules:
 begin='// '+name+' BEGIN';end='// '+name+' END'
 if begin in s:
  a=s.index(begin);b=s.index(end,a)+len(end)+1;s=s[:a]+s[b:]
blocks=[]
for name,file in modules:
 if (root/file).exists():blocks.append('// '+name+' BEGIN\n'+(root/file).read_text(encoding='utf-8')+'\n// '+name+' END\n')
s=s.replace('bootComicGame();\nrequestAnimationFrame(frame);',''.join(blocks)+'bootComicGame();\nrequestAnimationFrame(frame);')
with p.open('w',encoding='utf-8',newline='\n') as output:
 output.write(s)
