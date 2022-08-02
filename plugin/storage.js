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
	return new Promise((resolve, reject) => {
		chrome.storage.local.get([key], function (result) {
			if (result[key] === undefined) {
				reject();
			} else {
				resolve(result[key]);
			}
		});
	});
};

function persistMovePrice(tempMovePrice) {
	chrome.storage.local.set({preferenceMovePrice: tempMovePrice}, function() {
	});
}

function persistMoveTools(tempMoveTools) {
	chrome.storage.local.set({preferenceMoveTools: tempMoveTools}, function() {
	});
}

async function readPreferences() {
	let preferences = {};
	preferences['MovePrice'] = await readLocalStorage('preferenceMovePrice');
	preferences['MoveTools'] = await readLocalStorage('preferenceMoveTools');
	return preferences;
}