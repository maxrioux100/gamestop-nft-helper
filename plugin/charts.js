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

function clean_chart(chart){
	if (!(typeof chart === "undefined")) {
		chart.destroy();
	}
}

function get_options_future_sellers(values_eth, values_dollars, quantities, min_eth, max_eth, min_dollars, max_dollars){
	return {
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
			data: quantities.map(function(e, i) { return [e, values_eth[i]]; })
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
			decimalsInFloat: 2,
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
							`${values_eth[dataPointIndex]} ETH ($${values_dollars[dataPointIndex]})` +
						"</span>" +
					"</div>"
				);
			}
		}
	}
}