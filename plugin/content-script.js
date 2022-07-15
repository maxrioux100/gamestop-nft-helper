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

waitForElement(".HistoryItemWrapper-sc-13gqei4-0", 10000).then(function(){
	
    let histories = document.getElementsByClassName("HistoryItemWrapper-sc-13gqei4-0");
	var total = 0;
	
	for (let i=0; i < histories.length; i++) {
		total += parseFloat(histories[i].textContent.split(' ')[5]);
	}	
	
	console.log(`${histories.length} transactions found in the history for a total of ${total} ETH at an average of ${total/histories.length}`);
	
});
