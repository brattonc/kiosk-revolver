// Derrived from the "Rotator - Tabs" Chrome extension by Ben Hedrington.
// https://code.google.com/p/revolver-chrome-extensions/
// Licenced under Apache License 2.0 (http://www.apache.org/licenses/LICENSE-2.0)

// Global Variables - When possible pulling form Local Storage set via Options page.
var activeWindows = new Array();
var timeDelay = 10000;
var defaultSwitchTime = 30000;
var defaultSwitchTimeWhenActive = 30000;
var tabReload = true;
var tabInactive = false;
var tabAutostart = false;
var forceFullscreen = true;
var closeAllOtherTabs = true;
var reopenOnClose = true;
var forceFocus = true;
var newTabId = -1;
var currentWindowId = -1;
var currentUrlIndex = 0;
var currentTimeout;
var windowReaquiererInterval;
var trackedTabs = [];
var redirectedTabs = [];
var watchedTabs = [];

if (localStorage["inactive"]) { 
	if (localStorage["inactive"] == 'true') {
		tabInactive = true;
	} else {
		tabInactive = false;
	}
}
if (localStorage["autostart"]) { 
	if (localStorage["autostart"] == 'true') {
		tabAutostart = true;
	} else {
		tabAutostart = false;
	}
}
if (localStorage["forceFullscreen"]) { 
	if (localStorage["forceFullscreen"] == 'true') {
		forceFullscreen = true;
	} else {
		forceFullscreen = false;
	}
}
if (localStorage["closeAllOtherTabs"]) { 
	if (localStorage["closeAllOtherTabs"] == 'true') {
		closeAllOtherTabs = true;
	} else {
		closeAllOtherTabs = false;
	}
}
if (localStorage["reopenOnClose"]) { 
	if (localStorage["reopenOnClose"] == 'true') {
		reopenOnClose = true;
	} else {
		reopenOnClose = false;
	}
}
if (localStorage["forceFocus"]) { 
	if (localStorage["forceFocus"] == 'true') {
		forceFocus = true;
	} else {
		forceFocus = false;
	}
}
var urlList = [];
if (localStorage["urlListData"]) {
	var urlListData = JSON.parse(localStorage["urlListData"]);
    for (var i = 0; i < urlListData.length; i++) {
        if (urlListData[i].trim().length == 0) continue;
        var parts = urlListData[i].split(",");
        var url,
            urlSwitchTime = defaultSwitchTime,
            urlSwitchTimeWhenActive = defaultSwitchTimeWhenActive;
        if (parts.length == 1){
            url = parts[0];
        } else if (parts.length == 2){
            urlSwitchTime = parseInt(parts[0]);
            url = parts[1];
        } else if (parts.length == 3){
            urlSwitchTime = parseInt(parts[0]);
            urlSwitchTimeWhenActive = parseInt(parts[1]);
            url = parts[2];
        }
        urlList[i] = {
            switchTime: urlSwitchTime>15?urlSwitchTime:15,
            switchTimeWhenActive: urlSwitchTimeWhenActive>15?urlSwitchTimeWhenActive:15,
            url: url
            };
        //convert to seconds
        urlList[i].switchTime = urlList[i].switchTime*1000;
        urlList[i].switchTimeWhenActive = urlList[i].switchTimeWhenActive*1000;
    }
}

var urlWhiteList = [];
if (localStorage["urlWhiteList"]) {
	urlWhiteListRegexes = JSON.parse(localStorage["urlWhiteList"]);
    urlWhiteList.length = 0;
    for (i in urlWhiteListRegexes) {
        urlWhiteList.push(new RegExp(urlWhiteListRegexes[i], 'i'));
    }
}

var redirectUrl = "";
if (localStorage["redirectUrl"]) {
	redirectUrl = localStorage["redirectUrl"];
}
if (redirectUrl.trim().length == 0) {
    redirectUrl = "about:blank";
}

function include(arr,obj) {
    return (arr.indexOf(obj) != -1);
}

// Setup Initial Badge Text
var badgeColor = [139,137,137,137];
chrome.browserAction.setBadgeBackgroundColor({color: badgeColor});

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
	var windowId = tab.windowId
	if (currentWindowId != -1) {
		stop(windowId);
	} else {
		go(windowId);
	}
});

