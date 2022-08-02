var menu = {};
menu['MovePrice'] = 'Move the price interface to the left side';
menu['MoveTools'] = 'Move the toolbar to the left side'; 
menu['StickMenu'] = 'Stick the menu bar to the page';
menu['StickNFT'] = 'Stick the NFT to the page';

for (let key in menu) {
	let container = document.body;
	let div = document.createElement('div');
	
	div.innerHTML = `<input class="form-check-input" type="checkbox" role="switch" id="${key}" checked />` +
					`<label class="form-check-label" for="${key}">${menu[key]}</label>`;
	
	div.setAttribute('class', 'form-check form-switch');
	container.appendChild(div);
}

async function updateDefaultConfig(boxes){
	await readPreferences();
	for (let box of boxes) {	
		box.checked = preferences[box.id];
		box.addEventListener('change', (e) => { persistPreferences(e.target.id, e.target.checked); });
	}
}

waitForElement(".form-check-input", 1000)
.then( () => {
	const boxes = document.getElementsByClassName('form-check-input');
	updateDefaultConfig(boxes);
});







