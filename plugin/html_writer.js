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

function createOffersHelperContainer() {
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

function createHistoryHelperContainer() {
	let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
	let div = document.createElement('div');

	div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
						'<p class="sc-bkkeKt vhTUk">History helper</p>' +
					'</header>' +
					'<div id="history_helper">' +
						'<section>' +
						  '<div id="historyhelperprompt">' + chrome.i18n.getMessage("historyhelperprompt") + '</div>' +
						'</section>';
					'</div>' +
	div.setAttribute('id', 'history_helper');
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
}

function createHistoryStatsCharts() {
	let container = document.getElementById("history_helper");
	container.innerHTML =  	'<section class="Details-sc-asex48-0 ceZikd">' +
								writeChip('Average') +
								writeChip('Median') +
								writeChip('Std') +
								writeChip('Change') +
							'</section>'+
							'<section>' +
								'<div id="chart_price_history"></div>' +
								'<div id="chart_volume"></div>' +
								'<div id="chart_recurrent"></div>' +
							'</section>';
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

function createOffersChart() {
	let chart_offers_elem = document.getElementById("chart_offers");
	if (chart_offers_elem != null) {chart_offers_elem.remove();};

	let div = document.createElement('div');
	div.setAttribute('id', 'chart_offers');

	let offers_helper = document.getElementById("offers_helper");

	offers_helper.appendChild(div);
}

function removeOffersHelperPrompt() {
	let offershelperprompt = document.getElementById("offershelperprompt");
	if (offershelperprompt != null) {offershelperprompt.remove();};
}

function removeHistoryHelperPrompt() {
	let historyhelperprompt = document.getElementById("historyhelperprompt");
	if (historyhelperprompt != null) {historyhelperprompt.remove();};
}