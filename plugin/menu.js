var menu = {};
menu['MovePrice'] = 'Move the price interface to the left side';
menu['MoveTools'] = 'Move the toolbar to the left side'; 
menu['StickMenu'] = 'Stick the menu bar to the page';
menu['StickNFT'] = 'Stick the NFT to the page';
menu['ChartOffers'] = 'Chart of the available offers';
menu['ChartRecurrent'] = 'Chart of the recurrent buyers and sellers';
menu['ChartVolume'] = 'Chart of the last volume';
menu['ChartHistory'] = 'Chart on the previous sale';
menu['StatsHistory'] = 'Stats on the previous sale';

for (let key in menu) {
	let container = document.getElementById('container');
	let div = document.createElement('div');
	
	div.innerHTML = `<input class="form-check-input" type="checkbox" role="switch" id="${key}" checked />` +
					`<label class="form-check-label" for="${key}">${menu[key]}</label>`;
	
	div.setAttribute('class', 'form-check form-switch my-1');
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
	document.getElementById('btnNone').addEventListener("click", (e) => { for (let box of boxes) { 
																			box.checked = false;
																			persistPreferences(box.id, false);
																		}});
	document.getElementById('btnAll').addEventListener("click", (e) => { for (let box of boxes) { 
																		box.checked = true;
																		persistPreferences(box.id, true);
																	}});
	document.getElementById('btnRefresh').addEventListener("click", (e) => { 
																		chrome.tabs.query({url: "https://nft.gamestop.com/*"}, function(tabs) {
																			for(let tab in tabs){
																				chrome.tabs.reload(tab.id);
																			}
																		})
																		window.close();
																	});																		
});









