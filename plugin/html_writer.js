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
					'<div id="offershelperprompt">' + chrome.i18n.getMessage("offershelperprompt") + '</div>';
	div.setAttribute('id', 'offers_helper');
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
}

function createHistoryHelperContainer() {
	let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
	let div = document.createElement('div');

	div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
						'<p class="sc-bkkeKt vhTUk">History helper</p>' +
					'</header>' +
					'<div id="historyhelperprompt">' + chrome.i18n.getMessage("historyhelperprompt") + '</div>';
	div.setAttribute('id', 'history_helper');
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
}

function createWhalesHelperContainer() {
	let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
	let div = document.createElement('div');

	div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
						'<p class="sc-bkkeKt vhTUk">Whales helper</p>' +
					'</header>' +
	div.setAttribute('id', 'whales_helper');
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
}


function createHistoryStatsCharts() {
	let history_stats_elem = document.getElementById("history_stats");
	if (history_stats_elem != null) {history_stats_elem.remove();};
	let chart_price_history_elem = document.getElementById("chart_price_history");
	if (chart_price_history_elem != null) {chart_price_history_elem.remove();};
	let chart_volume_elem = document.getElementById("chart_volume");
	if (chart_volume_elem != null) {chart_volume_elem.remove();};
	let chart_recurrent_elem = document.getElementById("chart_recurrent");
	if (chart_recurrent_elem != null) {chart_recurrent_elem.remove();};
	
	let section = document.createElement('section');
	section.setAttribute('id', 'history_stats');
	section.setAttribute('class', 'Details-sc-asex48-0 ceZikd');
	
	section.innerHTML = writeChip('Average') +
						writeChip('Median') +
						writeChip('Std') +
						writeChip('Change');
						
	
	let div_chart_price_history = document.createElement('div');
	div_chart_price_history.setAttribute('id', 'chart_price_history');
	let div_chart_volume = document.createElement('div');
	div_chart_volume.setAttribute('id', 'chart_volume');
	let div_chart_recurrent = document.createElement('div');
	div_chart_recurrent.setAttribute('id', 'chart_recurrent');

	let history_helper = document.getElementById("history_helper");
	if (preferences['StatsHistory']) { history_helper.appendChild(section); }
	if (preferences['ChartHistory']) { history_helper.appendChild(div_chart_price_history);	}				
	if (preferences['ChartVolume']) { history_helper.appendChild(div_chart_volume); }
}

function createOffersChart() {
	let chart_offers_elem = document.getElementById("chart_offers");
	if (chart_offers_elem != null) {chart_offers_elem.remove();};

	let div = document.createElement('div');
	div.setAttribute('id', 'chart_offers');

	let offers_helper = document.getElementById("offers_helper");
	offers_helper.appendChild(div);
}

function createWhalesChart() {
	let chart_recurrent_elem = document.getElementById("chart_recurrent");
	if (chart_recurrent_elem != null) {chart_recurrent_elem.remove();};

	let div = document.createElement('div');
	div.setAttribute('id', 'chart_recurrent');

	let offers_helper = document.getElementById("whales_helper");
	whales_helper.appendChild(div);
}

function removeOffersHelperPrompt() {
	let offershelperprompt = document.getElementById("offershelperprompt");
	if (offershelperprompt != null) {offershelperprompt.remove();};
}

function removeHistoryHelperPrompt() {
	let historyhelperprompt = document.getElementById("historyhelperprompt");
	if (historyhelperprompt != null) {historyhelperprompt.remove();};
}