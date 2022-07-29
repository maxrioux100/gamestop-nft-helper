function bestRound(value, decimals){
	return Math.round((value + Number.EPSILON) * Math.pow(10, decimals)) / Math.pow(10, decimals);
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

function getRealQ1Q3(values, quantities, index){
	let realI = 0;
	for(let i = 0; i < values.length ; i++){
		realI += quantities[i];
		if (realI > index) {return values[i];}
	}
}

function getNumberOfNonOutliers(someArray, quantities) {
    var values = [...someArray];

	var sums = quantities.reduce((partialSum, a) => partialSum + a, 0);

    var q1 = getRealQ1Q3(values, quantities, Math.floor((sums/ 4)));
    var q3 = getRealQ1Q3(values, quantities, Math.ceil((sums * (3 / 4))));
    var iqr = q3 - q1;

    maxValue = Math.min(q3 + iqr*1.5, values[0]*5);
	
    var filteredValues = values.filter(function(x) {
        return (x <= maxValue);
    });

    return filteredValues.length;
}

function getStandardDeviation(array) {
  const n = array.length
  const mean = array.reduce((a, b) => a + b) / n
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}
