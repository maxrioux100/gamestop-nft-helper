var chart;
var chart2;
var chart3;
var chart4;

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

function writeChip(name, value){
	return 	'<div class="DetailsItem-sc-asex48-1 gyMyxn">' +
				'<div class="sc-jcFjpl ezpidm">' +
					'<p class="sc-iUKqMP fqgUlr">' +
						`<span class="sc-iAKWXU dCLfEr">${name}</span>` +
						`<span class="sc-iAKWXU sc-efQSVx dCLfEr csRHYK">${value}</span>` +
					'</p>' +
				'</div>' +
			'</div>';
}

function createOffersHelperContainer() {
  let editions = document.querySelectorAll("[class^='ButtonHoverWrapper']")[1];
  if (editions == undefined) {
    return
  }

	let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
	let div = document.createElement('div');

	div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
						'<p class="sc-bkkeKt vhTUk">Offers helper</p>' +
					'</header>' +
					'<div id="offers_helper">' +
						'<section>' +
						  '<div id="offershelperprompt">' + chrome.i18n.getMessage("offershelperprompt") + '</div>' +
						'</section>';
					'</div>' +
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
}

function updateOffers(offers) {
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
			let transaction = offers[i].getElementsByClassName("EthPriceLabel-sc-1c1tt50-1")[0].textContent;
			values_eth[i] = parseFloat(offers[i].getElementsByClassName("EthPriceLabel-sc-1c1tt50-1")[0].textContent.split(' ')[0].replace(',', ''));
			values_dollars[i] = parseFloat(offers[i].getElementsByClassName("UsdPriceLabel-sc-1c1tt50-2")[0].textContent.split(' ')[0].slice(1,).replace(',', ''));
			quantities[i] = parseInt(offers[i].getElementsByClassName("EditionsQuantity-sc-11cpe2k-11")[0].textContent);
		}

		let noOutliers = getNumberOfNonOutliers(values_eth, quantities);

		var new_values_eth = [];
		var new_values_dollars = [];
		var new_quantities = [];

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

		var options2 = {
			title: {
				text: "Future offers"
			},
			chart: {
				type: 'area',
				animations: {
					enabled: false
				},
				toolbar: {
					tools: {
						zoom: false,
						zoomin: false,
						zoomout: false,
						pan: false,
						reset: false
					}
				}
			},
			dataLabels: {
				enabled: false
			},
			series: [{
				name: 'Ethereum',
				data: new_quantities.map(function(e, i) { return [e, new_values_eth[i]]; })
			}],
			stroke: {
			  curve: 'stepline',
			  width: 1
			},
			xaxis: {
				type: "numeric",
				title: {
					text: "Number of copies to buy"
				},
				labels: {
					hideOverlappingLabels: true
				},
				decimalsInFloat: 0,
				tooltip: {
					enabled: false
				}
			},
			yaxis: [
				{
					title: {
						text: "Ethereum"
					},
					min: min_eth,
					max: max_eth
				},
				{
					opposite: true,
					title: {
						text: "Dollars"
					},
					min: min_dollars,
					max: max_dollars,
					decimalsInFloat: 2
				}
			],
			legend: {
				show: false
			},
			colors: [
				"#008FFB"
			],
			tooltip: {
				custom: function({ series, seriesIndex, dataPointIndex, w }) {
					return (
						'<div class="arrow_box">' +
							"<span>" +
								`${new_values_eth[dataPointIndex]} ETH ($${new_values_dollars[dataPointIndex]})` +
							"</span>" +
						"</div>"
					);
				}
			}
		}

		chart2 = new ApexCharts(document.querySelector("#chart2"), options2);

		chart2.render();
	}
}

