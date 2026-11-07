"""Build a compact playable geographic base from attributed NSW and GA extracts.
Requires Pillow and Shapely only when regenerating this committed asset.
"""
import json,math,collections,pathlib,sys
from shapely.geometry import shape,box,LineString,Point,Polygon,mapping
from shapely.ops import unary_union,linemerge,polygonize
from PIL import Image,ImageDraw,ImageFilter
root=pathlib.Path(__file__).resolve().parents[1];source=pathlib.Path(sys.argv[1])
WEST,SOUTH,EAST,NORTH=151.14,-33.90,151.34,-33.65;SCALE=8;T=96;MX=111320*math.cos(math.radians((NORTH+SOUTH)/2))*SCALE;MY=111320*SCALE
W=math.ceil((EAST-WEST)*MX/T)*T;H=math.ceil((NORTH-SOUTH)*MY/T)*T;cols=W//T;rows=H//T
project=lambda p:(round((p[0]-WEST)*MX),round((NORTH-p[1])*MY))
bounds=box(WEST,SOUTH,EAST,NORTH)
coast=linemerge([shape(f['geometry']) for f in json.load(open(source/'shore.geojson'))['features']]);ends=[]
for i,g in enumerate(coast.geoms):
 if not g.is_ring:ends.extend([(i,g.coords[0]),(i,g.coords[-1])])
connect=[]
while ends:
 a=ends.pop(0)
 if not ends:break
 b=min(ends,key=lambda p:math.hypot((p[1][0]-a[1][0])*.83,p[1][1]-a[1][1]));distance=math.hypot((b[1][0]-a[1][0])*.83,b[1][1]-a[1][1])
 if distance<.012:connect.append(LineString([a[1],b[1]]));ends.remove(b)
parts=list(polygonize(unary_union([unary_union(list(coast.geoms)+connect).intersection(bounds),bounds.boundary])))
ocean=next(p for p in parts if p.covers(Point(151.335,-33.80)));land=unary_union([p for p in parts if p!=ocean])
water=[]
for f in json.load(open(source/'hydro-all.json'))['features']:
 for ring in f.get('geometry',{}).get('rings',[]):
  p=Polygon(ring).buffer(0).intersection(bounds)
  if not p.is_empty and p.area>0.0000001:water.append(p)
land=land.difference(unary_union(water)).buffer(0)
def polygons(g):return [g] if g.geom_type=='Polygon' else [p for p in getattr(g,'geoms',[]) if p.geom_type=='Polygon']
def projected_ring(r):return [project(p) for p in r.coords]
landPolys=[{'outer':projected_ring(p.exterior),'holes':[projected_ring(r) for r in p.interiors]} for p in polygons(land.simplify(.000015,preserve_topology=True))]
mask=Image.new('L',(cols,rows),0);d=ImageDraw.Draw(mask)
for p in landPolys:
 d.polygon([(x/T,y/T) for x,y in p['outer']],fill=255)
 for ring in p['holes']:d.polygon([(x/T,y/T) for x,y in ring],fill=0)
terrain=Image.new('L',(cols,rows),5);terrain.paste(3,mask=mask)
nearLand=mask.filter(ImageFilter.MaxFilter(3));shallow=Image.eval(nearLand,lambda p:p);shallowDraw=ImageDraw.Draw(shallow)
# Only water at the shore becomes shallow.
for y in range(rows):
 for x in range(cols):
  if mask.getpixel((x,y))==0 and nearLand.getpixel((x,y)):terrain.putpixel((x,y),4)
raw=json.load(open(source/'roads.geojson'))['features'];segments=[];seen=set();names=[];nameIds={}
for f in raw:
 a=f['properties'];hier=a.get('functionhierarchy') or 9
 if hier>6 or a.get('operationalstatus')!=1:continue
 geo=shape(f['geometry']).intersection(bounds)
 for line in ([geo] if geo.geom_type=='LineString' else getattr(geo,'geoms',[])):
  if line.geom_type!='LineString' or line.length<.000015:continue
  points=[project(p) for p in line.simplify(.00002,preserve_topology=False).coords]
  if len(points)<2:continue
  key=tuple(points);reverse=tuple(reversed(points))
  if key in seen or reverse in seen:continue
  seen.add(key)
  name=' '.join(str(a.get(k) or '') for k in ['roadnamebase','roadnametype','roadnamesuffix']).strip();name=' '.join(name.split()).title() or 'Local Road'
  if name not in nameIds:nameIds[name]=len(names);names.append(name)
  kind=1 if hier==1 else 2 if hier<=3 else 3 if hier<=5 else 4
  flag=2 if 'Tunnel' in name else 0
  for (x,y),(xx,yy) in zip(points,points[1:]):
   px=max(0,min(cols-1,int((x+xx)/2/T)));py=max(0,min(rows-1,int((y+yy)/2/T)))
   if terrain.getpixel((px,py))==5 and math.hypot(xx-x,yy-y)>160:flag=flag or 1
  segments.append([points,kind,nameIds[name],flag])
  if hier==6:
   td=ImageDraw.Draw(terrain);td.line([(x/T,y/T) for x,y in points],fill=1,width=7)
