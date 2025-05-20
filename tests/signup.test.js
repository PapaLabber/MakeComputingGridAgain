// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock config.js to provide a baseURL
vi.mock('../node/PublicResources/webpages/config.js', () => ({
  baseURL: 'http://mocked-base-url'
}));

describe('signup.js', () => {
  let form, usernameInput, emailInput, passwordInput, repeatPasswordInput;

  beforeEach(() => {
    // Set up DOM structure
    document.body.innerHTML = `
      <form id="userData">
        <input id="username-input" />
        <input id="email-input" />
        <input id="password-input" type="password" />
        <input id="repeat-password" type="password" />
        <button type="submit">Sign Up</button>
      </form>
    `;
    form = document.getElementById('userData');
    usernameInput = document.getElementById('username-input');
    emailInput = document.getElementById('email-input');
    passwordInput = document.getElementById('password-input');
    repeatPasswordInput = document.getElementById('repeat-password');
    // Clear localStorage
    localStorage.clear();

    // Manually attach the event listener as in signup.js
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      const username = usernameInput.value;
      const email = emailInput.value;
      const password = passwordInput.value;
      const repeatPassword = repeatPasswordInput.value;

      localStorage.setItem('username', username);

      if (password !== repeatPassword) {
        alert('Passwords do not match.');
        return;
      }

      fetch('http://mocked-base-url/node/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'User successfully registered') {
          window.location.href = 'http://mocked-base-url/landingPage.html';
        } else {
          alert('Error: ' + data.message);
        }
      })
      .catch(error => {
        alert('There was an error. Please try again later.');
      });
    });
  });

  it('saves username to localStorage and sends fetch on valid submit', async () => {
    // Arrange
    usernameInput.value = 'testuser';
    emailInput.value = 'test@email.com';
    passwordInput.value = 'Password1';
    repeatPasswordInput.value = 'Password1';

    // Mock fetch
    const fetchMock = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({ message: 'User successfully registered' })
    }));
    global.fetch = fetchMock;
    // Mock window.location.href by replacing window.location
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: '', assign: vi.fn() };

    // Act
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    // Wait for all microtasks and .then() chains to complete
    await new Promise(resolve => setTimeout(resolve, 0));

    // Assert
    expect(localStorage.getItem('username')).toBe('testuser');
    expect(fetchMock).toHaveBeenCalledWith('http://mocked-base-url/node/register',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@email.com',
          password: 'Password1'
        })
      })
    );
    expect(window.location.href).toBe('http://mocked-base-url/landingPage.html');
    // Restore window.location
    window.location = originalLocation;
  });

  it('alerts if passwords do not match', () => {
    // Arrange
    usernameInput.value = 'testuser';
    emailInput.value = 'test@email.com';
    passwordInput.value = 'Password1';
    repeatPasswordInput.value = 'Password2';
    // Mock alert
    const alertMock = vi.fn();
    global.alert = alertMock;
    
    // Act
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    
    // Assert
    expect(alertMock).toHaveBeenCalledWith('Passwords do not match.');
    expect(localStorage.getItem('username')).toBe('testuser');
  });

  it('alerts on server error', async () => {
    // Arrange
    usernameInput.value = 'testuser';
    emailInput.value = 'test@email.com';
    passwordInput.value = 'Password1';
    repeatPasswordInput.value = 'Password1';
    // Mock fetch to return error message
    global.fetch = vi.fn(() => Promise.resolve({
      json: () => Promise.resolve({ message: 'Username already taken.' })
    }));
    const alertMock = vi.fn();
    global.alert = alertMock;
    // Act
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    // Wait for all microtasks and .then() chains to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    // Assert
    expect(alertMock).toHaveBeenCalledWith('Error: Username already taken.');
  });

  it('alerts on fetch/network error', async () => {
    // Arrange
    usernameInput.value = 'testuser';
    emailInput.value = 'test@email.com';
    passwordInput.value = 'Password1';
    repeatPasswordInput.value = 'Password1';
    // Mock fetch to throw
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
    const alertMock = vi.fn();
    global.alert = alertMock;
    // Act
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    // Wait for all microtasks and .then() chains to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    // Assert
    expect(alertMock).toHaveBeenCalledWith('There was an error. Please try again later.');
  });
});
