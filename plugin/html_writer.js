function writeChip(name){
	return 	'<div class="DetailsItem-sc-asex48-1 gyMyxn">' +
				'<div class="sc-jcFjpl ezpidm">' +
					'<p class="sc-iUKqMP fqgUlr">' +
						`<span class="sc-iAKWXU dCLfEr">${name}</span>` +
						`<span id="chip-${name}" class="sc-iAKWXU sc-efQSVx dCLfEr csRHYK"></span>` +
					'</p>' +
				'</div>' +
			'</div>';
}

function updateChips(total_eth, values_eth, total_dollars, values_dollars, change) {
	let average_elem = document.getElementById("chip-Average");
	let median_elem = document.getElementById("chip-Median");
	let std_elem = document.getElementById("chip-Std");
	let change_elem = document.getElementById("chip-Change");
	if (average_elem) {average_elem.textContent = `${bestRound(total_eth/values_eth.length, 4)} ETH ($${bestRound(total_dollars/values_eth.length, 2)})`; };
	if (median_elem) {median_elem.textContent = `${median(values_eth)} ETH ($${median(values_dollars)})`;};
	if (std_elem) {std_elem.textContent = `${bestRound(getStandardDeviation(values_eth), 4)} ETH ($${bestRound(getStandardDeviation(values_dollars), 2)})`;};
	if (change_elem) {change_elem.textContent = `${bestRound(change, 2)}%`;};
}

function createOffersHelperContainer() {
	let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
	let div = document.createElement('div');

	div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
						'<p class="sc-bkkeKt vhTUk">Offers helper</p>' +
					'</header>' +
					'<div id="chart_offers"></div>';
	div.setAttribute('id', 'offers_helper');
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
	
	waitForElement("#chart_offers", 1000)
	.then( () => {
		charts['offers'] = new ApexCharts(document.querySelector("#chart_offers"), get_options_listed_sellers(themeMode));
		charts['offers'].render();
	});
}

function createHistoryHelperContainer() {
	let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
	let div = document.createElement('div');

	div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
						'<p class="sc-bkkeKt vhTUk">History helper</p>' +
					'</header>' +
					'<section class="Details-sc-asex48-0 ceZikd" id="history_stats">' +
						writeChip('Average') +
						writeChip('Median') +
						writeChip('Std') +
						writeChip('Change') +
					'</section>' +
					'<div id="chart_price_history"></div>' +
					'<div id="chart_volume"></div>';
	div.setAttribute('id', 'history_helper');
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
	
	waitForElement("#chart_price_history", 1000)
	.then( () => {
		charts['price_history'] = new ApexCharts(document.querySelector("#chart_price_history"), get_options_price_history(themeMode));
		charts['price_history'].render();
	});
	
	waitForElement("#chart_volume", 1000)
	.then( () => {
		charts['volume'] = new ApexCharts(document.querySelector("#chart_volume"), get_options_volume(themeMode));
		charts['volume'].render();
	});
}

function createWhalesHelperContainer() {
	let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
	let div = document.createElement('div');

	div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
						'<p class="sc-bkkeKt vhTUk">Whales helper</p>' +
					'</header>' +
					'<div id="chart_recurrent"></div>';
	div.setAttribute('id', 'whales_helper');
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
	waitForElement("#chart_recurrent", 1000)
	.then( () => {
		charts['recurrent'] = new ApexCharts(document.querySelector("#chart_recurrent"), get_options_recurrent(themeMode));
		charts['recurrent'].render();
	});
}