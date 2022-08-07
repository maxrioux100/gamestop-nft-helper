let lastUrl = location.href;
new MutationObserver(() => {
	const url = location.href;
	if (url !== lastUrl) {
		if (lastUrl.startsWith('https://nft.gamestop.com/token/')) { location.reload(); }
		lastUrl = url;
		if (lastUrl.startsWith('https://nft.gamestop.com/token/')) { token_page(); }
	}
}).observe(document, {subtree: true, childList: true});

function updateOffers() {
	removeOffersHelperPrompt();
	createOffersChart();
	
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
		quantities[i] = parseInt(sorted[i][1]['amount']);
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
		charts['offers'] = new ApexCharts(document.querySelector("#chart_offers"), get_options_future_sellers(new_values_eth, new_values_dollars, new_quantities, min_eth, max_eth, min_dollars, max_dollars, themeMode));
		charts['offers'].render();
	}
}

function updateHistory() {
	removeHistoryHelperPrompt();
	createHistoryStatsCharts();

	//need to give the all transacions some love (move it?) but mostly find a way to get it
	let all_transactions = false;

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
		buyers[transactions.length - 1 - i] = transactions[i]['transaction']['orderB']['accountAddress'];
		sellers[transactions.length - 1 - i] = transactions[i]['transaction']['orderA']['accountAddress'];
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
	
	if (preferences['ChartHistory']) {
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
		
		charts['price_history'] = new ApexCharts(document.querySelector("#chart_price_history"), get_options_price_history(values_eth, values_dollars, min_eth, max_eth, min_dollars, max_dollars, labels, colors, all_transactions, profile_sales_index, profile_buys_index, themeMode));
		charts['price_history'].render();
	}
	
	if (preferences['ChartVolume']) {
		//let [series_volume, labels_volume, all_data_volume] = get_volume_candle(count(agos));
		//charts['volume']  = new ApexCharts(document.querySelector("#chart_volume"), get_options_volume(values_eth, series_volume, labels_volume, all_data_volume, themeMode));
		//charts['volume'].render();
	}
}

function updateWhales() {
	createWhalesChart();

	let buyers = [transactions.length];
	let sellers = [transactions.length];
	let amounts = [transactions.length];

	for (let i=0; i < transactions.length; i++) {
		buyers[transactions.length - 1 - i] = transactions[i]['transaction']['orderB']['accountAddress'];
		sellers[transactions.length - 1 - i] = transactions[i]['transaction']['orderA']['accountAddress'];
		amounts[transactions.length - 1 - i] = transactions[i]['transaction']['orderA']['amountB'];
	}

	transactions_splitter(amounts, [sellers, buyers]);

	let listers = [];
	if (lastOffers) {
		for (let i=0; i < lastOffers.length; i++) {
			for (let ii=0 ; ii < lastOffers[i]['amount'] ; ii++) {
				listers.push(lastOffers[i]['ownerAddress']);
			}
		}
	}

	let [series_sellers_buyers_listers, labels_sellers_buyers_listers] = combine_buyers_sellers_listers(count(buyers), count(sellers), count(listers));
	charts['recurrent']  = new ApexCharts(document.querySelector("#chart_recurrent"), get_options_recurrent(series_sellers_buyers_listers, labels_sellers_buyers_listers, themeMode));
	charts['recurrent'].render(); 
	
	const labels = document.querySelectorAll('.chart_recurrent');
	for (let label of labels) {
		let title = label.querySelector('title').textContent;
		if (title == Usernames[creator]) { label.setAttribute("fill", "#1266F1"); }
		if (title == profileName) { label.setAttribute("fill", " #FF5733"); }
	}
	
}

let updateNeeded = false;
setInterval(function() {
	if (updateNeeded) {
		updateNeeded = false;
		updateWhalesWithApiData();
		updateHistoryWithApiData();
		updateOffersWithApiData();
	}
}, 500);

let rateAndFees = null;
let ETH_US = null;
setIntervalImmediately(async function() {
	rateAndFees = await makeApiCall('ratesAndFees');
	//Add a verification to be sure it's ETH_US
	ETH_US = rateAndFees['rates'][0]['quotes'][0]['rate'];
	updateNeeded = true;
}, 30000);

