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

var preferences = {};
preferences['MovePrice'] = null;
preferences['MoveTools'] = null; 
preferences['StickMenu'] = null;

function persistPreferences(dictionnary) {
	chrome.storage.local.set(dictionnary, function() {});
}

async function readPreferences() {
	for(let key in preferences) {
		preferences[key] = await readLocalStorage(key);
	}
}