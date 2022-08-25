chrome.webRequest.onCompleted.addListener(
	function(details) {
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(details.tabId, {greeting: details.url});
		});
	},
	{ urls: ["https://api.nft.gamestop.com/nft-svc-marketplace/*"] }
);

