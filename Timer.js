function timer() {
    let timeLeft = 5 * 60; // 5 minutes in seconds

    const interval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;

        console.log(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`); // Format as MM:SS

        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(interval);
            console.log("Countdown finished!");
        }
    }, 1000);
}