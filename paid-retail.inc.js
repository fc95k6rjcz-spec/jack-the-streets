/* Purchases use game money; owned goods and previously completed repairs remain owned. */
function retailPrice(item){
 const specific={meal:25,shake:12,iphone:900,headphones:180,laptop:1800};
 if(specific[item.id])return specific[item.id];
 if(item.heal)return Math.max(10,Math.ceil(item.heal*.6));
 const type=Object.keys(RETAIL_STOCK).find(k=>RETAIL_STOCK[k].some(p=>p.id===item.id)),theme=retailDefinition(type)?.theme;
 const base={food:20,tech:450,grocery:35,fashion:120,sport:180,books:30,home:150}[theme]||75;
 const slot=Math.max(0,RETAIL_STOCK[type]?.findIndex(p=>p.id===item.id)||0);
 return Math.round(base*(1+slot*.35));
}
function buyGarageSupplies(h){if(camp().garageSupplies)return false;if(!spend(h,250)){h.shopMsg='REPAIR PACK COSTS $250 · EARN MORE CASH FIRST';h.shopMsgT=5;return false;}camp().garageSupplies=true;persist();return true;}
