// Waiting for stuff part
var maxRetryCount = 10;
var retryCount = 0;

// Clicking part
var failedClickingOnCount = 0;
var failedFindingClickableStuffCount = 0;

/**
 * Displays an error in a formatted way!
 * 
 * @param {string} code 
 * @param {string} message 
 */
function displayError(code, message) {
    hideSpinner();
    alert("ERROR CODE: " + code + "\n" + message);
}

/** 
 * Startup function 
 */
function main() {
    showSpinner();
    var button = document.querySelector("#page_notification > span > a");

    console.log("Found! -> ", button);

    if (!button) {
        return displayError("Clicky", "Could not find Pages You Manage button!");
    }

    button.click();

    window.setTimeout(function () {
        isReady();
    }, 5000);
}

/** 
 * Create and display a spinner, to show that they shouldn't touch anything. 
 */
function showSpinner() {
    var spinnerPath = chrome.runtime.getURL("assets/spinner.svg");
    var containerDiv = document.createElement('div');
    var img = new Image();

    containerDiv.id = "jake_spinner_div";
    img.id = "jake_spinner_img";

    containerDiv.style = "height:100%;width:100%;margin: 0 auto;z-index:99999;background-color: rgba(0,0,0,0.7);position: absolute;";
    img.style = "top: 45%;left: 45%;position: absolute;z-index: 99999;"
    img.src = spinnerPath;
    document.body.insertAdjacentElement("afterbegin", containerDiv);
    containerDiv.insertAdjacentElement("afterbegin", img);
}

/** 
 * Remove the spinner 
 */
function hideSpinner() {
    var spinnerDiv = document.querySelector("#jake_spinner_div");
    spinnerDiv.remove();
}

/**
 * Check to see if the initial "Pages you Manage" popup modal has loaded. 
 */
function isReady() {
    window.setTimeout(function () {
        if (retryCount >= maxRetryCount) {
            return displayError("Recursion", "Failed after trying to find the Pages you Manage window " + maxRetryCount + " times!")
        }

        var elementFound = document.querySelectorAll(".uiLayer form");

        if (elementFound) {
            console.log("Window is ready!");
            turnOffNotifications();
        } else {
            console.log("Failure ", retryCount, "...trying again.");
            retryCount++;
            isReady();
        }
    }, 1000);
}

/**
 * Turn off those notifications! 
 */
function turnOffNotifications() {
    console.log("Turning off Notifications");
    document.querySelectorAll(".uiLayer form").forEach(function (html) {
        if (html.childNodes[1].childNodes[0] !== undefined) {
            // We don't want to touch the ones we already turned off!
            isAlreadyOff = html.querySelector('a > span');

            if (isAlreadyOff.innerText == "Off") {
                console.log("Skipped because it's already disabled!");
                return;
            }

            console.log("Clicking those boxes!");

            // Click on the select box anchour tag
            html.querySelector('a').click();

            // Now grab the last uiLayer element which is the custom select box
            var ui_m = document.querySelectorAll(".uiLayer");
            var ui = ui_m[ui_m.length - 1];
            var ui_list = ui.querySelectorAll('ul > li');

            // Make sure it's not undefined before we try to click on it!  
            if (ui_list !== undefined) {
                // Select the "Off" <li>, and the anchour tag immediately in it to click!
                ui_list[2].childNodes[0].click()
            } else {
                failedClickingOnCount++;
            }
        } else {
            failedFindingClickableStuffCount++;
        }
    });

    if (failedClickingOnCount > 0) {
        alert("Maybe success. Failed to turn off " + failedClickingOnCount + " pages.");
    }

    if (failedFindingClickableStuffCount > 0) {
        alert("Maybe success. Failed to find " + failedFindingClickableStuffCount + " stuff to click on!");
    }

    alert("All done! You can close the tab now!");
    hideSpinner();
}

// Run me!
main();