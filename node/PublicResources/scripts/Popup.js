import { baseURL } from "./config.js"

try {
    document.addEventListener('DOMContentLoaded', function () {
        // Listen for the email sent from landingPage.js
        window.addEventListener('message', function (event) {
            // Ensure the message is of the correct type
            if (event.data && event.data.type === 'EMAIL') {
                const email = event.data.email;
                console.log('Email received via postMessage:', email);
    
                // Save the email in localStorage for the popup
                localStorage.setItem('email', email);
    
                // Fetch user profile using the email
                fetch(`${baseURL}/node/getEmail?email=${email}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('jwt')}`, // Include the JWT
                        'Content-Type': 'application/json',
                    }
                })
            }}
        )}
    )
} catch(err) {
    console.error("Error getting email or fetching userprofile", err);
}