# Water always wins over generated residential ground; roads are drawn separately at runtime.
terrain.paste(5,mask=Image.eval(nearLand,lambda p:255-p));terrain.paste(4,mask=Image.eval(mask,lambda p:255-p))
# Restore deep water beyond the one-cell shore.
terrain.paste(5,mask=Image.eval(nearLand,lambda p:255-p))
nodeMap={};nodes=[];edges=[]
def node(p):
 key=(round(p[0]/2)*2,round(p[1]/2)*2)
 if key not in nodeMap:nodeMap[key]=len(nodes);nodes.append(key)
 return nodeMap[key]
for pts,kind,name,flag in segments:
 u=node(pts[0]);v=node(pts[-1])
 if u!=v:edges.append([u,v,kind,name,flag,pts])
adj=[[] for _ in nodes]
for i,e in enumerate(edges):adj[e[0]].append(i);adj[e[1]].append(i)
visited=set();components=[]
for n in range(len(nodes)):
 if n in visited:continue
 stack=[n];visited.add(n);comp=[]
 while stack:
  u=stack.pop();comp.append(u)
  for ei in adj[u]:
   e=edges[ei];v=e[1] if e[0]==u else e[0]
   if v not in visited:visited.add(v);stack.append(v)
 components.append(comp)
keep=set(max(components,key=len));edges=[e for e in edges if e[0] in keep and e[1] in keep]
# Merge degree-two runs only when the name, road class and crossing layer agree.
adj=collections.defaultdict(list)
for i,e in enumerate(edges):adj[e[0]].append(i);adj[e[1]].append(i)
used=set();merged=[]
for i,edge in enumerate(edges):
 if i in used:continue
 used.add(i);u,v,kind,name,flag,pts=edge;pts=list(pts)
 for side in [0,1]:
  cur=u if side==0 else v
  while len(adj[cur])==2:
   choices=[j for j in adj[cur] if j not in used]
   if not choices:break
   j=choices[0];e=edges[j]
   if e[2:5]!=[kind,name,flag]:break
   used.add(j);other=e[1] if e[0]==cur else e[0];p=e[5] if e[0]==cur else list(reversed(e[5]))
   if side==0:pts=list(reversed(p))[0:-1]+pts;u=other
   else:pts+=p[1:];v=other
   cur=other
 merged.append([u,v,kind,name,flag,pts])
active=sorted(set(n for e in merged for n in e[:2]));remap={n:i for i,n in enumerate(active)};outEdges=[]
for u,v,kind,name,flag,pts in merged:outEdges.append([remap[u],remap[v],kind,name,flag,[q for p in pts for q in p]])
values=list(terrain.getdata());rle=[];last=values[0];count=0
for value in values:
 if value!=last:rle.extend([last,count]);last=value;count=0
 count+=1
rle.extend([last,count])
labels=[('Mona Vale',151.303,-33.677),('Terrey Hills',151.228,-33.683),('Ingleside',151.264,-33.685),('Elanora Heights',151.28,-33.701),('Narrabeen',151.297,-33.714),('Belrose',151.208,-33.739),('Oxford Falls',151.251,-33.749),('Cromer',151.278,-33.739),('Collaroy',151.302,-33.732),('Beacon Hill',151.259,-33.755),('Dee Why',151.285,-33.753),('Brookvale',151.271,-33.762),('Curl Curl',151.291,-33.768),('Freshwater',151.287,-33.779),('Frenchs Forest',151.224,-33.751),('Seaforth',151.241,-33.798),('Manly Vale',151.266,-33.787),('Manly',151.285,-33.797),('Balgowlah',151.259,-33.795),('Clontarf',151.253,-33.805),('Roseville',151.177,-33.784),('Castle Cove',151.205,-33.787),('Chatswood',151.181,-33.797),('Mosman',151.245,-33.826),('Neutral Bay',151.22,-33.833),('North Sydney',151.207,-33.837),('Sydney CBD',151.208,-33.872),('Darlinghurst',151.218,-33.88),('Woolloomooloo',151.22,-33.87),('Rose Bay',151.27,-33.871),('Vaucluse',151.277,-33.86),('Watsons Bay',151.283,-33.843),('Bondi',151.276,-33.89),('Garigal Bushland',151.216,-33.714),('Middle Harbour',151.225,-33.813),('Port Jackson',151.259,-33.834),('Tasman Sea',151.329,-33.80)]
output={'version':1,'date':'2026-11-08','bbox':[WEST,SOUTH,EAST,NORTH],'scale':SCALE,'width':W,'height':H,'cols':cols,'rows':rows,'nodes':[nodes[n] for n in active],'roads':outEdges,'names':names,'land':landPolys,'terrain':rle,'labels':[[name,*project((lon,lat))] for name,lon,lat in labels],'credits':'Roads: © State of NSW (Spatial Services). Shoreline: © Commonwealth of Australia (Geoscience Australia) 2016. Adapted for a game; not a navigation product. CC BY 4.0. Extracted 8 November 2026.'}
(root/'assets/northern-beaches-geography.js').write_text('window.JACK_GEOGRAPHY='+json.dumps(output,separators=(',',':'))+';\n')
# An offline numerical mask and review image help audit the source-to-game conversion.
terrain.save(source/'terrain-mask.png');print('world',W,H,'roads',len(outEdges),'nodes',len(active),'components',sorted([len(c) for c in components],reverse=True)[:8],'asset bytes',(root/'assets/northern-beaches-geography.js').stat().st_size)
