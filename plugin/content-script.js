let lastUrl = null;

new MutationObserver(() => {
	const url = location.href;
	if (url !== lastUrl) {
		if (lastUrl && lastUrl.startsWith('https://nft.gamestop.com/token/')) { 
			clean_charts();
			clean_watchers();
			location.reload(); 
		}
		lastUrl = url;
		if (lastUrl.startsWith('https://nft.gamestop.com/token/')) { token_page(); }
		if (lastUrl.startsWith("https://nft.gamestop.com/profile")) { profile_page(); }
	}
}).observe(document, {subtree: true, childList: true});

function updateOffers() {
	let sorted = Object.keys(offers).map(function(key) {
		return [key, offers[key]];
	});

	sorted.sort(function(first, second) {
		return first[1]['pricePerNft'] - second[1]['pricePerNft'];
	});
	

	let values_eth = [offers.length];
	let values_dollars = [offers.length];
	let quantities = [offers.length];

	for (let i=0; i < offers.length; i++) {
		values_eth[i] = bestRound(parseFloat(sorted[i][1]['pricePerNft'])/Math.pow(10, 18), 4);
		values_dollars[i] = bestRound(parseFloat(sorted[i][1]['pricePerNft'])/Math.pow(10, 18)*ETH_US, 2);
		quantities[i] = parseInt(sorted[i][1]['amount']-sorted[i][1]['fulfilledAmount']);
	}

	let noOutliers = getNumberOfNonOutliers(values_eth, quantities);

	let new_values_eth = [];
	let new_values_dollars = [];
	let new_quantities = [];

	let lastValue = -1;
	for (let i=0; i < noOutliers; i++){
		if (lastValue == values_eth[i]) {
			new_quantities[new_quantities.length-1] += quantities[i];
		} else {
			if (i==0) {new_quantities.push(quantities[i])}
			else {new_quantities.push(quantities[i] + new_quantities[new_quantities.length-1])};
			lastValue = values_eth[i];
			new_values_eth.push(values_eth[i]);
			new_values_dollars.push(values_dollars[i]);
		}
	}
	
	let min_eth = new_values_eth[0];
	let max_eth = new_values_eth[new_values_eth.length-1];
	let min_dollars = new_values_dollars[0];
	let max_dollars = new_values_dollars[new_values_dollars.length-1];

	new_values_eth.push(new_values_eth[new_values_eth.length-1]);
	new_values_dollars.push(new_values_dollars[new_values_dollars.length-1]);
	new_quantities.unshift(0);

	if (min_eth == max_eth){
		min_eth = 0;
		max_eth *= 2;
		min_dollars = 0;
		max_dollars *= 2;
	}
	
	if (preferences['ChartOffers']) {
		charts['offers'].updateOptions(get_options_listed_sellers(themeMode, new_values_eth, new_values_dollars, new_quantities, min_eth, max_eth, min_dollars, max_dollars), animate=false);
	}
}

function updateHistory() {
	let total_eth = 0;
	let total_dollars = 0;
	let values_eth = [transactions.length];
	let values_dollars = [transactions.length];
	let buyers = [transactions.length];
	let sellers = [transactions.length];
	let labels = [transactions.length];
	let created_at = [transactions.length];
	let amounts = [transactions.length];

	for (let i=0; i < transactions.length; i++) {
		buyers[transactions.length - 1 - i] = transactions[i]['transaction']['orderA']['accountAddress'];
		sellers[transactions.length - 1 - i] = transactions[i]['transaction']['orderB']['accountAddress'];
		labels[transactions.length - 1 - i] = `<b>${Usernames[buyers[transactions.length - 1 - i]]}</b> bought from <b>${Usernames[sellers[transactions.length - 1 - i]]}</b>`;
		values_eth[transactions.length - 1 - i] = bestRound(parseFloat(transactions[i]['transaction']['orderA']['amountS'])/Math.pow(10, 18), 4);;
		values_dollars[transactions.length - 1 - i] = bestRound(parseFloat(transactions[i]['transaction']['orderA']['amountS'])/Math.pow(10, 18)*ETH_US , 2);;
		total_eth += values_eth[transactions.length - 1 - i];
		total_dollars += values_dollars[transactions.length - 1 - i];
		created_at[transactions.length - 1 - i] = transactions[i]['createdAt'];
		amounts[transactions.length - 1 - i] = transactions[i]['transaction']['orderA']['amountB'];
	}
	transactions_splitter(amounts, [sellers, buyers, labels, created_at], values_eth=values_eth, values_dollars=values_dollars);

	let min_eth = Math.min(...values_eth);
	let min_dollars = Math.min(...values_dollars);
	let max_eth = Math.max(...values_eth);
	let max_dollars = Math.max(...values_dollars);
	let change = values_eth[values_eth.length-1]/values_eth[0]*100-100;
	
	if (preferences['StatsHistory']) {
		updateChips(total_eth, values_eth, total_dollars, values_dollars, change);
	}
	if (preferences['ChartHistory'] && charts['price_history']) {
		let profile_sales_index = [];
		let profile_buys_index = [];

		for (let i = 0; i < sellers.length; i++) {
		  if (profileName && sellers[i] == profileName) {
			profile_sales_index.push(i)
		  }
		}
		for (let i = 0; i < buyers.length; i++) {
		  if (profileName && buyers[i] == profileName) {
			profile_buys_index.push(i)
		  }
		}

		if (min_eth == max_eth){
			min_eth = 0;
			min_dollars = 0;
			max_eth *= 2;
			max_dollars *= 2;
		}

		let colors = ['#00E396'];
		if (change < 0) {colors = ["#FF4560"];}
		else if (change == 0) {colors = ["#008FFB"];}
		charts['price_history'].updateOptions(get_options_price_history(themeMode, values_eth, values_dollars, min_eth, max_eth, min_dollars, max_dollars, labels, colors, all_transactions, profile_sales_index, profile_buys_index), animate=false);
	}
	
	if (preferences['ChartVolume'] && charts['volume']) {
		let agos = [];
		for (timestamp of created_at) {
			let ago = timeago.format(timestamp);
			if (ago.endsWith(' ago')) { ago = ago.slice(0, ago.length-4); }
			agos.push(ago);
		}
		
		let [series_volume, labels_volume, all_data_volume] = get_volume_candle(count(agos));
    
		charts['volume'].updateOptions(get_options_volume(themeMode, values_eth, series_volume, labels_volume, all_data_volume), animate=false);
	}
}

