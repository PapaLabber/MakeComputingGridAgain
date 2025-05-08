document.addEventListener('DOMContentLoaded', () => {
    const username = localStorage.getItem('username');
    const jwt = localStorage.getItem('jwt');
  
    if (!username || !jwt) {
      document.getElementById('points').textContent = "Login required";
      const bottomPoints = document.getElementById('points-bottom');
      if (bottomPoints) bottomPoints.textContent = "Login required";
      return;
    }
  
    let baseURL = "";
    if (window.location.hostname === "127.0.0.1" && window.location.port === "3430") {
      baseURL = `${window.location.origin}`;
    } else {
      baseURL = `${window.location.origin}/node0`;
    }
  
    fetch(`${baseURL}/node/getUserProfile?username=${username}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(data => {
      const totalPoints = data.points || 0;
      document.getElementById('points').textContent = totalPoints;
      const bottomPoints = document.getElementById('points-bottom');
      if (bottomPoints) bottomPoints.textContent = totalPoints;
    })
    .catch(error => {
      console.error('Error fetching points:', error);
      document.getElementById('points').textContent = "Error";
      const bottomPoints = document.getElementById('points-bottom');
      if (bottomPoints) bottomPoints.textContent = "Error";
    });
  });