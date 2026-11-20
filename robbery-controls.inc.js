/* A visible state for every retail robbery, on touch and keyboard alike. */
function retailRobberyState(I,now){
 if(I.done)return {disabled:true,label:'TAKINGS COLLECTED · LEAVE'};
 const wait=Math.max(0,Math.ceil((I.sh.robbedAt??-999)+120-now));
 if(wait)return {disabled:true,label:'TILL EMPTY · '+wait+'s'};
 return {disabled:false,label:I.robIntent?'CANCEL ROBBERY · '+Math.min(99,Math.floor((I.robT||0)/4*100))+'%':'ROB STORE'};
}
function refreshRetailRobbery(){
 const h=cars.find(c=>c.human&&c.inside&&RETAIL_STOCK[c.inside.sh.type]),bar=document.getElementById('retailActions');
 if(!h||!bar||bar.hidden)return;
 const I=h.inside,b=bar.querySelector('[data-retail-rob]');if(!b)return;
 const status=retailRobberyState(I,simT);b.textContent=status.label;b.disabled=status.disabled;
 b.onclick=()=>{if(h.inside!==I||retailRobberyState(I,simT).disabled)return;I.robIntent=!I.robIntent;if(!I.robIntent)I.robT=0;refreshRetailRobbery();};
}
const retailBeforeRobberyControls=syncRetailUI;
syncRetailUI=function(){retailBeforeRobberyControls();refreshRetailRobbery();};
const weaponsBeforeRobberyControls=syncWeaponUI;
syncWeaponUI=function(){weaponsBeforeRobberyControls();refreshRetailRobbery();};
