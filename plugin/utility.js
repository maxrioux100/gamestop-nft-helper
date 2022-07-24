function sortedToDict(sorted){
	let dict = {};
	for(let i=0 ; i < sorted.length ; i++) {
		dict[sorted[i][0]] = sorted[i][1];
	}
	return dict;
}