let nft=null;
let transactions = null;
let offers=null;
let creator=null;
getNFT();

async function getNFT() {
	let splitted_url = lastUrl.split('/');
	nft = await makeApiCall('getNft', 'tokenIdAndContractAddress', `${splitted_url[5]}_${splitted_url[4]}`)
	
	creator = nft['0x9b944a5f2f90ba9f8a8c375be8b076b8361bff15']
	
	setIntervalImmediately(async function() {
		transactions = await makeApiCall('history', 'nftData', `${nft['loopringNftInfo']['nftData'][0]}`);
		transactions = transactions.filter( item => (item['transaction']['txType'] == "SpotTrade") );
		updateNeeded = true;
		for (transaction of transactions) {
			addAddress(transaction['transaction']['orderB']['accountAddress']);
			addAddress(transaction['transaction']['orderA']['accountAddress']);
		}
	}, 5000);
	
	setIntervalImmediately(async function() {
		offers = await makeApiCall('getNftOrders', 'nftId', nft['nftId']);
		updateNeeded = true;
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
		updateNeeded = true;
	}
}


let lastTransactions = '';
//force is for the recurrent sellers/buyers graph
async function updateHistoryWithApiData() {
	if (transactions && ETH_US){
		if (transactions.length > 1) {
			if (JSON.stringify(transactions) != JSON.stringify(lastTransactions)){
				lastTransactions = transactions;
				clean_chart('price_history');
				clean_chart('volume');
				waitForElement("#history_helper", 1000)
				.then( () => {
					updateHistory();
					if (preferences['DarkMode']) { updateDark(); }
				});
			}	
		}
	}
}

var lastOffers = null;
async function updateOffersWithApiData() {
	if (offers && ETH_US)
	{
		if (offers.length > 1){	
			if (JSON.stringify(offers) != JSON.stringify(lastOffers)){
				lastOffers = offers;
				clean_chart('offers');
				waitForElement("#offers_helper", 1000)
				.then( () => {
					updateOffers();
					if (preferences['DarkMode']) { updateDark(); } 
				});
			}
		}
	}
}

async function updateWhalesWithApiData() {
	if ((transactions || offers) && ETH_US)
	{
		if ((JSON.stringify(offers) != JSON.stringify(lastOffers)) || (JSON.stringify(transactions) != JSON.stringify(lastTransactions))){
			clean_chart('recurrent');
			waitForElement("#whales_helper", 1000)
			.then( () => {
				updateWhales();
				if (preferences['DarkMode']) { updateDark(); } 
			});
		}
	}
}

if (lastUrl.startsWith('https://nft.gamestop.com/token/')) { token_page(); }

async function token_page() {
	await readPreferences();

	if (lastUrl.startsWith("https://nft.gamestop.com/token/")) {
		
		if (preferences['DarkMode']) { updateDark(); } 
		
		if (preferences['StickMenu']) { stickThing('bar', 'sc-FNXRL', {stickyDirection : 'both',stickyMedia: 1281, stickyDelay: 20}, activate=true); }

		if (window.innerWidth >= 1281){ 
			moveThings(); 
			if (preferences['StickNFT']) {
				if (preferences['MoveTools']) { stickThing('nft', 'MediaContainer-sc-1p3n06p-2', {stickyDirection: 'both', stickyMedia: 1281, stickyOffset: 80, stickyDelay: 70}, activate=true, dontReactivate=true); }
				else { stickThing('nft', 'MediaContainer-sc-1p3n06p-2', {stickyDirection: 'both', stickyMedia: 1281, stickyOffset: 160, stickyDelay: 70}, activate=true, dontReactivate=true); }
			}
		}

		waitForElement(".ContentContainer-sc-1p3n06p-4", 10000)
		.then( () => {
			if (preferences['ChartOffers']) { createOffersHelperContainer(); }
			if (preferences['StatsHistory'] || preferences['ChartHistory'] || preferences['ChartVolume']) { createHistoryHelperContainer(); }
			if (preferences['ChartRecurrent']) { createWhalesHelperContainer(); }
			updateNeeded = true;
		});
	}
}

if (lastUrl.startsWith("https://nft.gamestop.com/profile")) {
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