var charts = {};
charts['price_history'] = null;
charts['offers'] = null;
charts['volume'] = null;
charts['recurrent'] = null;

function clean_chart(name){
	if (charts[name] != null) {
		charts[name].destroy();
	}
}

function clean_charts(){
	for (const [key, value] of Object.entries(charts)) {
		if (value != null) {
			value.destroy();
		}
	}
}

function combine_buyers_sellers(buyers, sellers){

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


	let filtered = Object.keys(combined).reduce(function (filtered, key) {
		if (combined[key] > 1) filtered[key] = combined[key];
		return filtered;
	}, {});


	let sorted = Object.keys(filtered).map(function(key) {
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
		if (items[i][0] in sellers) {value = sellers[items[i][0]]};
		data_sellers.push(value);
		labels.push(items[i][0]);
	}

	let data_buyers = [];

	for (let i = 0; i < items.length ; i++){
		let value = 0;
		if (items[i][0] in buyers) {value = buyers[items[i][0]]};
		data_buyers.push(value);
	}

	let series = [{
				name: 'Bought',
				data: data_buyers
			},{
				name: 'Sold',
				data: data_sellers
			}]


	return [series, labels];
}

function get_volume_candle(agos_count){
	let sorted = Object.keys(agos_count).map(function(key) {
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

function getTickAmount(quantities) {
	let maxTick = 0;
	
	for (let i = 15 ; i >= 0 ; i--){ 
		if (quantities % i == 0 && i > maxTick) { maxTick = i; }
	}	
	
	if (maxTick == 0) {maxTick = undefined}
	return maxTick;
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
			tickAmount: getTickAmount(quantities[quantities.length-1]),
			decimalsInFloat: 0,
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

function get_options_price_history(values_eth, values_dollars, min_eth, max_eth, min_dollars, max_dollars, labels, colors, all_transactions, profile_sales_index, profile_buys_index){
	
	let options = {
		title: {
			text: "Price history"
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
		series: [{
			name: 'Ethereum',
			data: values_eth
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
		colors: colors,
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
		},
		dataLabels: {
			enabled: false
		},
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.5,
				opacityTo: 0.9,
				stops: [0, 95, 100]
			}
		},
		annotations: {
			xaxis: [
				{}
			],
		},
			markers: {
				discrete: []
			}
		}

		if (all_transactions) {
			options.annotations.xaxis.push({
				x: 0,
				borderColor: '#999',
				yAxisIndex: 0,
				label: {
					show: true,
					text: 'Minted',
					offsetX: 10,
					style: {
						color: "#fff",
						background: '#775DD0'
					}
				}
			});
		}
		if (profileName) {
			for (var i = 0; i < profile_sales_index.length; i++) {
				options.markers.discrete.push({
					seriesIndex: 0,
					dataPointIndex: profile_sales_index[i],
					fillColor: '#000000',
					strokeColor: '#7c1760',
					size: 5,
					shape: "circle"
				})
			}
			for (var i = 0; i < profile_buys_index.length; i++) {
				options.markers.discrete.push({
					seriesIndex: 0,
					dataPointIndex: profile_buys_index[i],
					fillColor: '#ffffff',
					strokeColor: '#7c1760',
					size: 5,
					shape: "circle"
				})
			}
		}
		return options;
}

function get_options_volume(values_eth, series_volume, labels_volume, all_data_volume) {
	return {
		title: {
			text: `Volume (Total : ${values_eth.length})`
		},
		chart: {
			stacked: true,
			type: 'bar',
			animations: {
				enabled: false
			}
		},
		series: series_volume,
		labels: labels_volume,
		legend: {
			show: false
		},
		tooltip: {
			custom: function({series, seriesIndex, dataPointIndex, w}) {
				let newSeriesIndex = seriesIndex;
				if (newSeriesIndex > 0) {newSeriesIndex--;}
				return '<div class="arrow_box">' +
						'<span>' + all_data_volume[dataPointIndex + newSeriesIndex][0] + ' ago : ' + all_data_volume[dataPointIndex + newSeriesIndex][1] + '</span>' +
						'</div>'
			}
		},
		theme: {
			palette: 'palette3'
		}
	}
}

function get_options_recurrent(series_sellers_buyers, labels_sellers_buyers){
	return {
		title: {
			text: "Recurrent buyers/sellers"
		},
		chart: {
			type: 'bar',
			stacked: true,
			animations: {
				enabled: false
			}
		},
		plotOptions: {
			bar: {
				horizontal: true
			}
		},
		series: series_sellers_buyers,
		labels: labels_sellers_buyers,
		colors: ['#00E396', '#FF4560'],
		xaxis: {
			decimalsInFloat: 0
		},
		yaxis: {
			labels: {
				style: {
					cssClass: 'chart_recurrent'
				}
			}
		}
	}
}