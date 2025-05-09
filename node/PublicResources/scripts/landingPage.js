document.getElementById('save-email-btn').addEventListener('click', function () {
    const email = document.getElementById('email-input').value;
    console.log(email + "1");
    if (email) {
        localStorage.setItem('email', email);
        console.log('Email saved:', email);
    } else {
        console.error('Please enter a valid email.');
    }
});