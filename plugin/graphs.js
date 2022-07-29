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