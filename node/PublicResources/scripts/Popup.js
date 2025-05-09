import { baseURL } from "./config.js"

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get(['email'], function (result) {
        const email = result.email;
        if (email) {
            console.log('Email retrieved from chrome.storage:', email);
        } else {
            console.error('No email found in chrome.storage.');
        }
    });
    console.log(email);
        if(email) {
            console.log('Logged-in email:', email);
            
            fetch(`${baseURL}/node/login`,{
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
            console.error("No email found. Ensure the user is logged in to the browser");
        }
});