// Autostart function, procesed on initial startup.
if(tabAutostart) {
	chrome.tabs.query({'active': true, 'windowId': chrome.windows.WINDOW_ID_CURRENT},
		function(tabs){
			// Start Revolver Tabs in main window.
			go(tabs[0].windowId);
		}
	);
}

function badgeTabs(windowId, text) {
	chrome.tabs.getAllInWindow(windowId, function(tabs) {
		for(i in tabs) {
			switch (text)
			{
			case 'on':
			  chrome.browserAction.setBadgeText({text:"\u2022"});
			  chrome.browserAction.setBadgeBackgroundColor({color:[0,255,0,100]});
			  break;
			case '':
			  chrome.browserAction.setBadgeText({text:"\u00D7"});
			  chrome.browserAction.setBadgeBackgroundColor({color:[255,0,0,100]});
			  break;
			default:
			  chrome.browserAction.setBadgeText({text:""});
			}
		}	
	});
}

function onTabUpdateWhiteListChecker(tabId, changeInfo, tab) {
    if (urlWhiteList.length > 0 && tab.url != "chrome://newtab/") {
        if (tab.windowId == currentWindowId && tab.url != redirectUrl /*&& redirectedTabs.indexOf(tabId) == -1*/){
            var foundMatch = false;
            for (i in urlWhiteList) {
                foundMatch = foundMatch || urlWhiteList[i].test(tab.url);
            }
            if (foundMatch == false) {
                //redirectedTabs.push(tabId);
                chrome.tabs.update(tabId, {
                    url: redirectUrl,
                });
            }
        }
    }
}

function windowReaquierer(){
    if (currentWindowId != -1){
        chrome.windows.get(currentWindowId, function(window){
            if (chrome.runtime.lastError) {
                //suppress
            }
            if (window == null) {
                chrome.windows.getLastFocused(function(currentWindow) {
                    currentWindowId = currentWindow.id;
                    console.log('New window aquired: id:'+currentWindow.id);
                });
            }
        });
    }
}

function onWindowClose(windowId) {
    if (reopenOnClose && windowId == currentWindowId) {
        chrome.windows.create({
            type: "normal",
            focused: true
        }, function(window) {
            stop(currentWindowId);
            go(window.id);
        });
    }
}

function onFocusChange(windowId) {
    if (forceFocus && windowId != currentWindowId){
        chrome.windows.get(currentWindowId, function(window){
            if (chrome.runtime.lastError) {
                //suppress
            } else {
                if (forceFullscreen) {
                    chrome.windows.update(currentWindowId, { focused: true, state: "fullscreen" });
                } else {
                    chrome.windows.update(currentWindowId, { focused: true });
                }
            }
        });
    }
}

// Start on a specific window
function go(windowId) {
    if(urlList.length > 0) {
        chrome.tabs.create({
            url: urlList[currentUrlIndex].url, 
            active: true
        }, function(tab){
            trackTab(tab.id);
            closeUntrackedTabs();
        });
            
        currentWindowId = windowId;
        windowReaquiererInterval = setInterval(function() { windowReaquierer() }, 10000);
        currentTimeout = setTimeout(function() { moveTabIfIdle() }, urlList[currentUrlIndex].switchTime);
        console.log('Starting: timeDelay:'+urlList[currentUrlIndex].switchTime+' inactive:'+tabInactive);
        chrome.tabs.onUpdated.addListener(onTabUpdateWhiteListChecker);
        chrome.windows.onRemoved.addListener(onWindowClose);
        chrome.windows.onFocusChanged.addListener(onFocusChange);
        badgeTabs(windowId, 'on');
        
        if (forceFullscreen) chrome.windows.update(currentWindowId, { state: "fullscreen" });
        
        chrome.tabs.query({
           windowId: windowId,
        }, function(openTabs) {
            for (i in openTabs){
                watchedTabs.push({
                    ourTab: false,
                    redirected: false,
                    tabData: openTabs[i],
                });
            }
        });
    }
}

