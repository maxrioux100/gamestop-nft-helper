var watchers = {};
watchers['profileName'] = null;

function clean_watcher(name){
	if (watchers[name] != null) {
		clearInterval(watchers[name]);
	}
}

function clean_watchers(){
	for (const [key, value] of Object.entries(watchers)) {
		if (value != null) {
			clearInterval(value);
		}
	}
}

async function setIntervalImmediately(func, interval) {
	func();
	return setInterval(func, interval);
}

const count = (arr) => arr.reduce((ac,a) => (ac[a] = ac[a] + 1 || 1,ac),{});

function sortedToDict(sorted){
	let dict = {};
	for(let i=0 ; i < sorted.length ; i++) {
		dict[sorted[i][0]] = sorted[i][1];
	}
	return dict;
}

function array_to_string(array){
	let output = '';
	if (array) { array.forEach((value) => {output += value.textContent}); }
	return output

}

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

function transactions_splitter(amounts, toDouble, values_eth=null, values_dollars=null){
	for (let i = 0 ; i < amounts.length ; i++) {
		if (amounts[i] > 1) {
			let amount = amounts[i]
			amounts[i] = 1;
			
			let value_eth = null;
			if (values_eth) {
				value_eth = bestRound(values_eth[i]/amount, 4);
				values_eth[i] = value_eth;
			}
			
			value_dollars = null;
			if (values_dollars) {
				let value_dollars = bestRound(values_dollars[i]/amount, 2);
				values_dollars[i] = value_dollars;
			}
		
			for (let ii = 1 ; ii < amount ; ii++)
			{
				if (values_eth) { values_eth.splice(i, 0, value_eth); }
				if (values_dollars) { values_dollars.splice(i, 0, value_dollars); }
				for (array of toDouble) { 
					array.splice(i, 0, array[i]); 
				}
				amounts.splice(i, 0, 1);
				i++;
			}
		}
	}
}

async function makeApiCall(apiMethod, urlParameter, urlParameterValue){
  let baseUrl = 'https://api.nft.gamestop.com/nft-svc-marketplace/'
  let response = await fetch(`${baseUrl}${apiMethod}?${urlParameter}=${urlParameterValue}`)
  if (response.status == 200) {}
  else {
    console.log('unknown err');
    return
  }
  let data = await response.json()
  return data
}

let themeMode = 'light';
function updateDark() {
	themeMode = 'dark'
	document.body.style.backgroundColor = '#424242';
	document.querySelector('.FooterOuterWrapper-sc-n1m1px-6').style.backgroundColor = '#424242'; 
	document.querySelector('.sc-lkgTHX').src = 'https://nft.gamestop.com/7c4d1a56a3e70a618ca864a2feb58fcd.svg';

	let whitefont = document.querySelectorAll('*:not(.sc-gsDKAQ,.sc-dkPtRN.vygPD,.mask,img)');
	for (_element of whitefont){
		if (_element.style) { _element.style.color = '#FBFBFB'; }
	}
	
	let blackfont = document.querySelectorAll('.EthPriceLabel-sc-1c1tt50-1,.UsdPriceLabel-sc-1c1tt50-2,.NotForSale-sc-11cpe2k-14,.sc-fIosxK');
	for (_element of blackfont){
		if (_element.style) { _element.style.color = '#262626'; }
	}
	
	let darkbackground = document.querySelectorAll('.EditionsInfoWrapper-sc-11cpe2k-16,.sc-jcFjpl:not(.hIESFk),.HistoryItemWrapper-sc-13gqei4-0,DetailsItem-sc-asex48-1');
	for (_element of darkbackground ){
		if (_element.style) { _element.style.backgroundColor = '#262626'; }
	}
	
	let imgs = document.querySelectorAll('img[src="/31ff16eef888637505a9c58ca047dd60.svg"],img[src="/e33e04602d2c85d6edb3008d7823158e.svg"],img[src="/0633293a9820d3f8c71e277f337a9f34.svg"],img[src="/0f655dbe35439e127dd99dd383d06350.svg"],img[src="/12109559ab4919bdf23807e89e160f32.svg"]');
	for (_element of imgs ){
		if (_element) { 
			let splitted_url = _element.src.split('/');
			_element.src = chrome.runtime.getURL('images/' + splitted_url[splitted_url.length-1]); 
		}
	}
}

let stickies = {};
stickies['nft'] = null;
stickies['bar'] = null;

async function stickThing(stickiesName, className, options, activate=false)
{	
	let elem = document.getElementById(`stick_${stickiesName}`);

	if (elem) {
		let sticky = mdb.Sticky.getInstance(elem);
		if (sticky) {
			sticky.active();
		}
	} else {
		waitForElement(`.${className}`, 1000)
		.then(() => {
			elem = document.querySelector(`.${className}`);
			stickies[stickiesName] = new mdb.Sticky(elem, options);
			if (activate) { stickies[stickiesName].active(); }
		}); 
	}
} 

