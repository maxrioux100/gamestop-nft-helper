const movePrice = document.getElementById('switchMovePrice');
const moveTools = document.getElementById('switchMoveTools');

async function updateDefaultConfig(){
	let preferences = await readPreferences();
	movePrice.checked = preferences['MovePrice'];
	moveTools.checked = preferences['MoveTools'];
}

updateDefaultConfig()

moveTools.addEventListener('change', (e) => {
	persistMoveTools(e.target.checked);
});

movePrice.addEventListener('change', (e) => {
	persistMovePrice(e.target.checked);
});