function updateWhales() {
	if (preferences['ChartRecurrent'] && charts['recurrent']) {
		let buyers = [transactions.length];
		let sellers = [transactions.length];
		let amounts = [transactions.length];

		for (let i=0; i < transactions.length; i++) {
			buyers[transactions.length - 1 - i] = transactions[i]['transaction']['orderA']['accountAddress'];
			sellers[transactions.length - 1 - i] = transactions[i]['transaction']['orderB']['accountAddress'];
			amounts[transactions.length - 1 - i] = transactions[i]['transaction']['orderA']['amountB'];
		}
		
		
		transactions_splitter(amounts, [sellers, buyers]);
		
		let listers = [];
		if (offers) {
			for (let i=0; i < offers.length; i++) {
				for (let ii=0 ; ii < (offers[i]['amount']-offers[i]['fulfilledAmount']) ; ii++) {
					listers.push(offers[i]['ownerAddress']);
				}
			}
		}

		let [series_sellers_buyers_listers, labels_sellers_buyers_listers] = combine_buyers_sellers_listers(count(buyers), count(sellers), count(listers));
		
		get_options_recurrent(themeMode, series_sellers_buyers_listers, labels_sellers_buyers_listers)
		charts['recurrent'].updateOptions(get_options_recurrent(themeMode, series_sellers_buyers_listers, labels_sellers_buyers_listers), animate=false);
		
		const labels = document.querySelectorAll('.chart_recurrent');
		for (let label of labels) {
			let title = label.querySelector('title').textContent;
			if (title == Usernames[creator]) { label.setAttribute("fill", "#1266F1"); }
			if (title == profileName) { label.setAttribute("fill", " #FF5733"); }
		}
	}
}


let rateAndFees = null;
let ETH_US = null;
setIntervalImmediately(async function() {
	rateAndFees = await makeApiCall('ratesAndFees');
	//Add a verification to be sure it's ETH_US
	ETH_US = rateAndFees['rates'][0]['quotes'][0]['rate'];
	updateNeeded();
}, 30000);

let nft=null;
let transactions = null;
let offers=null;
let creator=null;
let all_transactions=false;


let updateNeededHistory = false;
let updateNeededOffers = false;
let updateNeededWhales = false;

function updateNeeded() {
	updateNeededHistory = true;
	updateNeededOffers = true;
	updateNeededWhales = true;
}

setInterval(function() {
	if (updateNeededWhales) {
		updateNeededWhales = false;
		updateWhalesWithApiData();
	}
	if (updateNeededHistory) {
		updateNeededHistory = false;
		updateHistoryWithApiData();
	}
	if (updateNeededOffers) {
		updateNeededOffers = false;
		updateOffersWithApiData();
	}
}, 500);