function transactions_splitter(values_eth, values_dollars, sellers, buyers, labels, agos, amounts){
	for (let i = 0 ; i < amounts.length ; i++) {
		if (amounts[i] > 1) {
			let amount = amounts[i]
			let value_eth = bestRound(values_eth[i]/amount, 4);
			let value_dollars = bestRound(values_dollars[i]/amount, 2);

			values_eth[i] = value_eth;
			values_dollars[i] = value_dollars;
			amounts[i] = 1;

			for (let ii = 1 ; ii < amount ; ii++)
			{
				values_eth.splice(i, 0, value_eth);
				values_dollars.splice(i, 0, value_dollars);
				sellers.splice(i, 0, sellers[i]);
				buyers.splice(i, 0, buyers[i]);
				labels.splice(i, 0, labels[i]);
				agos.splice(i, 0, agos[i]);
				amounts.splice(i, 0, 1);
				i++;
			}
		}
	}
}

function combine_buyers_sellers(buyers, sellers, creator){

	let combined = {};
	for (let i = 0; i < Object.keys(buyers).length ; i++){
		combined[Object.keys(buyers)[i]] = buyers[Object.keys(buyers)[i]];
	}

	for (let i = 0; i < Object.keys(sellers).length ; i++){
		if (Object.keys(sellers)[i] in combined) {
			combined[Object.keys(sellers)[i]] += sellers[Object.keys(sellers)[i]];
		} else {
			combined[Object.keys(sellers)[i]] = sellers[Object.keys(sellers)[i]];
		}
	}


	var filtered = Object.keys(combined).reduce(function (filtered, key) {
		if (combined[key] > 1) filtered[key] = combined[key];
		return filtered;
	}, {});


	var sorted = Object.keys(filtered).map(function(key) {
		return [key, filtered[key]];
	});

	sorted.sort(function(first, second) {
		return second[1] - first[1];
	});

	items = sorted.slice(0, 10);

	let data_sellers = [];
	let labels = [];

	for (let i = 0; i < items.length ; i++){
		let value = 0;
		if (items[i][0] in sellers && items[i][0] != creator) {value = sellers[items[i][0]]};
		data_sellers.push(value);
		labels.push(items[i][0]);
	}

	let data_buyers = [];

	for (let i = 0; i < items.length ; i++){
		let value = 0;
		if (items[i][0] in buyers) {value = buyers[items[i][0]]};
		data_buyers.push(value);
	}

	let data_creators = [];

	for (let i = 0; i < items.length ; i++){
		let value = 0;
		if (items[i][0] == creator) {value = sellers[items[i][0]]};
		data_creators.push(value);
	}

	let series = [{
				name: 'Creator',
				data: data_creators
			},{
				name: 'Buyers',
				data: data_buyers
			},{
				name: 'Sellers',
				data: data_sellers
			}]


	return [series, labels];
}

function get_volume_candle(agos_count){
	var sorted = Object.keys(agos_count).map(function(key) {
		return [key, agos_count[key]];
	});

	let time_sort = {'days': 301, 'day': 300, 'hours': 201, 'hour': 200, 'minutes': 101, 'minute':100};

	sorted.sort(function(first, second) {
		return (time_sort[second[0]] + second[1]) - (time_sort[first[0]] + first[1]);
	});

	let volume_data = [];
	let [first_prefix, first_suffix] = sorted[0][0].split(' ');
	let dict = sortedToDict(sorted);
	let labels = [];
	let counter = 0;

	for (let i = first_prefix ; i >= 1 ; i--) {
		let value = 0;
		let suffix = first_suffix;
		if (i==1 && suffix[suffix.length-1] == 's') {suffix = suffix.slice(0, suffix.length-1);}
		if (`${i} ${suffix}` in dict) { value = dict[`${i} ${suffix}`]; }
		else {sorted.splice(counter, 0, sorted[counter]);}
		volume_data.push(value);
		labels.push(`${i} ${suffix} ago`);
		counter++;
	}

	let suffix = first_suffix;
	if (suffix[suffix.length-1] == 's') {suffix = suffix.slice(0, suffix.length-1);}
	volume_data.push(0);
	labels.push(`last ${suffix}`);

	let series = [{data:volume_data}];

	let suffixes = [Object.keys(dict)[0].split(' ')[1]]
	if (suffixes[0][suffixes[0].length-1] == 's') { suffixes.push(suffixes[0].slice(0, suffixes[0].length-1)) };

	for (const [key, value] of Object.entries(dict)){
		if (!suffixes.includes(key.split(' ')[1])){
			let volume_last = [];
			for (let i=0 ; i < volume_data.length-1 ; i++){
				volume_last.push(0);
			}
			volume_last.push(value);
			series.push({data:volume_last});
		}
	}
	return [series, labels, sorted];
}

