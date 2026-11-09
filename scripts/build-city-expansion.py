"""Embed the editable game expansions in a deterministic order."""
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'index.html'
s=p.read_text(encoding='utf-8')
modules=[('CITY EXPANSION','city-expansion.inc.js'),('SUBURBAN NEIGHBOURHOODS','suburbs.inc.js'),('URBAN NEIGHBOURHOODS','urban.inc.js'),('SPECIALTY WORKSHOPS','workshop.inc.js'),('READABLE MESSAGES','hud-messages.inc.js'),('OFFICER VEHICLE CLEARANCE','officer-vehicles.inc.js'),('SHOWROOM REDESIGN','showroom.inc.js'),('SIGNATURE CAR DESIGNS','signature-wraps.inc.js'),('HOME IMPROVEMENTS','room-upgrades.inc.js'),('BANK MANHUNT','bank-heat.inc.js'),('MODEL ENGINE AUDIO','engine-audio.inc.js'),('CAR DEALERSHIPS','dealerships.inc.js'),('BOUTIQUE INTERIORS','boutique.inc.js'),('RENDERED CUTAWAY SCENES','cutaway-scenes.inc.js'),('COASTAL ART DIRECTION','coastal-art-direction.inc.js'),('NORTHERN BEACHES PENINSULA','peninsula.inc.js'),('CHARACTER ACTIONS','character-actions.inc.js'),('AIR SUPPORT FLEET','air-support.inc.js'),('WORKSHOP PROPERTY','workshop-estate.inc.js'),('FULL FLEET DATA','fleet-200-data.inc.js'),('FLEET ART MANIFEST','fleet-detail-manifest.inc.js'),('FULL FLEET INTEGRATION','fleet-200.inc.js'),('WEAPON HOLSTER','weapon-holster.inc.js'),('SEAMLESS WORKSHOP','seamless-workshop.inc.js'),('VEHICLE DAMAGE','vehicle-damage.inc.js'),('SMARTPHONE APPS','phone-apps.inc.js')]

missing=[file for _,file in modules if not (root/file).is_file()]
if missing: raise SystemExit('Missing required game modules: '+', '.join(missing))

for name,file in modules:
 begin='// '+name+' BEGIN';end='// '+name+' END'
 if begin in s:
  a=s.index(begin);b=s.index(end,a)+len(end)+1;s=s[:a]+s[b:]
blocks=[]
for name,file in modules:
 blocks.append('// '+name+' BEGIN\n'+(root/file).read_text(encoding='utf-8')+'\n// '+name+' END\n')
s=s.replace('bootComicGame();\nrequestAnimationFrame(frame);',''.join(blocks)+'bootComicGame();\nrequestAnimationFrame(frame);')
with p.open('w',encoding='utf-8',newline='\n') as output:
 output.write(s)