async function getNFT() {
	let splitted_url = lastUrl.split('/');
	nft = await makeApiCall('getNft', 'tokenIdAndContractAddress', `${splitted_url[5]}_${splitted_url[4]}`)
	
	creator = nft['creatorEthAddress'];
	
	setIntervalImmediately(async function() {
		transactions = await makeApiCall('history', 'nftData', `${nft['loopringNftInfo']['nftData'][0]}`);
		mint = transactions.filter( item => (item['transaction']['txType'] == "NftMint") );
		if (mint.length > 0) { all_transactions=true; }
		transactions = transactions.filter( item => (item['transaction']['txType'] == "SpotTrade") );
		updateNeededHistory = true;
		updateNeededWhales = true;
		for (transaction of transactions) {
			addAddress(transaction['transaction']['orderB']['accountAddress']);
			addAddress(transaction['transaction']['orderA']['accountAddress']);
		}
	}, 5000);
	
	setIntervalImmediately(async function() {
		offers = await makeApiCall('getNftOrders', 'nftId', nft['nftId']);
		updateNeededOffers = true;
		updateNeededWhales = true;
		for (offer of offers) {
			addAddress(offer['ownerAddress']);
		}
	}, 5000);
};



let Usernames = {}
async function addAddress(address){
	if (!(address in Usernames)) {
		Usernames[address] = address;
		let temp = await makeApiCall('getPublicProfile', 'address', address);
		if (temp['name']) Usernames[address] = temp['name'];
		updateNeeded();
	}
}


async function updateHistoryWithApiData() {
	if (transactions && ETH_US){
		if (transactions.length > 1) {
			waitForElement("#history_helper", 1000)
			.then( () => {
				updateHistory();
				if (preferences['DarkMode']) { updateDark(); }
			});
		}
	}
}


async function updateOffersWithApiData() {
	if (offers && ETH_US)
	{
		if (offers.length > 1){	
			waitForElement("#offers_helper", 1000)
			.then( () => {
				updateOffers();
				if (preferences['DarkMode']) { updateDark(); } 
			});
		}
	}
}

async function updateWhalesWithApiData() {
	if ((transactions || offers) && ETH_US)
	{
		waitForElement("#whales_helper", 1000)
		.then( () => {
			updateWhales();
			if (preferences['DarkMode']) { updateDark(); } 
		});
	}
}

//if (lastUrl.startsWith('https://nft.gamestop.com/token/')) { token_page(); }
async function token_page() {
	await readPreferences();
	
	getNFT();
	
	moveThings(); 
	stickThings();

	waitForElement(".ContentContainer-sc-1p3n06p-4", 10000)
	.then( () => {
		if (preferences['ChartOffers']) { createOffersHelperContainer(); }
		if (preferences['StatsHistory'] || preferences['ChartHistory'] || preferences['ChartVolume']) { createHistoryHelperContainer(); }
		if (preferences['ChartRecurrent']) { createWhalesHelperContainer(); }
		if (preferences['DarkMode']) { updateDark(); } 
		updateNeeded();
		
		//Remove it when listening instead of fetching
		setInterval(() => { moveThings(); }, 1000);
	});
	
	if (preferences['RealVendorName']) {
		watchers['editionsPage'] = setIntervalImmediately(function() {
			waitForElement(".Editions-sc-11cpe2k-6", 3000)
			.then( () => {
				let owners = document.querySelectorAll('.EditionsItem-sc-11cpe2k-7:not(.EditionsItemHead-sc-11cpe2k-8) .EditionsOwner-sc-11cpe2k-10');
				for (let i=0 ; i < owners.length ; i++){
					if (Usernames[offers[i]['ownerAddress']].length <= 20) {
						owners[i].innerText = Usernames[offers[i]['ownerAddress']];
					}
				}
			}, () => {});	
		}, 3000);
	}
	if (preferences['HideHistory']) {
		waitForElement(".HistoryListContainer-sc-13gqei4-1", 10000)
		.then( () => {
			 addHideBtn(document.querySelector('.HistoryListContainer-sc-13gqei4-1'));
		});
	}
	
	if (preferences['HideDetails']) {
		waitForElement(".Details-sc-asex48-0", 10000)
		.then( () => {
			 addHideBtn(document.querySelector('.Details-sc-asex48-0')); 
		});
	}
	
	if (preferences['ShowRoyalties']) {
		waitForElement(".ContentContainer-sc-1p3n06p-4 .InnerButtonWrapper-sc-11cpe2k-3", 10000)
		.then( () => {
			setTimeout(() => {
				if (nft) {
					let box = document.querySelector('.ContentContainer-sc-1p3n06p-4 .InnerButtonWrapper-sc-11cpe2k-3');
					let pill = document.createElement('span');
					pill.setAttribute('class', 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning');
					pill.innerHTML = `${nft['royaltyFeeBips']}%` ;
					box.appendChild(pill);
				}
			}, 500);
		});
	}
}

async function profile_page() {
	watchers['profileName'] = setIntervalImmediately(function() {
		waitForElement(".sc-hBUSln", 3000)
		.then( () => {
			let tempProfileName = document.getElementsByClassName("sc-hBUSln")[0].textContent;
			if (tempProfileName != '') {
				persistProfileName(tempProfileName);
				clean_watcher('profileName');
			}
		});
	}, 3000);
}
