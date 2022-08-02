var menu = {};
menu['MovePrice'] = 'Move the price interface to the left side';
menu['MoveTools'] = 'Move the toolbar to the left side'; 
menu['StickMenu'] = 'Stick the menu bar to the page';

for (let key in menu) {
	let div = document.createElement('div');
}

//		<div class="form-check form-switch">
//			<input class="form-check-input" type="checkbox" role="switch" id="MovePrice" checked />
//			<label class="form-check-label" for="MovePrice">Move the price interface to the left side</label>
//		</div>


const boxes = document.getElementsByClassName('form-check-input');

async function updateDefaultConfig(){
	await readPreferences();
	for (let box of boxes) {
		box.checked = preferences[box.id];
		box.addEventListener('change', (e) => { persistPreferences(e.target.id, e.target.checked); });
	}
}

updateDefaultConfig()







