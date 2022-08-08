var charts = {};
charts['price_history'] = null;
charts['offers'] = null;
charts['volume'] = null;
charts['recurrent'] = null;

function combine_buyers_sellers_listers(buyers, sellers, listers){		
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
	
	for (let i = 0; i < Object.keys(listers).length ; i++){
		if (Object.keys(listers)[i] in combined) {
			combined[Object.keys(listers)[i]] += listers[Object.keys(listers)[i]];
		} else {
			combined[Object.keys(listers)[i]] = listers[Object.keys(listers)[i]];
		}
	}

	let filtered = Object.keys(combined).reduce(function (filtered, key) {
		if (key != 0) filtered[key] = combined[key];
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
		labels.push(Usernames[items[i][0]]);
	}

	let data_buyers = [];

	for (let i = 0; i < items.length ; i++){
		let value = 0;
		if (items[i][0] in buyers) {value = buyers[items[i][0]]};
		data_buyers.push(value);
	}
	
	let data_listers = [];

	for (let i = 0; i < items.length ; i++){
		let value = 0;
		if (items[i][0] in listers) {value = listers[items[i][0]]};
		data_listers.push(value);
	}
	
	

	let series = [{
				name: 'Bought',
				data: data_buyers
			},{
				name: 'Sold',
				data: data_sellers
			},{
				name: 'Listed',
				data: data_listers
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

function get_options_listed_sellers(theme, values_eth=null, values_dollars=null, quantities=null, min_eth=null, max_eth=null, min_dollars=null, max_dollars=null){
	let options = {
		title: {
			text: "Listed offers"
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
		series: [],
		dataLabels: {
			enabled: false
		},
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
			},
			{
				opposite: true,
				title: {
					text: "Dollars"
				},
				decimalsInFloat: 2
			}
		],
		legend: {
			show: false
		},
		colors: [
			"#008FFB"
		],
		theme:{
			mode: theme
		},
		noData: {
			text: 'Need at least 2 listed offers with different price'
		}
	}
	
	if (values_eth && values_dollars) {
		options['tooltip'] = {
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
	
	if (min_eth) { options['yaxis'][0]['min'] = min_eth; }
	if (max_eth) { options['yaxis'][0]['max'] = max_eth; }
	if (min_dollars) { options['yaxis'][1]['min'] = min_dollars; }
	if (max_dollars) { options['yaxis'][1]['max'] = max_dollars; }
	
	if ( values_eth && values_dollars && quantities) { 
		options['series'].push({
			name: 'Ethereum',
			data: quantities.map(function(e, i) { return [e, values_eth[i]]; })
		});
		options['xaxis']['tickAmount'] = getTickAmount(quantities[quantities.length-1]); 
		
		options['tooltip'] = {
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
	
	return options;
}

function get_options_price_history(theme, values_eth=null, values_dollars=null, min_eth=null, max_eth=null, min_dollars=null, max_dollars=null, labels=null, colors=null, all_transactions=null, profile_sales_index=null, profile_buys_index=null){
	
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
		series: [],
		stroke: {
		  curve: 'smooth',
		  width: 1
		},
		xaxis: {
			labels: {
				show: false
			},
			axisTicks: {
					show: false
				}
		},
		yaxis: [
			{
				title: {
					text: "Ethereum"
				},
			},
			{
				opposite: true,
				title: {
					text: "Dollars"
				},
				decimalsInFloat: 2
			}
		],
		labels: labels,
		legend: {
			show: false
		},
		dataLabels: {
			enabled: false
		},
		annotations: {
			xaxis: [
				{}
			]
		},
		markers: {
			discrete: []
		},
		theme: {
			mode: theme
		},
		noData: {
			text: 'Need to have been sold at least 2 times'
		}
	}

	if (values_eth && values_dollars) { 
		options.series.push({
			name: 'Ethereum',
			data: values_eth
		}); 
		options['tooltip'] = {
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
	
	if (min_eth) { options['yaxis'][0]['min'] = min_eth; }
	if (max_eth) { options['yaxis'][0]['max'] = max_eth; }
	if (min_dollars) { options['yaxis'][1]['min'] = min_dollars; }
	if (max_dollars) { options['yaxis'][1]['max'] = max_dollars; }
	
	if (colors) { options['colors'] = colors; }

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
		if (profile_sales_index) {
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
		}
		if (profile_sales_index) {
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
	}
	return options;
}

function get_options_volume(theme, values_eth=null, series_volume=null, labels_volume=null, all_data_volume=null) {
	let options = {
		title: {
			text: 'Volume'
		},
		chart: {
			stacked: true,
			type: 'bar',
			animations: {
				enabled: false
			}
		},
		series: [],
		legend: {
			show: false
		},
		theme: {
			mode: theme,
			palette: 'palette3'
		},
		noData: {
			text: 'Need to have been sold at least 2 times'
		}
	}
	
	if (values_eth) { options['title'] = { text: `Volume (Total : ${values_eth.length})` }; }
	if (series_volume) { options['series'] = series_volume; }
	if (labels_volume) { options['labels'] = labels_volume; }
	if (all_data_volume) { 
		options['tooltip'] = {
			custom: function({series, seriesIndex, dataPointIndex, w}) {
				let newSeriesIndex = seriesIndex;
				if (newSeriesIndex > 0) {newSeriesIndex--;}
				return '<div class="arrow_box">' +
						'<span>' + all_data_volume[dataPointIndex + newSeriesIndex][0] + ' ago : ' + all_data_volume[dataPointIndex + newSeriesIndex][1] + '</span>' +
						'</div>'
			}
		}; 
	}
	
	return options;
}

function get_options_recurrent(theme, series_sellers_buyers_listers=null, labels_sellers_buyers_listers=null){
	let options = {
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
		series: [],
		colors: ['#00E396', '#FF4560', '#A300D6'],
		xaxis: {
			decimalsInFloat: 0
		},
		yaxis: {
			labels: {
				style: {
					cssClass: 'chart_recurrent'
				}
			}
		},
		theme: {
			mode:theme
		},
		noData: {
			text: 'Need to have been sold or listed at least once'
		}
	}
	if (labels_sellers_buyers_listers) { options['labels'] = labels_sellers_buyers_listers; }
	if (series_sellers_buyers_listers) { options['series'] = series_sellers_buyers_listers; }
	
	return options;
}