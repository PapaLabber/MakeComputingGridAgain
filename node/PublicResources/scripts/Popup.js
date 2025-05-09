import { baseURL } from "./config.js"

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['email'], function (result) {
        const email = result.email;
        if (email) {
            console.log('Email retrieved from chrome.storage:', email);

            // Proceed with login
            fetch(`${baseURL}/node/login`, {
                method: `POST`,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Login successful", data);
                })
                .catch(error => {
                    console.error("Error during login:", error);
                });
        } else {
            console.error("No email found in chrome.storage.");
        }
    });
});