function stickThings(){
	setTimeout(() => {
		if (window.innerWidth >= 1281) {
			if (preferences['StickNFT']) {
				if (preferences['MoveTools']) { stickThing('nft', 'MediaContainer-sc-1p3n06p-2', {stickyDirection: 'both', stickyMedia: 1281, stickyOffset: 80, stickyDelay: 70}, activate=true); }
				else { stickThing('nft', 'MediaContainer-sc-1p3n06p-2', {stickyDirection: 'both', stickyMedia: 1281, stickyOffset: 160, stickyDelay: 70}, activate=true); }
			}
		}
		
		if (preferences['StickMenu']) { 
			stickThing('bar', 'sc-FNXRL', {stickyDirection : 'both',stickyMedia: 1281, stickyDelay: 20}, activate=true); 
		}
	}, 50)
}


async function moveThing(from, to, buttons=null, where='start', paddingTop = null) {
	await waitForElement(`.ContentContainerDesktop-sc-1p3n06p-5 .${from}`, 1000)
	.then(() => {
		waitForElement(`.${to}`, 1000)
		.then(() => {
			let old_sources = document.querySelectorAll(`.${to} .${from}`);
			for(let i=0 ; i< old_sources.length ; i++) { 
				old_sources[i].parentElement.removeChild(old_sources[i]);
			}
			
			let source = document.querySelector(`.ContentContainerDesktop-sc-1p3n06p-5 .${from}`);
			source.style.display = 'none';
			let clone = source.cloneNode(true);
			clone.style.display = null;
			let dests = document.querySelectorAll(`.${to}`);
			for (let i=0 ; i < dests.length ; i++) {
				if (where == 'start') { dests[i].insertBefore(clone, dests[i].firstChild); }
				if (where == 'end') { dests[i].appendChild(clone); }
			}
			if (paddingTop) { clone.style.paddingTop = `${paddingTop}px`; }
			
			if (buttons) {
				buttons.forEach(btn => {
					let new_btn = document.querySelector(`.${to} .${from} ${btn[0]}`);
					let old_btn = document.querySelector(`.ContentContainerDesktop-sc-1p3n06p-5 .${from} ${btn[0]}`);
					if (new_btn) {
						new_btn.addEventListener("click", (e) => {
							old_btn.click();
							if (btn.length > 1) {
								document.querySelector(`.ContentContainerDesktop-sc-1p3n06p-5 .${from} ${btn[1]}`).click();
							}
						});
					}
				});
			}
		} );
	} );
}

function blockingSleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

