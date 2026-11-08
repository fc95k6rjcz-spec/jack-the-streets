/* Forty fictional-game shopping destinations. Prices follow free-play mode. */
window.CITY_RETAIL = [
  ['burger', 'BURGER STOP', 'food', '🍔', ['Burger, fries & drink', 'Chocolate shake', 'Breakfast muffin']],
  ['mart', 'HARBOUR TECH', 'tech', '▣', ['iPhone', 'AirPods', 'MacBook']],
  ['pizza', 'PIZZA PALACE', 'food', '🍕', ['Margherita pizza', 'Pepperoni slice', 'Garlic bread']],
  ['sushi', 'HARBOUR SUSHI', 'food', '🍣', ['Salmon roll', 'Bento box', 'Miso soup']],
  ['tacos', 'SUNSET TACOS', 'food', '🌮', ['Beef tacos', 'Veggie burrito', 'Nachos']],
  ['bakery', 'DAWN BAKERY', 'food', '🥐', ['Croissant', 'Sourdough loaf', 'Cinnamon scroll']],
  ['cafe', 'COAST COFFEE', 'food', '☕', ['Flat white', 'Iced latte', 'Toastie']],
  ['icecream', 'SCOOP SHACK', 'food', '🍦', ['Vanilla cone', 'Choc sundae', 'Mango sorbet']],
  ['noodles', 'NEON NOODLES', 'food', '🍜', ['Ramen bowl', 'Dumplings', 'Fried rice']],
  ['fishchips', 'BEACH FISH & CHIPS', 'food', '🐟', ['Fish & chips', 'Calamari', 'Potato scallops']],
  ['juice', 'FRESH PRESS', 'food', '🍊', ['Orange juice', 'Berry smoothie', 'Fruit salad']],
  ['deli', 'RAY’S DELI', 'food', '🥪', ['Deli sandwich', 'Cheese toastie', 'Picnic basket']],
  ['grocery', 'BEACHES GROCER', 'grocery', '🛒', ['Fruit box', 'Pantry pack', 'Vegetable basket']],
  ['convenience', 'QUICK MART', 'grocery', '🏪', ['Energy drink', 'Snack pack', 'Bottled water']],
  ['sweets', 'SUGAR STREET', 'grocery', '🍬', ['Jelly beans', 'Chocolate box', 'Candy jar']],
  ['florist', 'WILD BLOOM', 'home', '🌷', ['Native bouquet', 'Potted fern', 'Orchid']],
  ['fashion', 'STREET THREADS', 'fashion', '👕', ['Racing jacket', 'Street hoodie', 'Denim jeans']],
  ['sneakers', 'SOLE CITY', 'fashion', '👟', ['High-top sneakers', 'Running shoes', 'Canvas shoes']],
  ['surf', 'NORTH SHORE SURF', 'sport', '🏄', ['Shortboard', 'Wetsuit', 'Beach towel']],
  ['skate', 'CONCRETE SKATE', 'sport', '🛹', ['Street skateboard', 'Helmet', 'Skate tool']],
  ['sports', 'ALL STAR SPORTS', 'sport', '⚽', ['Football', 'Basketball', 'Tennis racquet']],
  ['outdoor', 'TRAIL & TIDE', 'sport', '🎒', ['Hiking backpack', 'Camping tent', 'Torch']],
  ['bikes', 'TWO WHEELS', 'sport', '🚲', ['Bike helmet', 'Cycling gloves', 'Repair kit']],
  ['fishing', 'TACKLE BOX', 'sport', '🎣', ['Fishing rod', 'Tackle kit', 'Cooler']],
  ['books', 'CHAPTER HOUSE', 'books', '📚', ['Crime novel', 'Sydney guide', 'Art book']],
  ['comics', 'INK & HEROES', 'books', '💥', ['Racer comic #1', 'Detective comic', 'Hero anthology']],
  ['records', 'VINYL VAULT', 'books', '🎵', ['Synthwave record', 'Rock album', 'Jazz collection']],
  ['games', 'PLAYER ONE', 'tech', '🎮', ['Game controller', 'Retro handheld', 'Racing game']],
  ['camera', 'FOCUS CAMERA', 'tech', '📷', ['Camera', 'Tripod', 'Camera bag']],
  ['audio', 'SOUND STUDIO', 'tech', '🎧', ['Studio headphones', 'Portable speaker', 'Microphone']],
  ['computer', 'BYTE WORKS', 'tech', '💻', ['Keyboard', 'Gaming mouse', 'Monitor']],
  ['toys', 'TOY PLANET', 'home', '🧸', ['Model race car', 'Building bricks', 'Teddy bear']],
  ['furniture', 'LOFT LIVING', 'home', '🛋', ['Lounge chair', 'Desk lamp', 'Side table']],
  ['hardware', 'BUILDMATE', 'home', '🔨', ['Roof repair supplies', 'Workshop lights', 'Workbench tools']],
  ['garden', 'GREEN CORNER', 'home', '🌿', ['Palm plant', 'Watering can', 'Seed kit']],
  ['art', 'COLOUR CLUB', 'books', '🎨', ['Paint set', 'Sketchbook', 'Brush collection']],
  ['gifts', 'LOCAL TREASURES', 'home', '🎁', ['Sydney postcard set', 'Coastal print', 'Souvenir mug']],
  ['watches', 'SECOND HAND', 'fashion', '⌚', ['Classic watch', 'Sport watch', 'Leather watch strap']],
  ['jewellery', 'SILVER LINE', 'fashion', '💍', ['Silver ring', 'Chain necklace', 'Charm bracelet']],
  ['petshop', 'PAWS & CLAWS', 'home', '🐾', ['Pet bed', 'Dog toy', 'Cat scratching post']]
].map(([id, name, theme, icon, products]) => ({id, name, theme, icon, products}));

