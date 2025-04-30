// Configuration for deployment
let baseURL = "";

if (window.location.hostname === "127.0.0.1" && window.location.port === "3430") {
    // Local deployment
    baseURL = `${window.location.origin}`;
} else {
    // Non-local deployment
    baseURL = `${window.location.origin}/node0`;
}
