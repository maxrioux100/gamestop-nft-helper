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

function updateGraph() {
	let histories = Array.prototype.slice.call(document.getElementsByClassName("HistoryItemWrapper-sc-13gqei4-0"));
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
			labels[histories.length - 1 - i] = `<b>${transaction[0]}</b> bought from <b>${transaction[3]}</b>`;
			values_eth[histories.length - 1 - i] = parseFloat(transaction[5].replace(',', ''));
			values_dollars[histories.length - 1 - i] = parseFloat(transaction[7].replace(',', '').substring(2,transaction.length-1));
			total_eth += parseFloat(transaction[5]);
			total_dollars += parseFloat(transaction[7].substring(2,transaction.length-1));
			if (values_eth[histories.length - 1 - i] < min_eth) { min_eth = values_eth[histories.length - 1 - i]; }
			if (values_dollars[histories.length - 1 - i] < min_dollars) { min_dollars = values_dollars[histories.length - 1 - i]; }
			if (values_eth[histories.length - 1 - i] > max_eth) { max_eth = values_eth[histories.length - 1 - i]; }
			if (values_dollars[histories.length - 1 - i] > max_dollars) { max_dollars = values_dollars[histories.length - 1 - i]; }
		}	
		
		
		let first_history = histories[histories.length-1].textContent.replace(")", ") ").split(' ')
		let last_history = histories[0].textContent.replace(")", ") ").split(' ')
		let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
		let div = document.createElement('div');
		let ago_index = first_history.findIndex((element) => element === 'ago');
		
		div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
							'<p class="sc-bkkeKt vhTUk">History helper</p>' +
						'</header>' + 
						'<section class="Details-sc-asex48-0 ceZikd">' +				
							writeChip('Transactions', histories.length) +
							writeChip('All transactions?', all_transactions) +
							writeChip('First transaction', `${first_history[ago_index - 2]} ${first_history[ago_index - 1]} ago`) +
							writeChip('Last transaction', `${last_history[ago_index - 2]} ${last_history[ago_index - 1]} ago`) +
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

function onUrlChange() {
  if (lastUrl.startsWith("https://nft.gamestop.com/token/")) {
	  waitForElement(".HistoryItemWrapper-sc-13gqei4-0", 10000).then(updateGraph);
  }
}

onUrlChange();