window.RETAIL_THEMES = {
  food: {wall:'#8e2330', accent:'#ffd367', floor:'#c6b9a0', wood:'#b78050'},
  tech: {wall:'#253b49', accent:'#a4dce9', floor:'#bfc8ca', wood:'#c2a37a'},
  grocery: {wall:'#304e3c', accent:'#c7df8b', floor:'#bcbba4', wood:'#8c7758'},
  fashion: {wall:'#3f304e', accent:'#e1b7d8', floor:'#b6abb5', wood:'#8e6c60'},
  sport: {wall:'#204d57', accent:'#eda65f', floor:'#a7b9ba', wood:'#a88055'},
  books: {wall:'#5a382e', accent:'#ead3a5', floor:'#bca58d', wood:'#91603b'},
  home: {wall:'#374843', accent:'#d8cda6', floor:'#bec1b3', wood:'#9f825c'}
};

// Normalised fixtures are shared by rendering and player collision.
window.retailFixtures = theme => theme==='food'
  ? [{x:.12,y:.34,w:.22,h:.12},{x:.66,y:.34,w:.22,h:.12},{x:.12,y:.65,w:.22,h:.12},{x:.66,y:.65,w:.22,h:.12}]
  : [{x:.13,y:.36,w:.23,h:.12},{x:.64,y:.36,w:.23,h:.12},{x:.13,y:.65,w:.23,h:.12},{x:.64,y:.65,w:.23,h:.12}];

