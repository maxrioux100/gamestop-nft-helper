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
	
	let imgs = document.querySelectorAll('img[src="/31ff16eef888637505a9c58ca047dd60.svg"],img[src="/e33e04602d2c85d6edb3008d7823158e.svg"],img[src="/0633293a9820d3f8c71e277f337a9f34.svg"],img[src="/0f655dbe35439e127dd99dd383d06350.svg"]');
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

function moveThing(from, to, buttons=null, where='start', paddingTop = null) {
	waitForElement(`.ContentContainerDesktop-sc-1p3n06p-5 .${from}`, 1000)
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
					waitForElement(`.${to} .${from} .${btn}`, 1000)
					.then(() => {
						let new_btn = document.querySelector(`.${to} .${from} .${btn}`);
						let old_btn = document.querySelector(`.ContentContainerDesktop-sc-1p3n06p-5 .${from} .${btn}`);
						new_btn.addEventListener("click", (e) => {
							old_btn.click();
						});
					});
				});
			}
		} );
	} );
}

function moveThings(){
	setTimeout(() => {
		if (window.innerWidth >= 1281) {
			if (preferences['MoveTools']) { moveThing('Actions-sc-kdlg0e-0', 'MediaContainer-sc-1p3n06p-2', buttons=['ActionBack-sc-kdlg0e-2']); }
			
			if (preferences['MovePrice']) { moveThing('PurchaseInfoWrapper-sc-11cpe2k-0', 'MediaContainer-sc-1p3n06p-2', buttons = null, where='end', paddingTop=20); }
		}
	}, 50)
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