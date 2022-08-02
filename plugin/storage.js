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

function persistMovePrice(tempMovePrice) {
	chrome.storage.local.set({preferenceMovePrice: tempMovePrice}, function() {
	});
}

function persistMoveTools(tempMoveTools) {
	chrome.storage.local.set({preferenceMoveTools: tempMoveTools}, function() {
	});
}

function persistStickMenu(tempStickMenu) {
	chrome.storage.local.set({preferenceStickMenu: tempStickMenu}, function() {
	});
}

async function readPreferences() {
	let preferences = {};
	preferences['MovePrice'] = await readLocalStorage('preferenceMovePrice');
	preferences['MoveTools'] = await readLocalStorage('preferenceMoveTools'); 
	preferences['StickMenu'] = await readLocalStorage('preferenceStickMenu');
	return preferences;
}