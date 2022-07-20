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

function bestRound(value, decimals){
	return Math.round((value + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
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

function median(values){
  if(values.length ===0) throw new Error("No inputs");

  let sorted_values = [...values];


  sorted_values.sort(function(a,b){
    return a-b;
  });

  var half = Math.floor(sorted_values.length / 2);

  if (sorted_values.length % 2)
    return sorted_values[half];

  return bestRound((sorted_values[half - 1] + sorted_values[half]) / 2.0, 6);

}

function getRealQ1Q3(values, quantities, index){
	let realI = 0;
	for(let i = 0; i < values.length ; i++){
		realI += quantities[i];
		if (realI > index) {return values[i];}
	}
}

function getNumberOfNonOutliers(someArray, quantities) {
    var values = [...someArray];

	var sums = quantities.reduce((partialSum, a) => partialSum + a, 0);

    var q1 = getRealQ1Q3(values, quantities, Math.floor((sums/ 4)));
    var q3 = getRealQ1Q3(values, quantities, Math.ceil((sums * (3 / 4))));
    var iqr = q3 - q1;

    maxValue = q3 + iqr*1.5;

    var filteredValues = values.filter(function(x) {
        return (x <= maxValue);
    });

    return filteredValues.length;
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

		var chart2 = new ApexCharts(document.querySelector("#chart2"), options2);

		chart2.render();
	}
}

function experimental_transactions_splitter(values_eth, values_dollars, sellers, buyers, labels, agos, creator){
	let min_value_eth = 9999999999;
	let min_value_dollars = 999999999;

	for (let i = 0 ; i < values_eth.length ; i++) {
		if (sellers[i] == creator && min_value_eth > values_eth[i]) {
			min_value_eth = values_eth[i];
			min_value_dollars = values_dollars[i];
		}
	}

	for (let i = 0 ; i < values_eth.length ; i++) {
		if (sellers[i] == creator && values_eth[i] > min_value_eth) {
			let factor = values_eth[i]/min_value_eth;
			values_eth[i] = min_value_eth;
			values_dollars[i] = min_value_dollars;
			for (let ii = 1 ; ii < factor ; ii++)
			{
				values_eth.splice(i, 0, min_value_eth);
				values_dollars.splice(i, 0, min_value_dollars);
				sellers.splice(i, 0, sellers[i]);
				buyers.splice(i, 0, buyers[i]);
				labels.splice(i, 0, labels[i]);
				agos.splice(i, 0, agos[i]);
				i++;
			}
		}
	}
}

const count = (arr) => arr.reduce((ac,a) => (ac[a] = ac[a] + 1 || 1,ac),{});

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

function updateHistory(histories) {
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

		let all_transactions = 'No';
		for (let i=0; i < histories.length; i++) {
			if (histories[i].textContent.split(' ')[1] === 'minted') {
				histories.splice(i, 1);
				all_transactions = 'Yes';
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
		}

		experimental_transactions_splitter(values_eth, values_dollars, sellers, buyers, labels, agos, creator);

		let min_eth = Math.min(...values_eth);
		let min_dollars = Math.min(...values_dollars);
		let max_eth = Math.max(...values_eth);
		let max_dollars = Math.max(...values_dollars);

		let change = values_eth[values_eth.length-1]/values_eth[0]*100-100;
		
		let [series_sellers_buyers, labels_sellers_buyers] = combine_buyers_sellers(count(buyers), count(sellers), creator);

		let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
		let div = document.createElement('div');

		div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
							'<p class="sc-bkkeKt vhTUk">History helper</p>' +
						'</header>' +
						'<section class="Details-sc-asex48-0 ceZikd">' +
							writeChip('Transactions', values_eth.length) +
							writeChip('All transactions?', all_transactions) +
							writeChip('First transaction', `${agos[0]} ago`) +
							writeChip('Last transaction', `${agos[agos.length-1]} ago`) +
							writeChip('Average', `${bestRound(total_eth/values_eth.length, 3)} ETH ($${bestRound(total_dollars/values_eth.length, 2)})`) +
							writeChip('Median', `${median(values_eth)} ETH ($${median(values_dollars)})`) +
							writeChip('Min', `${min_eth} ETH ($${min_dollars})`) +
							writeChip('Max', `${max_eth} ETH ($${max_dollars})`) +
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
		if (change < 0) {colors = ["#FF4560"]};

		var options = {
			title: {
				text: "Price history"
			},
			chart: {
				type: 'area',
				animations: {
					enabled: false
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
			}
		}

		var chart = new ApexCharts(document.querySelector("#chart"), options);

		chart.render();
		
		
		var options3 = {
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

		var chart3 = new ApexCharts(document.querySelector("#chart3"), options3);

		chart3.render();
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


function array_to_string(array){
	let output = '';
	array.forEach((value) => {output += value.textContent});
	return output

}

let lastHistory = '';
let lastOffer = '';

function onUrlChange() {
	if (lastUrl.startsWith("https://nft.gamestop.com/token/")) {
		waitForElement("[class^='ButtonHoverWrapper']", 10000)
		.then( () => {
			createOffersHelperContainer();

			var intervalHistories = setInterval(function() {
				waitForElement(".HistoryItemWrapper-sc-13gqei4-0", 1000)
				.then( () => {
					let histories = Array.prototype.slice.call(document.getElementsByClassName("HistoryItemWrapper-sc-13gqei4-0"));
					let string = array_to_string(histories);
					if (string != lastHistory){
						lastHistory = string;
						updateHistory(histories);
					}
				}, () => {} );
			}, 1000);

			var intervalOffers = setInterval(function() {
				waitForElement(".EditionsItem-sc-11cpe2k-7", 1000)
				.then( () => {
					let offers = Array.prototype.slice.call(document.getElementsByClassName("EditionsItem-sc-11cpe2k-7")).splice(1, );
					let string = array_to_string(offers);
					if (string != lastOffer){
						lastOffer = string;
						updateOffers(offers);
					}
				}, () => {} );
			}, 1000);
		});
	}
}

onUrlChange();