async function moveThings(){
	blockingSleep(50);
	if (window.innerWidth >= 1281) {
		if (preferences['MoveTools']) { 
			await moveThing('Actions-sc-kdlg0e-0', 'MediaContainer-sc-1p3n06p-2', buttons=[['.ActionBack-sc-kdlg0e-2'], 
																					 ['.ActionMedia-sc-kdlg0e-1 .Button-sc-18j7gm-0'],
																					 ['.ActionMedia-sc-kdlg0e-1 .ActionLike-sc-kdlg0e-3 .sc-lbhJGD'],
																					 ['.ActionMedia-sc-kdlg0e-1 .StyledPopupMenu-sc-18j7gm-4 .sc-eCImPb .sc-dkPtRN', '.ActionMedia-sc-kdlg0e-1 .StyledPopupMenu-sc-18j7gm-4 .sc-eCImPb .sc-iCfMLu .sc-furwcr']
																					]); 
			let more = document.querySelector(`.MediaContainer-sc-1p3n06p-2 .Actions-sc-kdlg0e-0 .ActionMedia-sc-kdlg0e-1 .StyledPopupMenu-sc-18j7gm-4 .sc-eCImPb .sc-dkPtRN`).children[0];
			more.innerHTML = more.innerHTML.replaceAll('More', 'Report');
			let report = more.children[0];
			report.src = '/12109559ab4919bdf23807e89e160f32.svg'; 
		}
		
		if (preferences['MovePrice']) { 
			moveThing('PurchaseInfoWrapper-sc-11cpe2k-0', 'MediaContainer-sc-1p3n06p-2', buttons = [
																									['.sc-JEhMO .sc-gHjyzD .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .MultiButtonRow-sc-11cpe2k-5 .ButtonHoverWrapper-sc-11cpe2k-4 .jhCfFf'],
																									['.sc-JEhMO .sc-gHjyzD .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .MultiButtonRow-sc-11cpe2k-5 .ButtonHoverWrapper-sc-11cpe2k-4 .vygPD']
																								   ], where='end', paddingTop=20); 																					   
			waitForElement('.MediaContainer-sc-1p3n06p-2 .PurchaseInfoWrapper-sc-11cpe2k-0 .sc-JEhMO .sc-gHjyzD .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .ActionButtonAlignRight-sc-1jv4yz7-0, .MediaContainer-sc-1p3n06p-2 .PurchaseInfoWrapper-sc-11cpe2k-0 .sc-bttaWv .sc-kNzDjo .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .ActionButtonAlignRight-sc-1jv4yz7-0', 1000)
			.then(() => {	
				let actions = document.querySelectorAll('.MediaContainer-sc-1p3n06p-2 .PurchaseInfoWrapper-sc-11cpe2k-0 .sc-JEhMO .sc-gHjyzD .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .ActionButtonAlignRight-sc-1jv4yz7-0');
				let shortcut = '.sc-JEhMO .sc-gHjyzD';
				if (actions.length == 0 ) {
					actions = document.querySelectorAll('.MediaContainer-sc-1p3n06p-2 .PurchaseInfoWrapper-sc-11cpe2k-0 .sc-bttaWv .sc-kNzDjo .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .ActionButtonAlignRight-sc-1jv4yz7-0');
					shortcut = '.sc-bttaWv .sc-kNzDjo';
				}
				
				for (let i = 0 ; i < actions.length ; i++){
					let nbEditions = '';
					if (offers) {
						nbEditions = offers.reduce( (previous, current) => previous + parseInt(current['amount']), 0);
					}
					
					
					actions[i].outerHTML = `<div class="MultiButtonRow-sc-11cpe2k-5 kUYqZZ">` +
												`<div class="ButtonHoverWrapper-sc-11cpe2k-4 fUzcEq">` +
													`<button aria-label="Manage NFT" class="sc-dkPtRN jhCfFf">` +
														`<span class="sc-gsDKAQ ftCHgs">Manage NFT</span>` +
													`</button>` +
												`</div>` +
											`<div class="ButtonHoverWrapper-sc-11cpe2k-4 fUzcEq">` +
												`<button aria-label="${nbEditions} Editions" class="sc-dkPtRN vygPD">` + 
													`<span class="sc-gsDKAQ ftCHgs">${nbEditions} Editions</span>` +
												`</button>` +
											`</div>` +
										  `</div>`;
										  
					let action_btn = document.querySelector(`.ContentContainerDesktop-sc-1p3n06p-5 .PurchaseInfoWrapper-sc-11cpe2k-0 ${shortcut} .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .ActionButtonAlignRight-sc-1jv4yz7-0 .sc-eCImPb .sc-dkPtRN`);
					let manage_btn = document.querySelector(`.MediaContainer-sc-1p3n06p-2 .PurchaseInfoWrapper-sc-11cpe2k-0 ${shortcut} .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .MultiButtonRow-sc-11cpe2k-5 .ButtonHoverWrapper-sc-11cpe2k-4 .jhCfFf`);
					if (manage_btn) {
						manage_btn.addEventListener("click", (e) => {
							action_btn.click();
							let manage_menu = document.querySelector(`.ContentContainerDesktop-sc-1p3n06p-5 .PurchaseInfoWrapper-sc-11cpe2k-0 ${shortcut} .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .ActionButtonAlignRight-sc-1jv4yz7-0 .sc-eCImPb .sc-iCfMLu`);
							manage_menu.children[1].click();
						});
					}
					
					let editions_btn = document.querySelector(`.MediaContainer-sc-1p3n06p-2 .PurchaseInfoWrapper-sc-11cpe2k-0 ${shortcut} .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .MultiButtonRow-sc-11cpe2k-5 .ButtonHoverWrapper-sc-11cpe2k-4 .vygPD`);
					if (editions_btn) {
						editions_btn.addEventListener("click", (e) => {
							action_btn.click();
							let manage_menu = document.querySelector(`.ContentContainerDesktop-sc-1p3n06p-5 .PurchaseInfoWrapper-sc-11cpe2k-0 ${shortcut} .InfoBoxInnerWrapper-sc-11cpe2k-2 .InnerButtonWrapper-sc-11cpe2k-3 .ActionButtonAlignRight-sc-1jv4yz7-0 .sc-eCImPb .sc-iCfMLu`);
							manage_menu.children[0].click();
						});
					}
				}
			}, () => {});
		}
	}
	if (preferences['DarkMode']) { updateDark(); } 
}

setInterval(() => { moveThings(); }, 3000);

let lastMoved = null
let intervalResizing = null;
function sticker() {
	for(var key in stickies) {
		if (stickies[key]) { 
			stickies[key].inactive();
		};	
	}
	if (!lastMoved) {
		intervalResizing = setInterval( () => {
			if (Date.now() - lastMoved > 250){
				moveThings();
				stickThings();
				
				lastMoved = null;
				clearInterval(intervalResizing);
			}
		}, 50);
	}
	lastMoved = Date.now();
}

window.onresize = sticker;