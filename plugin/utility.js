const count = (arr) => arr.reduce((ac,a) => (ac[a] = ac[a] + 1 || 1,ac),{});

function sortedToDict(sorted){
	let dict = {};
	for(let i=0 ; i < sorted.length ; i++) {
		dict[sorted[i][0]] = sorted[i][1];
	}
	return dict;
}

function array_to_string(array){
	let output = '';
	array.forEach((value) => {output += value.textContent});
	return output

}

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