function removeUnknownTransactions(transactions) {
	console.log(transactions[0]['txType']);
	return transactions.filter( item => (item['txType'] != "SpotTrade") );
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

		// Used in the recurrent buyers/sellers chart
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

		var options = {
			title: {
				text: "Price history"
			},
			chart: {
				type: 'area',
				animations: {
					enabled: false
				},
				toolbar: {
					tools: {
						zoom: false,
						zoomin: false,
						zoomout: false,
						pan: false,
						reset: false
					}
				}
			},
			series: [{
				name: 'Ethereum',
				data: values_eth
			}],
			stroke: {
			  curve: 'smooth',
			  width: 1
			},
			xaxis: {
				labels: {
					show: false
				}
			},
			yaxis: [
			    {
					title: {
						text: "Ethereum"
					},
					min: min_eth,
					max: max_eth
				},
				{
					opposite: true,
					title: {
						text: "Dollars"
					},
					min: min_dollars,
					max: max_dollars,
					decimalsInFloat: 2
				}
			],
			labels: labels,
			legend: {
				show: false
			},
			colors: colors,
			tooltip: {
				custom: function({ series, seriesIndex, dataPointIndex, w }) {
					return (
						'<div class="arrow_box">' +
							"<span>" +
								`${values_eth[dataPointIndex]} ETH ($${values_dollars[dataPointIndex]})` +
							"</span>" +
						"</div>"
					);
				}
			},
			dataLabels: {
				enabled: false
			},
			fill: {
				type: "gradient",
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.5,
					opacityTo: 0.9,
					stops: [0, 95, 100]
				}
			},
      annotations: {
        xaxis: [
          {}
        ],
      },
      markers: {
        discrete: []
      }
		}

		if (all_transactions) {
			options.annotations.xaxis.push({
					x: 0,
					borderColor: '#999',
					yAxisIndex: 0,
					label: {
						show: true,
						text: 'Minted',
						offsetX: 10,
						style: {
							color: "#fff",
							background: '#775DD0'
						}
					}
				});
			}
    if (profileName) {
      for (var i = 0; i < profile_sales_index.length; i++) {
        options.markers.discrete.push({
          seriesIndex: 0,
          dataPointIndex: profile_sales_index[i],
          fillColor: '#000000',
          strokeColor: '#7c1760',
          size: 5,
          shape: "circle"
        })
      }
      for (var i = 0; i < profile_buys_index.length; i++) {
        options.markers.discrete.push({
          seriesIndex: 0,
          dataPointIndex: profile_buys_index[i],
          fillColor: '#ffffff',
          strokeColor: '#7c1760',
          size: 5,
          shape: "circle"
        })
      }
    }

		chart = new ApexCharts(document.querySelector("#chart"), options);

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


function clean_chart(chart){
	if (!(typeof chart === "undefined")) {
		chart.destroy();
	}
}
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

async function updateHistoryWithApiData() {
  let splitted_url = lastUrl.split('/');
  data = await makeApiCall('getNft', 'tokenIdAndContractAddress', `${splitted_url[5]}_${splitted_url[4]}`)
  transactions = await makeApiCall('history', 'nftData', `${data['loopringNftInfo']['nftData'][0]}`)
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
				waitForElement(".EditionsItem-sc-11cpe2k-7", 1000)
				.then( () => {
					let offers = Array.prototype.slice.call(document.getElementsByClassName("EditionsItem-sc-11cpe2k-7")).splice(1, );
					let string = array_to_string(offers);
					if (string != lastOffer){
						lastOffer = string;
						clean_chart(chart2);
						updateOffers(offers);
					}
				}, () => {} );
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
