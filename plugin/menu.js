const boxes = document.getElementsByClassName('form-check-input');

async function updateDefaultConfig(){
	await readPreferences();
	for (let box of boxes) {
		box.checked = preferences[box.id];
		box.addEventListener('change', (e) => { persistPreferences(e.target.id, e.target.checked); });
	}
}

updateDefaultConfig()







