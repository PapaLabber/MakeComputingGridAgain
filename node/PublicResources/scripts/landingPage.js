document.getElementById('save-email-btn').addEventListener('click', function () {
    const email = document.getElementById('email-input').value;
    console.log(email + "1");
    if (email) {
        chrome.storage.local.set({ email }, function () {
            console.log('Email saved in chrome.storage:', email);
        });
        console.log('Email saved:', email);
    } else {
        console.error('Please enter a valid email.');
    }
});