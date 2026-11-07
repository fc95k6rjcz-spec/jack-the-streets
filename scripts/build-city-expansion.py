"""Embed the editable game expansions in a deterministic order."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'index.html'
s=p.read_text()
modules=[('CITY EXPANSION','city-expansion.inc.js'),('SPECIALTY WORKSHOPS','workshop.inc.js')]
for name,file in modules:
 begin='// '+name+' BEGIN';end='// '+name+' END'
 if begin in s:
  a=s.index(begin);b=s.index(end,a)+len(end)+1;s=s[:a]+s[b:]
blocks=[]
for name,file in modules:
 if (root/file).exists():blocks.append('// '+name+' BEGIN\n'+(root/file).read_text()+'\n// '+name+' END\n')
s=s.replace('bootComicGame();\nrequestAnimationFrame(frame);',''.join(blocks)+'bootComicGame();\nrequestAnimationFrame(frame);')
p.write_text(s)
