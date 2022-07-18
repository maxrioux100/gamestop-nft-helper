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

function getNoOutliers(someArray) {
    var values = [...someArray];

    var q1 = values[Math.floor((values.length / 4))];
    // Likewise for q3.
    var q3 = values[Math.ceil((values.length * (3 / 4)))];
    var iqr = q3 - q1;

    // Then find min and max values
    maxValue = q3 + iqr*1.5;

    // Then filter anything beyond or beneath these values.
    var filteredValues = values.filter(function(x) {
        return (x <= maxValue);
    });

    // Then return
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
					'<section>' +
					  '<div id="offershelperprompt">' + chrome.i18n.getMessage("offershelperprompt") + '</div>' +
						'<div id="chart2"></div>' +
					'</section>';
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
}

function updateOffers() {
	document.getElementById("offershelperprompt").remove()
	let offers = Array.prototype.slice.call(document.getElementsByClassName("EditionsItem-sc-11cpe2k-7")).splice(1, );

	let values_eth = [offers.length];
	let values_dollars = [offers.length];
	let quantities = [offers.length];

	for (let i=0; i < offers.length; i++) {
		let transaction = offers[i].getElementsByClassName("EthPriceLabel-sc-1c1tt50-1")[0].textContent;
		values_eth[i] = parseFloat(offers[i].getElementsByClassName("EthPriceLabel-sc-1c1tt50-1")[0].textContent.split(' ')[0].replace(',', ''));
		values_dollars[i] = parseFloat(offers[i].getElementsByClassName("UsdPriceLabel-sc-1c1tt50-2")[0].textContent.split(' ')[0].slice(1,).replace(',', ''));
		quantities[i] = parseInt(offers[i].getElementsByClassName("EditionsQuantity-sc-11cpe2k-11")[0].textContent);
	}

	let noOutliers = getNoOutliers(values_eth);

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
		var options2 = {
			chart: {
				type: 'line',
				animations: {
					enabled: false
				}
			},
			series: [{
				name: 'Ethereum',
				data: new_quantities.map(function(e, i) { return [e, new_values_eth[i]]; })
			},{
				name: 'Dollars',
				data: new_quantities.map(function(e, i) { return [e, new_values_dollars[i]]; })
			}],
			stroke: {
			  curve: 'stepline',
			  width: 1
			},
			xaxis: {
				title: {
					text: "Number of copies to buy"
				},
				labels: {
					show: false
				}
			},
			yaxis: [
			    {
					title: {
						text: "Ethereum"
					},
					max: new_values_eth[new_values_eth.length-1]
				},
				{
					opposite: true,
					title: {
						text: "Dollars"
					},
					max: new_values_dollars[new_values_dollars.length-1],
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
								`${new_values_eth[dataPointIndex]} ETH (${new_values_dollars[dataPointIndex]}$)` +
							"</span>" +
						"</div>"
					);
				}
			}
		}

		var chart2 = new ApexCharts(document.querySelector("#chart2"), options2);

		chart2.render();
}

function updateHistory(histories) {
	if (histories.length > 2) {

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
		let min_eth = 9999999999;
		let min_dollars = 9999999999;
		let max_eth = 0;
		let max_dollars = 0;
		let labels = [histories.length];

		for (let i=0; i < histories.length; i++) {
			let transaction = histories[i].textContent.replace(")", ") ").split(' ');
			buyer_account = histories[i].querySelectorAll("strong")[0].querySelector("a").getAttribute("href").replace("/user/", "")
			seller_account = histories[i].querySelectorAll("strong")[1].querySelector("a").getAttribute("href").replace("/user/", "")
			labels[histories.length - 1 - i] = `<b>${buyer_account}</b> bought from <b>${seller_account}</b>`;
			values_eth[histories.length - 1 - i] = parseFloat(transaction[5].replace(',', ''));
			values_dollars[histories.length - 1 - i] = parseFloat(transaction[7].replace(',', '').substring(2,transaction.length-1));
			total_eth += values_eth[histories.length - 1 - i];
			total_dollars += values_dollars[histories.length - 1 - i];
			if (values_eth[histories.length - 1 - i] < min_eth) { min_eth = values_eth[histories.length - 1 - i]; }
			if (values_dollars[histories.length - 1 - i] < min_dollars) { min_dollars = values_dollars[histories.length - 1 - i]; }
			if (values_eth[histories.length - 1 - i] > max_eth) { max_eth = values_eth[histories.length - 1 - i]; }
			if (values_dollars[histories.length - 1 - i] > max_dollars) { max_dollars = values_dollars[histories.length - 1 - i]; }
		}


		let first_history = histories[histories.length-1].textContent.replace(")", ") ").split(' ')
		let last_history = histories[0].textContent.replace(")", ") ").split(' ')
		let ago_first = first_history.findIndex((element) => element === 'ago');
		let ago_last = last_history.findIndex((element) => element === 'ago');

		let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
		let div = document.createElement('div');

		div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
							'<p class="sc-bkkeKt vhTUk">History helper</p>' +
						'</header>' +
						'<section class="Details-sc-asex48-0 ceZikd">' +
							writeChip('Transactions', histories.length) +
							writeChip('All transactions?', all_transactions) +
							writeChip('First transaction', `${first_history[ago_first - 2]} ${first_history[ago_first - 1]} ago`) +
							writeChip('Last transaction', `${last_history[ago_last - 2]} ${last_history[ago_last - 1]} ago`) +
							writeChip('Average', `${bestRound(total_eth/histories.length, 3)} ETH (${bestRound(total_dollars/histories.length, 2)}$)`) +
							writeChip('Median', `${median(values_eth)} ETH (${median(values_dollars)}$)`) +
							writeChip('Min', `${min_eth} ETH (${min_dollars}$)`) +
							writeChip('Max', `${max_eth} ETH (${max_dollars}$)`) +
						'</section>'+
						'<section>' +
							'<div id="chart"></div>' +
						'</section>';
		div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
		container.appendChild(div);

		var options = {
			chart: {
				type: 'line',
				animations: {
					enabled: false
				}
			},
			series: [{
				name: 'Ethereum',
				data: values_eth
			},{
				name: 'Dollars',
				data: values_dollars
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
			colors: [
				"#008FFB"
			],
			tooltip: {
				custom: function({ series, seriesIndex, dataPointIndex, w }) {
					return (
						'<div class="arrow_box">' +
							"<span>" +
								`${values_eth[dataPointIndex]} ETH (${values_dollars[dataPointIndex]}$)` +
							"</span>" +
						"</div>"
					);
				}
			}
		}

		var chart = new ApexCharts(document.querySelector("#chart"), options);

		chart.render();
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

var waiting_for_offers = false;
let lastHistory = '';

function onUrlChange() {
	if (lastUrl.startsWith("https://nft.gamestop.com/token/")) {
		var intervalId = setInterval(function() {
	  		waitForElement(".HistoryItemWrapper-sc-13gqei4-0", 1000)
			.then( () => {
				console.log('updatingHistory');
				let histories = Array.prototype.slice.call(document.getElementsByClassName("HistoryItemWrapper-sc-13gqei4-0"));
				if (histories.toString() != lastHistory){
					lastHistory = histories.toString();
					updateHistory(histories);
				}
			})
		}, 1000);
		waitForElement("[class^='ButtonHoverWrapper']", 1000)
			.then(createOffersHelperContainer);
		if (!waiting_for_offers) {
			waiting_for_offers = true
			waitForElement(".EditionsItem-sc-11cpe2k-7")
			.then(updateOffers)
			.then(() => waiting_for_offers = false);
		}
	}
}

onUrlChange();
