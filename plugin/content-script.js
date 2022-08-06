let lastUrl = location.href;
new MutationObserver(() => {
	const url = location.href;
	if (url !== lastUrl) {
		if (lastUrl.startsWith('https://nft.gamestop.com/token/')) { location.reload(); }
		lastUrl = url;
		if (lastUrl.startsWith('https://nft.gamestop.com/token/')) { main(); }
	}
}).observe(document, {subtree: true, childList: true});

function updateOffers(offers, rateAndFees) {
	
	let sorted = Object.keys(offers).map(function(key) {
		return [key, offers[key]];
	});

	sorted.sort(function(first, second) {
		return first[1]['pricePerNft'] - second[1]['pricePerNft'];
	});

	if (offers.length > 1) {
		removeOffersHelperPrompt();
		if (preferences['ChartOffers']) { createOffersChart(); }

		let values_eth = [offers.length];
		let values_dollars = [offers.length];
		let quantities = [offers.length];

		for (let i=0; i < offers.length; i++) {
			values_eth[i] = bestRound(parseFloat(sorted[i][1]['pricePerNft'])/Math.pow(10, 18), 4);
			values_dollars[i] = bestRound(parseFloat(sorted[i][1]['pricePerNft'])/Math.pow(10, 18)*rateAndFees['rates'][0]['quotes'][0]['rate'], 2);
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
}

function updateHistory(histories, transactions) {

	// Add 1 because of the mint
	if (histories.length > 2) {
		removeHistoryHelperPrompt();
		createHistoryStatsCharts();

		let creator = '';
		let creator_collections = Array.prototype.slice.call(document.getElementsByClassName("sc-iUKqMP"));
		creator_collections.forEach((creator_collection) => {
			if (creator_collection.getElementsByClassName("sc-iAKWXU")[0].textContent == "Creator") {
				creator = creator_collection.getElementsByClassName("sc-iAKWXU")[1].textContent;
			}
		});

		let all_transactions = false;
		for (let i=0; i < histories.length; i++) {
			if (histories[i].textContent.split(' ')[1] === 'minted') {
				histories.splice(i, 1);
				all_transactions = true;
				break;
			};
		};
		let total_eth = 0;
		let total_dollars = 0;
		let values_eth = [histories.length];
		let values_dollars = [histories.length];
		let buyers = [histories.length];
		let sellers = [histories.length];
		let labels = [histories.length];
		let agos = [histories.length];
		let amounts = [histories.length];

		transactions = transactions.filter( item => (item['transaction']['txType'] == "SpotTrade") );

		for (let i=0; i < histories.length; i++) {
			let transaction = histories[i].textContent.replace(")", ") ").split(' ');
			buyers[histories.length - 1 - i] = histories[i].querySelectorAll("strong")[0].querySelector("a").getAttribute("href").replace("/user/", "");
			sellers[histories.length - 1 - i] = histories[i].querySelectorAll("strong")[1].querySelector("a").getAttribute("href").replace("/user/", "");
			labels[histories.length - 1 - i] = `<b>${buyers[histories.length - 1 - i]}</b> bought from <b>${sellers[histories.length - 1 - i]}</b>`;
			values_eth[histories.length - 1 - i] = parseFloat(transaction[5].replace(',', ''));
			values_dollars[histories.length - 1 - i] = parseFloat(transaction[7].replace(',', '').substring(2,transaction.length-1));
			total_eth += values_eth[histories.length - 1 - i];
			total_dollars += values_dollars[histories.length - 1 - i];

			let ago_index = transaction.findIndex((element) => element === 'ago');
			agos[histories.length - 1 - i] = `${transaction[ago_index - 2]} ${transaction[ago_index - 1]}`

			amounts[histories.length - 1 - i] = transactions[i]['transaction']['orderA']['amountB'];
		}

		let maxAvailable = parseInt(document.getElementsByClassName("InfoValue-sc-11cpe2k-18")[0].textContent.split(' ')[0].split('/')[1]);

		transactions_splitter(values_eth, values_dollars, sellers, buyers, labels, agos, amounts);

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
			let [series_volume, labels_volume, all_data_volume] = get_volume_candle(count(agos));
			charts['volume']  = new ApexCharts(document.querySelector("#chart_volume"), get_options_volume(values_eth, series_volume, labels_volume, all_data_volume, themeMode));
			charts['volume'].render();
		}
		
		if (preferences['ChartRecurrent']) {
    
			let listers = [];
			if (lastOffers) {
				for (let i=0; i < lastOffers.length; i++) {
					for (let ii=0 ; ii < lastOffers[i]['amount'] ; ii++) {
						listers.push(lastOffers[i]['ownerAddress']);
					}
				}
			}

			let [series_sellers_buyers, labels_sellers_buyers] = combine_buyers_sellers(count(buyers), count(sellers), count(listers));
			charts['recurrent']  = new ApexCharts(document.querySelector("#chart_recurrent"), get_options_recurrent(series_sellers_buyers, labels_sellers_buyers, themeMode));
			charts['recurrent'].render(); 
			
			const labels = document.querySelectorAll('.chart_recurrent');
			for (let label of labels) {
				let title = label.querySelector('title').textContent;
				if (title == creator) { label.setAttribute("fill", "#1266F1"); }
				if (title == profileName) { label.setAttribute("fill", " #FF5733"); }
			}
		}
	}
}

let nft=null;

let lastHistory = '';

async function updateHistoryWithApiData(force=false) {
  let splitted_url = lastUrl.split('/');
  nft = await makeApiCall('getNft', 'tokenIdAndContractAddress', `${splitted_url[5]}_${splitted_url[4]}`)
  transactions = await makeApiCall('history', 'nftData', `${nft['loopringNftInfo']['nftData'][0]}`)
  let histories = Array.prototype.slice.call(document.getElementsByClassName("HistoryItemWrapper-sc-13gqei4-0"));
  let string = array_to_string(histories);
  if (force || string != lastHistory){
    lastHistory = string;
    clean_chart('price_history');
    clean_chart('volume');
    clean_chart('recurrent');
    updateHistory(histories, transactions);
    if (preferences['DarkMode']) { updateDark(); } 
  }
}

var lastOffers = null;
async function updateOffersWithApiData() {
	if (nft != null)
	{
		let offers = await makeApiCall('getNftOrders', 'nftId', nft['nftId']);
		if (offers.length > 1){	
			let string = array_to_string(offers);
			if (string != array_to_string(lastOffers)){
				lastOffers = offers;
				let rateAndFees = await makeApiCall('ratesAndFees');
				clean_chart('offers');
				updateOffers(offers, rateAndFees);
				updateHistoryWithApiData(force=true);
				if (preferences['DarkMode']) { updateDark(); } 
			}
		}
	}
}


async function main() {
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
			if (preferences['StatsHistory'] || preferences['ChartHistory'] || preferences['ChartVolume'] || preferences['ChartRecurrent']) { createHistoryHelperContainer(); }
 			watchers['history'] = setIntervalImmediately(function() {
				waitForElement(".HistoryItemWrapper-sc-13gqei4-0", 3000)
				.then( () => {
					updateHistoryWithApiData();
				}, () => {} );
			}, 3000);
			watchers['offers'] = setIntervalImmediately(function() {
				updateOffersWithApiData();
			}, 1000); 
		});
	}
}

if (lastUrl.startsWith('https://nft.gamestop.com/token/')) { main(); }


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