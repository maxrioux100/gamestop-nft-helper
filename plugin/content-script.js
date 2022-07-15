// content-script.js

/**
 * Wait for an element before resolving a promise
 * @param {String} querySelector - Selector of element to wait for
 * @param {Integer} timeout - Milliseconds to wait before timing out, or 0 for no timeout              
 */
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
	return 	'<div class="sc-jcFjpl eXMTzZ">' +
				'<p class="sc-iUKqMP bhEpyW">' +
					`<span class="sc-iAKWXU dCLfEr">${name}</span>` + 
					`<span class="sc-iAKWXU sc-efQSVx dCLfEr jglRDD">${value}</span>` +
				'</p>' +
			'</div>';
}

function median(values){
  if(values.length ===0) throw new Error("No inputs");

  values.sort(function(a,b){
    return a-b;
  });

  var half = Math.floor(values.length / 2);
  
  if (values.length % 2)
    return values[half];
  
  return (values[half - 1] + values[half]) / 2.0;
}

waitForElement(".HistoryItemWrapper-sc-13gqei4-0", 10000).then(function(){
	
    let histories = document.getElementsByClassName("HistoryItemWrapper-sc-13gqei4-0");
	let all_transactions = 'No';
	if (histories[histories.length-1].textContent.split(' ')[1] === 'minted') {
		histories[histories.length-1].parentNode.removeChild(histories[histories.length-1]);
		all_transactions = 'Yes';
	};
	let total_eth = 0;
	let total_dollars = 0;
	let values_eth = [histories.length];
	let values_dollars = [histories.length];
	
	for (let i=0; i < histories.length; i++) {
		let transaction = histories[i].textContent.replace(")", ") ").split(' ');
		values_eth[i] = parseFloat(transaction[5]);
		values_dollars[i] = parseFloat(transaction[7].substring(2,transaction.length-1));
		total_eth += parseFloat(transaction[5]);
		total_dollars += parseFloat(transaction[7].substring(2,transaction.length-1));
	}	
	
	let first_history = histories[histories.length-1].textContent.replace(")", ") ").split(' ')
	let container = document.getElementsByClassName("ContentContainer-sc-1p3n06p-4")[0];
	let div = document.createElement('div');
	let ago_index = first_history.findIndex((element) => element === 'ago');
	
	div.innerHTML = '<header class="SectionTitle-sc-13gqei4-5 hiQCYL">' +
						'<p class="sc-bkkeKt vhTUk">History helper</p>' +
					'</header>' + 
					'<section class="MetaProperties-sc-17595j9-0 fzGCpU">' +
						writeChip('Transactions', histories.length) +
						writeChip('All transactions?', all_transactions) +
						writeChip('First transaction', `${first_history[ago_index - 2]} ${first_history[ago_index - 1]} ago`) +
						writeChip('Average', `${bestRound(total_eth/histories.length, 3)} ETH (${bestRound(total_dollars/histories.length, 2)}$)`) +
						writeChip('Median', `${median(values_eth)} ETH (${median(values_dollars)}$)`) +
					'</section>';
	div.setAttribute('class', 'ContentContainerDesktop-sc-1p3n06p-5 eVGMue'); 
	container.appendChild(div);	
});


