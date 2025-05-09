import { baseURL } from "./config.js"

document.addEventListener('DOMContentLoaded', function () {
    chrome.identity.getProfileUserInfo({accountStatus: 'ANY' }, function (userInfo){
        console.log(userInfo);
        if(userInfo.email) {
            console.log('Logged-in email:', userInfo.email);

            // Store the email in localStorage
            localStorage.getItem('email');
            
            fetch(`${baseURL}/node/login`,{
                method: `POST`,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userInfo.email }),
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
});