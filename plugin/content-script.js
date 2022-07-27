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

function experimental_transactions_splitter(values_eth, values_dollars, sellers, buyers, labels, agos, creator, maxAvailable){
	//split the transactions with the creator as the seller
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
			let factor = Math.min(values_eth[i]/min_value_eth, maxAvailable);
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

	//split the transaction when detecting a very fast change close to an integer factor

	let lastValue = null;

	for (let i = 0 ; i < values_eth.length ; i++) {
		if (lastValue) {
			let factor = values_eth[i]/lastValue;
			let ceilFactor = Math.min(Math.ceil(factor)+1, maxAvailable);

			let closestFactor = null;
			let closestRatio = -1;

			for (let j=2 ; j <= ceilFactor ; j++) {
				let ratio = Math.abs(factor/j-1);
				if (bestRound(values_eth[i]/j, 6) == values_eth[i]/j) {
					if (closestRatio < 0 || ratio < closestRatio) {
						closestRatio = ratio;
						closestFactor = j;
					}
				}
			}
			if (closestRatio >= 0 && closestRatio < 0.25) {
				values_eth[i] /= closestFactor;
				values_dollars[i] = bestRound(values_dollars[i]/closestFactor, 2);
				for (let ii = 1 ; ii < closestFactor ; ii++)
				{
					values_eth.splice(i, 0, values_eth[i]);
					values_dollars.splice(i, 0, values_dollars[i]);
					sellers.splice(i, 0, sellers[i]);
					buyers.splice(i, 0, buyers[i]);
					labels.splice(i, 0, labels[i]);
					agos.splice(i, 0, agos[i]);
					i++;
				}
			}
		}
		lastValue = values_eth[i];
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
  let data_profile_sells = [];
	let labels = [];

	for (let i = 0; i < items.length ; i++){
		let value = 0;
    let user = items[i][0];
		if (user in sellers && user != creator) {
      value = sellers[user]
      data_sellers.push(value);
      labels.push(user);
    }
    if (user in sellers && user != creator && user == profileName){
      value = sellers[user]
      data_profile_sells.push(value);
      labels.push(user);
    }
	}

	let data_buyers = [];
  let data_profile_buys = [];

	for (let i = 0; i < items.length ; i++){
		let value = 0;
    let user = items[i][0];
		if (user in buyers) {
      value = buyers[user]
      data_buyers.push(value);
    }
    if (user in buyers && user == profileName){
      value = buyers[user]
      data_profile_buys.push(value);
    }
	}

	let data_creators = [];

	for (let i = 0; i < items.length ; i++){
		let value = 0;
		if (items[i][0] == creator) {value = sellers[items[i][0]]};
		data_creators.push(value);
	}
  //
  // let data_profile_buys = [];
  // for (let i = 0; i < items.length ; i++){
  //   let value = 0;
  //   if (items[i][0] == profileName) {value = }
  // }

	let series = [{
				name: 'Creator',
				data: data_creators
			},{
				name: 'Buyers',
				data: data_buyers
			},{
				name: 'Sellers',
				data: data_sellers
			},{
        name: 'Profile Buys',
        data: data_profile_buys
      }, {
        name: 'Profile Sells',
        data: data_profile_sells
      }]


	return [series, labels];

}

function sortedToDict(sorted){
	let dict = {};
	for(let i=0 ; i < sorted.length ; i++) {
		dict[sorted[i][0]] = sorted[i][1];
	}
	return dict;
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

function getStandardDeviation (array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
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

		let maxAvailable = parseInt(document.getElementsByClassName("InfoValue-sc-11cpe2k-18")[0].textContent.split(' ')[0].split('/')[1]);

		experimental_transactions_splitter(values_eth, values_dollars, sellers, buyers, labels, agos, creator, maxAvailable);

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
							writeChip('Average', `${bestRound(total_eth/values_eth.length, 3)} ETH ($${bestRound(total_dollars/values_eth.length, 2)})`) +
							writeChip('Median', `${median(values_eth)} ETH ($${median(values_dollars)})`) +
							writeChip('Standard deviation', `${bestRound(getStandardDeviation(values_eth), 3)} ETH ($${bestRound(getStandardDeviation(values_dollars), 2)})`) +
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


function clean_chart(chart){
	if (!(typeof chart === "undefined")) {
		chart.destroy();
	}
}
var watching4histories = null;
var watching4offers = null;
var watching4profileName = null;

function persistProfileName(profileName) {
	chrome.storage.local.set({profileName: profileName}, function() {
		profileName = profileName;
	});
}

function getProfileName() {
	chrome.storage.local.get(['profileName'], function(_profileName) {
		profileName = _profileName.profileName;
	});
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
					let histories = Array.prototype.slice.call(document.getElementsByClassName("HistoryItemWrapper-sc-13gqei4-0"));
					let string = array_to_string(histories);
					if (string != lastHistory){
						lastHistory = string;
						clean_chart(chart);
						clean_chart(chart3);
						clean_chart(chart4);
						updateHistory(histories);
					}
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
			waitForElement(".sc-hBUSln", 10000)
			.then( () => {
				let profileName = document.getElementsByClassName("sc-hBUSln")[0].textContent;
				persistProfileName(profileName);
				clearInterval(watching4profileName)
			});
		}, 1000);
	}
}

let profileName = getProfileName();
onUrlChange();
