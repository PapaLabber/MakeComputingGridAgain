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
    // Manually trigger DOMContentLoaded for the script
    document.dispatchEvent(new Event('DOMContentLoaded'));
    // Wait for all microtasks and .then() chains to complete
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
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    }));
    await import('../node/PublicResources/webpages/leaderBoard.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise(resolve => setTimeout(resolve, 0));
    const tableBody = document.querySelector('.w3-table-all tbody');
    // Debug output for troubleshooting
    // console.log('tableBody.innerHTML:', tableBody.innerHTML);
    expect(tableBody.innerHTML).toContain('No tasks found.');
  });

  it('handles fetch error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('fail')));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const alertMock = vi.fn();
    global.alert = alertMock;
    await import('../node/PublicResources/webpages/leaderBoard.js');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await new Promise(resolve => setTimeout(resolve, 0));
    // Debug output for troubleshooting
    // console.log(errorSpy.mock.calls);
    expect(errorSpy).toHaveBeenCalled();
    expect(alertMock).toHaveBeenCalledWith('Failed to fetch user profile.');
    errorSpy.mockRestore();
  });
});
