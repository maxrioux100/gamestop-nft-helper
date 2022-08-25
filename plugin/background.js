//background.js
console.log('testout');
chrome.webRequest.onCompleted.addListener(
	function(details) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {greeting: details.url});
		});
	},
	{ urls: ["https://api.nft.gamestop.com/nft-svc-marketplace/*"] }
);