// Stop on a specific window
function stop(windowId) {
    clearInterval(windowReaquiererInterval);
    clearTimeout(currentTimeout);
    currentWindowId = -1;
    console.log('Stopped.');
    chrome.tabs.onUpdated.removeListener(onTabUpdateWhiteListChecker);
    chrome.windows.onRemoved.removeListener(onWindowClose);
    chrome.windows.onFocusChanged.removeListener(onFocusChange);
    trackedTabs.length = 0;
    badgeTabs(windowId, '');
    
    watchedTabs.length = 0;
}

// Switch Tab URL functionality.
function activateTab(tab) {
    // Trigger a reload
    chrome.tabs.update(tab.id, {url: tab.url, selected: tab.selected}, null);
    // Add a callback to swich tabs after the reload is complete
    chrome.tabs.onUpdated.addListener(
        function activateTabCallback( tabId , info ) {
            if ( info.status == "complete" && tabId == tab.id) {
                chrome.tabs.onUpdated.removeListener(activateTabCallback);
                chrome.tabs.update(tabId, {selected: true});
            }
        });
}

function trackTab(tabId){
    if (closeAllOtherTabs) {
        trackedTabs.length = 0;
    }
    trackedTabs.push(tabId);
}

function untrackTab(tabId){
    if (trackedTabs.indexOf(tabId) > -1){
        trackedTabs.splice(trackedTabs.indexOf(tabId), 1);
    }
}

function closeUntrackedTabs(){
    if (closeAllOtherTabs){
        chrome.tabs.query({
            windowId: currentWindowId
        }, function(openTabs) {
            for (tab in openTabs){
                if (trackedTabs.indexOf(openTabs[tab].id) == -1){
                    chrome.tabs.remove(openTabs[tab].id);
                }
            }
        });
    }
}

// Call openNextUrl if the user isn't actually interacting with the browser
function moveTabIfIdle() {
	if (tabInactive) {
		// Check if there was any activity while the tab was being displayed
		chrome.idle.queryState(urlList[currentUrlIndex].switchTime/1000, function(state) {
			if(state == 'idle') {
                badgeTabs(currentWindowId, 'on');
				openNextUrl();
			} else {
				// Set "wait" color and log.
				chrome.browserAction.setBadgeText({text:"\u2022"});
				chrome.browserAction.setBadgeBackgroundColor({color:[0,0,255,100]});
				console.log('Browser was active, waiting '+urlList[currentUrlIndex].switchTimeWhenActive+'ms.');
                // Because there was activity, wait for switchTimeWhenActive seconds before checking if we should switch again.
                currentTimeout = setTimeout(function() { moveTabIfIdle() }, urlList[currentUrlIndex].switchTimeWhenActive );
			}
		});
	} else {
		openNextUrl();
	}
}

// Open the next url in a new tab.
function openNextUrl(){
    if (forceFullscreen) chrome.windows.update(currentWindowId, { state: "fullscreen" });
    currentUrlIndex++;
    if (currentUrlIndex >= urlList.length) { currentUrlIndex = 0; }
    chrome.tabs.create({
        windowId: currentWindowId,
		url: urlList[currentUrlIndex].url, 
		active: false
	}, function(tab) {
        trackTab(tab.id);
        newTabId = tab.id;
    });
    // Don't switch tabs until the newly opened tab finishes loading.
    chrome.tabs.onUpdated.addListener(onTabUpdate);
}

// Listener for waiting until the newly opened tab finishes loading.
function onTabUpdate(tabId, changeInfo, tab) {
    if (tabId == newTabId && changeInfo.status == 'complete'){
        chrome.tabs.onUpdated.removeListener(onTabUpdate);
        closeCurrentTab();
    }
}

// Close the current tab and start the timer for opening the next one.
function closeCurrentTab(){
    chrome.tabs.query({
        windowId: currentWindowId,
        active: true
    }, function(activeTab) {
        untrackTab(activeTab[0].id);
		chrome.tabs.remove(activeTab[0].id);
        closeUntrackedTabs();
	});
    currentTimeout = setTimeout(function() { moveTabIfIdle() }, urlList[currentUrlIndex].switchTime );
}
