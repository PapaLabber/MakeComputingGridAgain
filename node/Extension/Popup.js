document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['visitData'], result => {
        const data = result.visitData || {};
        const tbody = document.getElementById('data');
        let totalPoints = 0;
        for (const url in data) {
            const seconds = data[url];
            const points = Math.floor(seconds / 10);
            totalPoints += points;
  
            const row = document.createElement('tr');
            row.innerHTML = `<td>${url}</td><td>${seconds}</td><td>${points}</td>`;
            tbody.appendChild(row);
        }
        document.getElementById('points').textContent = totalPoints;
        const bottomPoints = document.getElementById('points-bottom');
        if (bottomPoints) {
            bottomPoints.textContent = totalPoints;
        }
    });
});