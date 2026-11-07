import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {WebSocketServer,WebSocket} from 'ws';

export function createGameServer({port=4174,host='127.0.0.1'}={}){
 const root=path.dirname(fileURLToPath(import.meta.url));
 const rooms=new Map();let sequence=0;
 const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/health'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,players:[...rooms.values()].reduce((n,r)=>n+r.players.size,0)}));return;}
  // Serve only the game and its public assets; never .git, source or server files.
  let relative;try{relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname.slice(1));}catch{res.writeHead(400);res.end('Invalid path');return;}
  if(!/^(index\.html|manifest\.webmanifest|apple-touch-icon\.png|boat-trailer\.png|world-land\.json|private-bay\.js|island-walk\.js|retail-district\.js|interior-renderer\.js|assets\/[a-zA-Z0-9_.-]+)$/.test(relative)){res.writeHead(404);res.end('Not found');return;}
  try{const body=await readFile(path.join(root,relative));const ext=path.extname(relative);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.webmanifest':'application/manifest+json','.webp':'image/webp','.png':'image/png'})[ext]||'application/octet-stream');res.setHeader('X-Content-Type-Options','nosniff');res.end(body);}catch{res.writeHead(404);res.end('Not found');}
 });
 const wss=new WebSocketServer({noServer:true,maxPayload:4096});
 server.on('upgrade',(req,socket,head)=>{const url=new URL(req.url,'http://localhost');let originOK=true;try{if(req.headers.origin)originOK=new URL(req.headers.origin).host===req.headers.host;}catch{originOK=false;}if((process.env.ALLOWED_ORIGINS||'').split(',').filter(Boolean).includes(req.headers.origin))originOK=true;if(url.pathname!=='/open-map'||!originOK){socket.destroy();return;}wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req));});
 const send=(ws,value)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(value));};
 const broadcast=(room,value)=>{for(const p of room.players.values())send(p.ws,value);};
 const snapshot=room=>({type:'snapshot',players:[...room.players.values()].map(p=>({id:p.id,name:p.name,...p.state})),claims:Object.fromEntries(room.claims),completed:[...room.completed]});
 wss.on('connection',ws=>{
  let player=null,room=null,count=0,windowAt=Date.now();
  ws.on('message',data=>{if(Date.now()-windowAt>1000){count=0;windowAt=Date.now();}if(++count>35){ws.close(1008,'Too many messages');return;}let m;try{m=JSON.parse(data.toString());}catch{return;}if(!m||typeof m!=='object'||Array.isArray(m))return;
   if(m.type==='join'&&!player){const city=['nb','syd','home'].includes(m.city)?m.city:'nb';room=rooms.get(city);if(!room){room={players:new Map(),claims:new Map(),completed:new Set()};rooms.set(city,room);}if(room.players.size>=8){send(ws,{type:'error',message:'This map is full (8 drivers).'});ws.close();return;}player={id:String(++sequence),ws,name:String(m.name||'Driver').replace(/[^\p{L}\p{N} _-]/gu,'').slice(0,20)||'Driver',state:{x:500,y:500,a:0,car:'pocket',foot:false,colour:'#35b9a0'},updated:0};room.players.set(player.id,player);send(ws,{...snapshot(room),type:'welcome',id:player.id});broadcast(room,{type:'notice',message:player.name+' joined the map.'});return;}
   if(!player)return;
   if(m.type==='position'){
    if(![m.x,m.y,m.a].every(Number.isFinite)||m.x<0||m.x>11520||m.y<0||m.y>8064||Math.abs(m.a)>10000)return;
    const now=Date.now(),elapsed=(now-player.updated)/1000;if(player.updated&&Math.hypot(m.x-player.state.x,m.y-player.state.y)>Math.max(180,elapsed*1400))return;
    player.state={x:m.x,y:m.y,a:m.a,car:String(m.car||'pocket').replace(/[^a-z0-9]/g,'').slice(0,20),foot:!!m.foot,colour:/^#[0-9a-f]{6}$/i.test(m.colour)?m.colour:'#35b9a0'};player.updated=now;
   }else if(m.type==='claim'){
    if(!/^job-\d{3}$/.test(m.job)||Number(m.job.slice(4))<1||Number(m.job.slice(4))>300)return;
    const existing=room.claims.get(m.job),already=[...room.claims.values()].includes(player.id),ok=!already&&!room.completed.has(m.job)&&!existing;
    if(ok)room.claims.set(m.job,player.id);send(ws,{type:'claim',job:m.job,ok,reason:ok?'':room.completed.has(m.job)?'Another driver has completed that job.':'Another driver already claimed that job.'});broadcast(room,snapshot(room));
   }else if(m.type==='finish'||m.type==='release'){
    if(room.claims.get(m.job)!==player.id)return;room.claims.delete(m.job);if(m.type==='finish')room.completed.add(m.job);broadcast(room,snapshot(room));
   }
  });
  ws.on('error',()=>{});
  ws.on('close',()=>{if(!player||!room)return;room.players.delete(player.id);for(const [job,id]of room.claims)if(id===player.id)room.claims.delete(job);broadcast(room,snapshot(room));if(!room.players.size)rooms.delete([...rooms].find(([,r])=>r===room)?.[0]);});
 });
 const timer=setInterval(()=>{for(const room of rooms.values())broadcast(room,snapshot(room));},100);timer.unref();
 server.on('close',()=>{clearInterval(timer);for(const ws of wss.clients)ws.terminate();wss.close();});
 return{server,wss,rooms,listen:()=>new Promise(r=>server.listen(port,host,()=>r(server.address())))};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const app=createGameServer({port:Number(process.env.PORT||4174),host:process.env.HOST||'127.0.0.1'});const address=await app.listen();console.log('Jack the Streets · http://'+address.address+':'+address.port+' · Open Map supports up to 8 drivers per city');}