window.paintRetailRoom = function(g, x, w, h, shop, time, alarm) {
  const t=RETAIL_THEMES[shop.theme];
  g.save();g.translate(x,0);
  const rect=(x,y,w,h,c,r=0)=>{g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();};
  rect(0,0,w,h,t.floor);
  // Small grout lines and alternating boards give the floor scale.
  const tile=Math.max(24,w/18);
  g.lineWidth=.7;g.strokeStyle='rgba(39,42,40,.18)';
  for(let y=h*.18;y<h;y+=tile){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();for(let xx=(Math.floor(y/tile)%2)*tile;xx<w;xx+=tile*2){g.beginPath();g.moveTo(xx,y);g.lineTo(xx,y+tile);g.stroke();}}
  rect(0,0,w,h*.18,t.wall);rect(0,h*.18,w,h*.014,t.accent);
  const light=g.createLinearGradient(0,h*.2,0,h);light.addColorStop(0,'rgba(255,248,217,.19)');light.addColorStop(1,'rgba(10,22,30,.18)');rect(0,h*.2,w,h*.8,light);
  // Wall displays, illuminated menu boards and counter.
  for(let i=0;i<5;i++){
    const xx=w*(.055+i*.18);rect(xx+3,h*.225+4,w*.15,h*.065,'#0003',3);rect(xx,h*.225,w*.15,h*.065,shop.theme==='food'?'#1c282b':t.wood,3);
    for(let j=0;j<4;j++)rect(xx+w*(.012+j*.032),h*.239,w*.022,h*.033,[t.accent,'#6c8e9a','#ede5cc','#ba715c'][(i+j)%4],2);
  }
  for(const f of retailFixtures(shop.theme)){
    const xx=f.x*w,yy=f.y*h,ww=f.w*w,hh=f.h*h;
    rect(xx+6,yy+8,ww,hh,'rgba(17,26,26,.22)',5);
    const wood=g.createLinearGradient(xx,yy,xx,yy+hh);wood.addColorStop(0,'#e0c49a');wood.addColorStop(.2,t.wood);wood.addColorStop(1,'#755640');rect(xx,yy,ww,hh,wood,4);
    rect(xx+3,yy+3,ww-6,hh-8,'rgba(255,242,202,.12)',3);
    if(shop.theme==='food'){
      for(const sx of [.25,.75]){g.fillStyle='#f3ead8';g.beginPath();g.ellipse(xx+ww*sx,yy+hh*.5,hh*.26,hh*.23,0,0,7);g.fill();g.fillStyle='#d99a42';g.beginPath();g.arc(xx+ww*sx,yy+hh*.5,hh*.14,0,7);g.fill();}
      rect(xx+ww*.1,yy+hh+5,ww*.8,hh*.23,t.wall,5);
    }else for(let j=0;j<4;j++){
      const px=xx+ww*(.08+j*.23),py=yy+hh*.2;
      if(shop.theme==='tech'){rect(px,py,ww*.15,hh*.58,'#182530',3);rect(px+2,py+2,ww*.15-4,hh*.45,'#71a6b6',2);}
      else if(shop.theme==='fashion'){g.fillStyle=[t.wall,'#ddd5c6','#597d8a','#bd705d'][j];g.beginPath();g.moveTo(px,py+8);g.lineTo(px+ww*.04,py);g.lineTo(px+ww*.12,py);g.lineTo(px+ww*.17,py+8);g.lineTo(px+ww*.13,py+14);g.lineTo(px+ww*.13,py+hh*.6);g.lineTo(px+ww*.03,py+hh*.6);g.lineTo(px+ww*.03,py+14);g.closePath();g.fill();}
      else {rect(px,py,ww*.15,hh*.6,['#4d6876','#be7956','#6d8058','#cfb76f'][j],3);rect(px+2,py+3,ww*.15-4,3,'#e6ddba');}
    }
  }
  // Checkout, card terminal, entrance mat, plants and ceiling-light reflections.
  rect(w*.4,h*.22,w*.2,h*.09,'#0003',4);rect(w*.4,h*.21,w*.2,h*.09,t.wood,4);rect(w*.53,h*.225,w*.035,h*.045,'#202d31',3);rect(w*.535,h*.231,w*.025,h*.021,'#83d3b9',2);
  rect(w*.4,h*.89,w*.2,h*.075,t.wall,3);g.fillStyle=t.accent;g.font='bold '+Math.max(10,w*.015)+'px sans-serif';g.textAlign='center';g.fillText('EXIT',w*.5,h*.935);
  for(const px of [.045,.955]){rect(w*px-8,h*.55,16,23,'#796b58',3);for(let j=0;j<5;j++){g.fillStyle=j%2?'#48764d':'#66875b';g.beginPath();g.ellipse(w*px+Math.cos(j*1.3)*9,h*.55+Math.sin(j*1.3)*7,12,5,j*1.3,0,7);g.fill();}}
  if(alarm){rect(0,h*.19,w,5,Math.floor(time/250)%2?'#ed4e42':'#682621');}
  g.restore();
};
