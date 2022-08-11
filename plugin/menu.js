var menu = {};
menu['MovePrice'] = '<i class="far fa-arrow-alt-circle-left"></i> Move the purchase interface';
menu['MoveTools'] = '<i class="far fa-arrow-alt-circle-left"></i> Move the toolbar'; 
menu['StickMenu'] = '<i class="far fa-sticky-note"></i> Stick the menu bar';
menu['StickNFT'] = '<i class="far fa-sticky-note"></i> Stick the NFT';
menu['ChartOffers'] = '<i class="fas fa-chart-line"></i> Chart of the available offers';
menu['ChartRecurrent'] = '<i class="fas fa-chart-line"></i> Chart of the recurrent buyers/sellers';
menu['ChartVolume'] = '<i class="fas fa-chart-line"></i> Chart of the last volume';
menu['ChartHistory'] = '<i class="fas fa-chart-line"></i> Chart on the previous sales';
menu['StatsHistory'] = '<i class="fas fa-table"></i> Stats on the previous sales';
menu['DarkMode'] = '<i class="fas fa-lightbulb"></i> Dark mode';
menu['HideHistory'] = '<i class="fas fa-eye-slash"></i> Hide the history';

function waitForElement(querySelector, timeout){
	return new Promise((resolve, reject)=>{
		var timer = false;
		if(document.querySelectorAll(querySelector).length) return resolve();
		const observer = new MutationObserver(()=>{
		if(document.querySelectorAll(querySelector).length){
			observer.disconnect();
			if(timer !== false) clearTimeout(timer);
			return resolve();
		}});
		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
		if(timeout) timer = setTimeout(()=>{
			observer.disconnect();
			reject();
		}, timeout);
	});
}

async function setIntervalImmediately(func, interval) {
	func();
	return setInterval(func, interval);
}

function writeCheck(key, container){
	let container_elem = document.getElementById(container);
	let div = document.createElement('div');
	
	div.innerHTML = `<input class="form-check-input" type="checkbox" role="switch" id="${key}" checked />` +
					`<label class="form-check-label ps-3" for="${key}">${menu[key]}</label>`;
	
	div.setAttribute('class', 'form-check form-switch my-1');
	container_elem.appendChild(div);
}

writeCheck('DarkMode', 'container_NFT_interface');
writeCheck('StickNFT', 'container_NFT_interface');
writeCheck('StickMenu', 'container_NFT_interface');
writeCheck('MovePrice', 'container_NFT_interface');
writeCheck('MoveTools', 'container_NFT_interface');
writeCheck('HideHistory', 'container_NFT_interface');
writeCheck('ChartOffers', 'container_NFT_offers');
writeCheck('StatsHistory', 'container_NFT_history');
writeCheck('ChartHistory', 'container_NFT_history');
writeCheck('ChartVolume', 'container_NFT_history');
writeCheck('ChartRecurrent', 'container_NFT_history');

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









