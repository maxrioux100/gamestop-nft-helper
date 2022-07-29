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
