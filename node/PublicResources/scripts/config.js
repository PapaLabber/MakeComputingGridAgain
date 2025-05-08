// Configuration for deployment
let baseURL = "";

// Check if the script is running in a Chrome extension
if (chrome && chrome.runtime && chrome.runtime.id) {
    // Use the production server URL for the extension
    baseURL = "https://cs-25-sw-2-13.p2datsw.cs.aau.dk/node0";
} else if (window.location.hostname === "127.0.0.1" && window.location.port === "3430") {
    // Local deployment
    baseURL = `${window.location.origin}`;
} else {
    // AAU deployment
    baseURL = `${window.location.origin}/node0`;
}

export { baseURL };
