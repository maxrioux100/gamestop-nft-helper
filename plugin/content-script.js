var chart;
var chart2;
var chart3;
var chart4;

function updateOffers(offers, rateAndFees) {
	
	let sorted = Object.keys(offers).map(function(key) {
		return [key, offers[key]];
	});

	sorted.sort(function(first, second) {
		return first[1]['pricePerNft'] - second[1]['pricePerNft'];
	});
	
	let offershelperprompt = document.getElementById("offershelperprompt");
	if (offershelperprompt != null) {offershelperprompt.remove();};

	if (offers.length > 0) {
		let chart2_elem = document.getElementById("chart2");
		if (chart2_elem != null) {chart2_elem.remove();};

		let div = document.createElement('div');
		div.setAttribute('id', 'chart2');

		let offers_helper = document.getElementById("offers_helper");

		offers_helper.appendChild(div);

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

		chart2 = new ApexCharts(document.querySelector("#chart2"), get_options_future_sellers(new_values_eth, new_values_dollars, new_quantities, min_eth, max_eth, min_dollars, max_dollars));

		chart2.render();
	}
}

function updateHistory(histories, transactions) {
	if (histories.length > 2) {
		let history_helper = document.getElementById("history_helper");
		if (history_helper != null) {history_helper.remove();};

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

		let [series_volume, labels_volume, all_data_volume] = get_volume_candle(count(agos));

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

		let [series_sellers_buyers, labels_sellers_buyers] = combine_buyers_sellers(count(buyers), count(sellers), creator);

		let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
		let div = document.createElement('div');

		div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
							'<p class="sc-bkkeKt vhTUk">History helper</p>' +
						'</header>' +
						'<section class="Details-sc-asex48-0 ceZikd">' +
							writeChip('Average', `${bestRound(total_eth/values_eth.length, 4)} ETH ($${bestRound(total_dollars/values_eth.length, 2)})`) +
							writeChip('Median', `${median(values_eth)} ETH ($${median(values_dollars)})`) +
							writeChip('Standard deviation', `${bestRound(getStandardDeviation(values_eth), 4)} ETH ($${bestRound(getStandardDeviation(values_dollars), 2)})`) +
							writeChip('Change', `${bestRound(change, 2)}%`) +
						'</section>'+
						'<section>' +
							'<div id="chart"></div>' +
							'<div id="chart3"></div>' +
							'<div id="chart4"></div>' +
						'</section>';
		div.setAttribute('id', 'history_helper');
		div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
		container.appendChild(div);

		if (min_eth == max_eth){
			min_eth = 0;
			min_dollars = 0;
			max_eth *= 2;
			max_dollars *= 2;
		}

		let colors = ['#00E396'];
		if (change < 0) {colors = ["#FF4560"];}
		else if (change == 0) {colors = ["#008FFB"];}

		chart = new ApexCharts(document.querySelector("#chart"), get_options_price_history(values_eth, values_dollars, min_eth, max_eth, min_dollars, max_dollars, labels, colors, profile_sales_index, profile_buys_index));

		chart.render();

		options3 = {
			title: {
				text: `Volume (Total : ${values_eth.length})`
			},
			chart: {
				stacked: true,
				type: 'bar',
				animations: {
					enabled: false
				}
			},
			series: series_volume,
			labels: labels_volume,
			legend: {
				show: false
			},
			tooltip: {
				custom: function({series, seriesIndex, dataPointIndex, w}) {
					let newSeriesIndex = seriesIndex;
					if (newSeriesIndex > 0) {newSeriesIndex--;}
					return '<div class="arrow_box">' +
							'<span>' + all_data_volume[dataPointIndex + newSeriesIndex][0] + ' ago : ' + all_data_volume[dataPointIndex + newSeriesIndex][1] + '</span>' +
							'</div>'
				}
			},
			theme: {
				palette: 'palette3'
			}
		}

		chart3 = new ApexCharts(document.querySelector("#chart3"), options3);

		chart3.render();

		var options4 = {
			title: {
				text: "Recurrent buyers/sellers"
			},
			chart: {
				type: 'bar',
				stacked: true,
				animations: {
					enabled: false
				}
			},
			plotOptions: {
				bar: {
					horizontal: true
				}
			},
			series: series_sellers_buyers,
			labels: labels_sellers_buyers,
			colors: ['#008FFB', '#00E396', '#FF4560'],
			xaxis: {
				decimalsInFloat: 0
			}
		}

		chart4 = new ApexCharts(document.querySelector("#chart4"), options4);

		chart4.render();
		clearInterval(watching4histories)
	}
}

let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    onUrlChange();
  }
}).observe(document, {subtree: true, childList: true});


let lastHistory = '';
let lastOffer = '';

var watching4histories = null;
var watching4offers = null;
var watching4profileName = null;

function persistProfileName(tempProfileName) {
	chrome.storage.local.set({profileName: tempProfileName}, function() {
		profileName = tempProfileName;
	});
}

function getProfileName() {
	chrome.storage.local.get(['profileName'], function(_profileName) {
		profileName = _profileName.profileName;
	});
}

let nft;

async function updateHistoryWithApiData() {
  let splitted_url = lastUrl.split('/');
  nft = await makeApiCall('getNft', 'tokenIdAndContractAddress', `${splitted_url[5]}_${splitted_url[4]}`)
  transactions = await makeApiCall('history', 'nftData', `${nft['loopringNftInfo']['nftData'][0]}`)
  let histories = Array.prototype.slice.call(document.getElementsByClassName("HistoryItemWrapper-sc-13gqei4-0"));
  let string = array_to_string(histories);
  if (string != lastHistory){
    lastHistory = string;
    clean_chart(chart);
    clean_chart(chart3);
    clean_chart(chart4);
    updateHistory(histories, transactions);
  }
}

async function updateOffersWithApiData() {
	if (nft !== undefined)
	{
		let offers = await makeApiCall('getNftOrders', 'nftId', nft['nftId']);
		let string = array_to_string(offers);
		if (string != lastOffer){
			let rateAndFees = await makeApiCall('ratesAndFees');
			lastOffer = string;
			clean_chart(chart2);
			updateOffers(offers, rateAndFees);
		}
	}
}

function onUrlChange() {
	clean_chart(chart);
	clean_chart(chart2);
	clean_chart(chart3);
	clean_chart(chart4);
	if(watching4histories) {clearInterval(watching4histories)};
	if(watching4offers) {clearInterval(watching4offers)};
	if(watching4profileName) {clearInterval(watching4profileName)};

	if (lastUrl.startsWith("https://nft.gamestop.com/token/")) {
		waitForElement("[class^='ButtonHoverWrapper']", 10000)
		.then( () => {
			createOffersHelperContainer();
				watching4histories = setInterval(function() {
					waitForElement(".HistoryItemWrapper-sc-13gqei4-0", 1000)
					.then( () => {
						updateHistoryWithApiData();
					}, () => {} );
				}, 1000);
			watching4offers = setInterval(function() {
				updateOffersWithApiData();
			}, 1000);
		});
	}
	if (lastUrl.startsWith("https://nft.gamestop.com/profile")) {
		watching4profileName = setInterval(function() {
			waitForElement(".sc-hBUSln", 1000)
			.then( () => {
				let tempProfileName = document.getElementsByClassName("sc-hBUSln")[0].textContent;
				if (tempProfileName != '') {
					persistProfileName(tempProfileName);
					clearInterval(watching4profileName);
				}
			});
		}, 1000);
	}
}

let profileName = getProfileName();
onUrlChange();
