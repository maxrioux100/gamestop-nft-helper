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
preferences['MovePrice'] = true;
preferences['MoveTools'] = true; 
preferences['StickMenu'] = true;

function persistMovePrice(tempMovePrice) {
	chrome.storage.local.set({MovePrice: tempMovePrice}, function() {
	});
}

function persistMoveTools(tempMoveTools) {
	chrome.storage.local.set({MoveTools: tempMoveTools}, function() {
	});
}

function persistStickMenu(tempStickMenu) {
	chrome.storage.local.set({StickMenu: tempStickMenu}, function() {
	});
}

async function readPreferences() {
	preferences['MovePrice'] = await readLocalStorage('MovePrice');
	preferences['MoveTools'] = await readLocalStorage('MoveTools'); 
	preferences['StickMenu'] = await readLocalStorage('StickMenu');
}