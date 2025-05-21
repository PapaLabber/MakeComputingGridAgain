// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock config.js to provide a baseURL
vi.mock('../node/PublicResources/webpages/config.js', () => ({
  baseURL: `${window.location.origin}`
}));

// Helper to set up DOM elements used by leaderBoard.js
function setupDOM() {
  document.body.innerHTML = `
    <table class="w3-table-all"><tbody></tbody></table>
    <div id="leaderboard"></div>`;
}

describe('leaderBoard.js', () => {
  beforeEach(() => {
    setupDOM();
    vi.clearAllMocks();
  });

  it('renders leaderboard data into the table', async () => {
    // Arrange: mock fetch to return leaderboard data
    const mockData = [
      {
        exponent: 7,
        is_mersenne_prime: true,
        is_even: false,
        points_worth: 10000,
        found_by_user: 'alice'
      },
      {
        exponent: 11,
        is_mersenne_prime: false,
        is_even: true,
        points_worth: 10,
        found_by_user: 'bob'
      }
    ];
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData)
    }));

    // Act: import the script (triggers DOMContentLoaded logic)
    await import('../node/PublicResources/webpages/leaderBoard.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise(resolve => setTimeout(resolve, 0));

    // Assert: check that the table contains the rendered data
    const tableBody = document.querySelector('.w3-table-all tbody');
    expect(tableBody.innerHTML).toContain('<td>7</td>');
    expect(tableBody.innerHTML).toContain('<td>true</td>');
    expect(tableBody.innerHTML).toContain('<td>false</td>');
    expect(tableBody.innerHTML).toContain('<td>10000</td>');
    expect(tableBody.innerHTML).toContain('<td>alice</td>');
    expect(tableBody.innerHTML).toContain('<td>11</td>');
    expect(tableBody.innerHTML).toContain('<td>false</td>'); // is_mersenne_prime for 11
    expect(tableBody.innerHTML).toContain('<td>true</td>');  // is_even for 11
    expect(tableBody.innerHTML).toContain('<td>10</td>');
    expect(tableBody.innerHTML).toContain('<td>bob</td>');
  });

  it('shows message if no leaderboard data', async () => {
    // Arrange:
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    }));

    // Act:
    await import('../node/PublicResources/webpages/leaderBoard.js'); // Loads and runs the leaderboard logic
    document.dispatchEvent(new Event('DOMContentLoaded')); // Simulates the page load event
    await new Promise(resolve => setTimeout(resolve, 0)); // Ensures all async code and .then() chains complete

    // Assert: 
    const tableBody = document.querySelector('.w3-table-all tbody'); // Selects the leaderboard table body
    expect(tableBody.innerHTML).toContain('No tasks found.'); // Checks for the empty state message
  });

  it('handles fetch error gracefully', async () => {
    // Arrange:
    global.fetch = vi.fn(() => Promise.reject(new Error('fail'))); // Simulates fetch failure
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {}); // Prevents error output in test logs
    const alertMock = vi.fn(); // Mock alert to capture calls
    global.alert = alertMock; // Replace global alert with mock

    // Act:
    await import('../node/PublicResources/webpages/leaderBoard.js'); // Loads and runs the leaderboard logic
    document.dispatchEvent(new Event('DOMContentLoaded')); // Simulates the page load event
    await new Promise(resolve => setTimeout(resolve, 0)); // Ensures all async code and .then() chains complete

    // Assert:
    expect(errorSpy).toHaveBeenCalled(); // Checks that console.error was called
    expect(alertMock).toHaveBeenCalledWith('Failed to fetch user profile.'); // Checks that alert was shown with the correct message
    errorSpy.mockRestore(); // Restore original console.error
  });
});
