var preferences = {};
preferences['MovePrice'] = null;
preferences['MoveTools'] = null; 
preferences['StickMenu'] = null;
preferences['StickNFT'] = null;
preferences['ChartOffers'] = null;
preferences['ChartRecurrent'] = null;
preferences['ChartVolume'] = null;
preferences['ChartHistory'] = null;
preferences['StatsHistory'] = null;
preferences['DarkMode'] = null;
preferences['HideHistory'] = null;
preferences['HideDetails'] = null;

function persistPreferences(name, value) {
	let dict = {};
	dict[name] = value;
	chrome.storage.local.set(dict, function() {});
}

const readLocalStorage = async (key) => {
	let i = 0;
	return new Promise((resolve, reject) => {
		let interval = setIntervalImmediately( () => {
			i++;
			chrome.storage.local.get([key], function (result) {
				if (result[key] != undefined) {
					clearInterval(interval);
					resolve(result[key]);
				}
			});
			if (i >= 2) { 
				clearInterval(interval);
				resolve(true); 
			}
		}, 50);
	});
};

async function readPreferences() {
	for(let key in preferences) {
		preferences[key] = await readLocalStorage(key);
	}
}

var profileName = getProfileName();

function getProfileName() {
	chrome.storage.local.get(['profileName'], function(_profileName) {
		profileName = _profileName.profileName;
	});
}

function persistProfileName(tempProfileName) {
	chrome.storage.local.set({profileName: tempProfileName}, function() {
		profileName = tempProfileName;
	});
}


