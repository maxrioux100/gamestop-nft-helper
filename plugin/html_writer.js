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

function createHistoryHelper(total_eth, values_eth, total_dollars, values_dollars, change) {
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
						'<div id="chart_price_history"></div>' +
						'<div id="chart_volume"></div>' +
						'<div id="chart_recurrent"></div>' +
					'</section>';
	div.setAttribute('id', 'history_helper');
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue');
	container.appendChild(div);
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