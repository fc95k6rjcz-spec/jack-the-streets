/* Fuel belongs to each owned car, rather than each visit to the garage. */
function rememberOwnedFuel(h){
 const w=save[h.player],id=h.def?.id;
 if(!CAMP()||!h.human||h.foot||h.boat||h.hot||h.stolenOrigin||!w?.owned.includes(id)||!Number.isFinite(h.fuel))return false;
 const fuel=Math.max(0,Math.min(100,h.fuel));
 w.fuel=w.fuel||{};
 const changed=w.fuel[id]!==fuel;w.fuel[id]=fuel;return changed;
}
const persistBeforeOwnedFuel=persist;
persist=function(){for(const h of cars)rememberOwnedFuel(h);return persistBeforeOwnedFuel();};
const vehBeforeOwnedFuel=vehOf;
vehOf=function(h){if(rememberOwnedFuel(h))persist();return vehBeforeOwnedFuel(h);};
const updateBeforeOwnedFuel=updateCar;
let ownedFuelSaveIn=5;
updateCar=function(h,dt){
 const result=updateBeforeOwnedFuel(h,dt);
 if(rememberOwnedFuel(h)){ownedFuelSaveIn-=dt;if(ownedFuelSaveIn<=0){ownedFuelSaveIn=5;persist();}}
 return result;
};
const purchaseBeforeOwnedFuel=fuelPurchase;
fuelPurchase=function(h,amount){const result=purchaseBeforeOwnedFuel(h,amount);if(result.ok){rememberOwnedFuel(h);persist();}return result;};
addEventListener('pagehide',()=>{if(CAMP())persist();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&CAMP())persist();});
