import { baseURL } from "./config.js"

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('save-email-btn').addEventListener('click', function () {
        const email = document.getElementById('email-input').value;

        if (email) {
            localStorage.setItem('email', email);
            console.log('Email saved in chrome.storage:', email);
            
            // Send the email to the extension's popup using postMessage
            window.postMessage({ type: 'EMAIL', email: email }, '*');
            } else {
            console.error('Please enter a valid email.');
            }
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
            });
        })