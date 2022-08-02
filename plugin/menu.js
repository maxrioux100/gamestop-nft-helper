const movePrice = document.getElementById('MovePrice');
const moveTools = document.getElementById('MoveTools');
const stickMenu = document.getElementById('StickMenu');

const boxes = document.getElementsByClassName('form-check-input');
for (let box of boxes) {
	box.addEventListener('change', (e) => {
		let dict = {};
		dict[e.target.id] = e.target.checked;
		persistPreferences(dict);
	});
}

async function updateDefaultConfig(){
	await readPreferences();
	movePrice.checked = preferences['MovePrice'];
	moveTools.checked = preferences['MoveTools'];
	stickMenu.checked = preferences['StickMenu'];
}

updateDefaultConfig()







