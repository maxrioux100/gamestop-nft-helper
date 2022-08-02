const movePrice = document.getElementById('switchMovePrice');
const moveTools = document.getElementById('switchMoveTools');
const stickMenu = document.getElementById('switchStickMenu');

async function updateDefaultConfig(){
	await readPreferences();
	movePrice.checked = preferences['MovePrice'];
	moveTools.checked = preferences['MoveTools'];
	stickMenu.checked = preferences['StickMenu'];
}

updateDefaultConfig()

moveTools.addEventListener('change', (e) => {
	persistPreferences({MoveTools: e.target.checked});
});

movePrice.addEventListener('change', (e) => {
	persistPreferences({MovePrice: e.target.checked});
});

movePrice.addEventListener('change', (e) => {
	persistPreferences({StickMenu: e.target.checked});
});






