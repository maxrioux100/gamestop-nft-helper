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
		setIntervalImmediately( () => {
			i++;
			chrome.storage.local.get([key], function (result) {
				if (result[key] != undefined) {
					resolve(result[key]);
				}
			});
			if (i >= 2) { resolve(true); }
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