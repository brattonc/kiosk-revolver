var bg = chrome.extension.getBackgroundPage();
// Saves options to localStorage.
function save_options() {
    if (document.getElementById("inactive").checked == true) {
        localStorage["inactive"] = 'true';
        bg.tabInactive = true;
    } else {
        localStorage["inactive"] = 'false';
        bg.tabInactive = false;
    }
    if (document.getElementById("autostart").checked == true) {
        localStorage["autostart"] = 'true';
        bg.tabAutostart = true;
    } else {
        localStorage["autostart"] = 'false';
        bg.tabAutostart = false;
    }
    if (document.getElementById("forceFullscreen").checked == true) {
        localStorage["forceFullscreen"] = 'true';
        bg.forceFullscreen = true;
    } else {
        localStorage["forceFullscreen"] = 'false';
        bg.forceFullscreen = false;
    }
    if (document.getElementById("closeAllOtherTabs").checked == true) {
        localStorage["closeAllOtherTabs"] = 'true';
        bg.closeAllOtherTabs = true;
    } else {
        localStorage["closeAllOtherTabs"] = 'false';
        bg.closeAllOtherTabs = false;
    }
    if (document.getElementById("reopenOnClose").checked == true) {
        localStorage["reopenOnClose"] = 'true';
        bg.reopenOnClose = true;
    } else {
        localStorage["reopenOnClose"] = 'false';
        bg.reopenOnClose = false;
    }
    if (document.getElementById("forceFocus").checked == true) {
        localStorage["forceFocus"] = 'true';
        bg.forceFocus = true;
    } else {
        localStorage["forceFocus"] = 'false';
        bg.forceFocus = false;
    }
	localStorage["urlListData"] = JSON.stringify(document.getElementById('urlListData').value.split('\n'));
    bg.urlListData = document.getElementById('urlListData').value.split('\n');
    localStorage["urlWhiteList"] = JSON.stringify(document.getElementById('urlWhiteList').value.split('\n'));
    bg.urlWhiteList = document.getElementById('urlWhiteList').value.split('\n');
    localStorage["redirectUrl"] = document.getElementById('redirectUrl').value;
    bg.redirectUrl = document.getElementById('redirectUrl').value;
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    var status2 = document.getElementById("status2");
    status.innerHTML = "OPTIONS SAVED";
    status2.innerHTML = "OPTIONS SAVED";
    setTimeout(function() {
        status.innerHTML = "";
        status2.innerHTML = "";
    }, 1000);
}

// Restores saved values from localStorage.
function restore_options() {
    if (localStorage["inactive"]) {
        if (localStorage["inactive"] == 'true') {
            document.getElementById("inactive").checked = true;
        } else {
            document.getElementById("inactive").checked = false;
        }
    } else {
        document.getElementById("inactive").checked = true;
    }
    if (localStorage["autostart"]) {
        if (localStorage["autostart"] == 'true') {
            document.getElementById("autostart").checked = true;
        } else {
            document.getElementById("autostart").checked = false;
        }
    } else {
        document.getElementById("autostart").checked = false;
    }
    if (localStorage["forceFullscreen"]) {
        if (localStorage["forceFullscreen"] == 'true') {
            document.getElementById("forceFullscreen").checked = true;
        } else {
            document.getElementById("forceFullscreen").checked = false;
        }
    } else {
        document.getElementById("forceFullscreen").checked = false;
    }
    if (localStorage["closeAllOtherTabs"]) {
        if (localStorage["closeAllOtherTabs"] == 'true') {
            document.getElementById("closeAllOtherTabs").checked = true;
        } else {
            document.getElementById("closeAllOtherTabs").checked = false;
        }
    } else {
        document.getElementById("closeAllOtherTabs").checked = false;
    }
    if (localStorage["reopenOnClose"]) {
        if (localStorage["reopenOnClose"] == 'true') {
            document.getElementById("reopenOnClose").checked = true;
        } else {
            document.getElementById("reopenOnClose").checked = false;
        }
    } else {
        document.getElementById("reopenOnClose").checked = false;
    }
    if (localStorage["forceFocus"]) {
        if (localStorage["forceFocus"] == 'true') {
            document.getElementById("forceFocus").checked = true;
        } else {
            document.getElementById("forceFocus").checked = false;
        }
    } else {
        document.getElementById("forceFocus").checked = false;
    }
    if (localStorage["urlListData"]) {
        document.getElementById("urlListData").value = JSON.parse(localStorage["urlListData"]).join("\n");
    } else {
        document.getElementById("urlListData").value = "";
    }
    if (localStorage["urlWhiteList"]) {
        document.getElementById("urlWhiteList").value = JSON.parse(localStorage["urlWhiteList"]).join("\n");
    } else {
        document.getElementById("urlWhiteList").value = "";
    }
    if (localStorage["redirectUrl"]) {
        document.getElementById("redirectUrl").value = localStorage["redirectUrl"];
    } else {
        document.getElementById("redirectUrl").value = "";
    }
}

// Adding listeners for restoring and saving options
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#savetop').addEventListener('click', save_options);
