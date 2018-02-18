// The notification settings page
var facebookURL = "https://www.facebook.com/settings?tab=notifications&section=on_facebook&view";
var maxCheckPageCount = 25;
var checkPageCount = 0;

/**
 * Displays an error in a formatted way!
 * 
 * @param {string} code 
 * @param {string} message 
 */
function displayError(code, message) {
    alert("ERROR CODE: "+code+"\n"+message);
}

/**
 * Opens the Facebook Notification Setting Page and adds an OnUpdated Listener that runs @see checkPage()
 */
function openFacebook() {
    
    chrome.tabs.create({ url: facebookURL }, function () {
        chrome.tabs.onUpdated.removeListener(checkPage);
        chrome.tabs.onUpdated.addListener(checkPage);
    });
}

/**
 * Check if the page is good to inject our awesome code with!
 * 
 * @param {*} tabId 
 * @param {*} info 
 * @param {*} tab 
 */
function checkPage(tabId, info, tab) {
    // We hit the max attempt count, fail out!
    if(checkPageCount >= maxCheckPageCount) {
        chrome.tabs.onUpdated.removeListener(checkPage);
        return displayError("Uh-oh", "Failed to find Facebook Notifications Settings Page!");
    }

    // Check if we're good, otherwise add to the counter and return;
    if (tab.url == facebookURL && info.status == "complete") {
        console.log("Website found, and loading is completed. Removing listener!");
        chrome.tabs.onUpdated.removeListener(checkPage);
    } else {
        checkPageCount++;
        return false;
    }

    // Wait a second and inject our js
    window.setTimeout(function () {
        chrome.tabs.executeScript(tab.id, { file: 'injectMe.js'}, function (response) {
            console.log("Injected Code executed ",response);
        });
    }, 1000);
}

/** 
 * Make sure they REALLY want to do this.
 */
function confirmAction() {
    var yesPlz = confirm("Do you want to run the Facebook Notification Be-Gone Script? \nThis will take about 15 seconds, and might temporarily freeze the page!\n\nAlso please do not touch the page while this is running. Thanks!");
    return yesPlz ? openFacebook() : false;
}

/**
 * Hook into the clicky button chrome code
 */
chrome.browserAction.onClicked.addListener(function (activeTab) {
    confirmAction();
});