// Import Vitest utilities for mocking, describing, and assertions
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'; // Import vi for mocking/spying/clearing in Vitest
import bcrypt from 'bcrypt'; // for password hashing/comparison mocks
import { registerUserToDB, storeResultsInDB, getUserProfile, fillLeaderBoard, pointAdder, getUserResults, showUserPoints, checkLoginInfo, getDbConnection } from "../node/DatabaseOperation.js";

// Create a reusable mock dbConnection for all tests
let mockDb;

// Reset the mockDb and clear all mocks before/after each test
beforeEach(() => {
  mockDb = { execute: vi.fn() }; // Arrange: fresh mock for each test
});
afterEach(() => {
  vi.clearAllMocks(); // Clean up all mocks after each test
});

// Test suite for registerUserToDB
// Each test follows Arrange, Act, Assert pattern and is fully isolated

describe('registerUserToDB', () => {
  it('registers a new user successfully', async () => {
    // Arrange: mock bcrypt.hash and DB execute to simulate successful insert
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpw');
    mockDb.execute.mockResolvedValueOnce();
    // Act: call the function with test data
    const result = await registerUserToDB(mockDb, 'test@mail.com', 'testuser', 'pw');
    // Assert: should return true and call DB with correct SQL and params
    expect(result).toBe(true);
    expect(mockDb.execute).toHaveBeenCalledWith(
      'INSERT INTO users (email, username, password, points) VALUES (?, ?, ?, ?)', 
      ['test@mail.com', 'testuser', 'hashedpw', 0]
    );
  });
  it('returns false if user already exists', async () => {
    // Arrange: mock bcrypt.hash and DB execute to simulate duplicate entry error
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpw');
    mockDb.execute.mockRejectedValueOnce({ code: 'ER_DUP_ENTRY' });
    // Act: call the function with test data
    const result = await registerUserToDB(mockDb, 'test@mail.com', 'testuser', 'pw');
    // Assert: should return false on duplicate
    expect(result).toBe(false);
  });
  it('returns false on other errors', async () => {
    // Arrange: mock bcrypt.hash and DB execute to simulate generic error
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpw');
    mockDb.execute.mockRejectedValueOnce({ code: 'OTHER', message: 'fail' });
    // Act: call the function with test data
    const result = await registerUserToDB(mockDb, 'test@mail.com', 'testuser', 'pw');
    // Assert: should return false on error
    expect(result).toBe(false);
  });
});

// Test suite for storeResultsInDB
// Tests both prime and non-prime result storage and error handling

describe('storeResultsInDB', () => {
  it('stores a non-prime result', async () => {
    // Arrange: mock DB execute to resolve
    mockDb.execute.mockResolvedValueOnce();
    // Act: call with isPrime false
    const result = await storeResultsInDB(mockDb, 7, 'testuser', false, null, 10);
    // Assert: should return false (not a prime)
    expect(result).toBe(false);
    expect(mockDb.execute).toHaveBeenCalled();
  });
  it('stores a prime result', async () => {
    // Arrange: mock DB execute to resolve
    mockDb.execute.mockResolvedValueOnce();
    // Act: call with isPrime true
    const result = await storeResultsInDB(mockDb, 7, 'testuser', true, 'Even', 20);
    // Assert: should return true (prime found)
    expect(result).toBe(true);
    expect(mockDb.execute).toHaveBeenCalled();
  });
  it('returns false on error', async () => {
    // Arrange: mock DB execute to reject
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    // Act: call with isPrime true
    const result = await storeResultsInDB(mockDb, 7, 'testuser', true, 'Even', 20);
    // Assert: should return false on error
    expect(result).toBe(false);
  });
});

// Test suite for getUserProfile
// Tests user found, not found, and error cases

describe('getUserProfile', () => {
  it('returns user data if found', async () => {
    // Arrange: mock DB execute to return user object
    mockDb.execute.mockResolvedValueOnce([[{ username: 'testuser', points: 10 }]]); // Simulate user found
    // Act: call with existing username
    const result = await getUserProfile(mockDb, 'testuser');
    // Assert: should return user object
    expect(result).toEqual({ username: 'testuser', points: 10 }); // Should return user object
  });
  it('returns false if not found', async () => {
    // Arrange: mock DB execute to return empty array
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no user found
    // Act: call with non-existing username
    const result = await getUserProfile(mockDb, 'nouser');
    // Assert: should return false
    expect(result).toBe(false); // Should return false
  });
  it('returns false on error', async () => {
    // Arrange: mock DB execute to reject
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    // Act: call with username
    const result = await getUserProfile(mockDb, 'testuser');
    // Assert: should return false on error
    expect(result).toBe(false); // Should return false on error
  });
});

// Test suite for pointAdder
// Tests successful point addition and error handling

describe('pointAdder', () => {
  it('adds points successfully', async () => {
    // Arrange: mock DB execute to resolve
    mockDb.execute.mockResolvedValueOnce();
    // Act: call with username and points
    const result = await pointAdder(mockDb, 'testuser', 5);
    // Assert: should return true and call DB with correct SQL and params
    expect(result).toBe(true);
    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE users SET points = points + ? WHERE username = ?',
      [5, 'testuser']
    );
  });
  it('returns false on error', async () => {
    // Arrange: mock DB execute to reject
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    // Act: call with username and points
    const result = await pointAdder(mockDb, 'testuser', 5);
    // Assert: should return false on error
    expect(result).toBe(false); // Should return false on error
  });
});

// Test suite for getUserResults
// Tests user results found, not found, and error cases

describe('getUserResults', () => {
  it('returns user results if found', async () => {
    // Arrange: mock DB execute to return results array
    mockDb.execute.mockResolvedValueOnce([[{ exponent: 7 }]]); // Simulate results found
    // Act: call with username
    const result = await getUserResults(mockDb, 'testuser');
    // Assert: should return results array
    expect(result).toEqual([{ exponent: 7 }]); // Should return results array
  });
  it('returns empty array if not found', async () => {
    // Arrange: mock DB execute to return empty array
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no results
    // Act: call with username
    const result = await getUserResults(mockDb, 'nouser');
    // Assert: should return empty array
    expect(result).toEqual([]); // Should return empty array
  });
  it('returns empty array on error', async () => {
    // Arrange: mock DB execute to reject
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    // Act: call with username
    const result = await getUserResults(mockDb, 'testuser');
    // Assert: should return empty array on error
    expect(result).toEqual([]); // Should return empty array on error
  });
});

// Test suite for fillLeaderBoard
// Tests leaderboard found, not found, and error cases

describe('fillLeaderBoard', () => {
  it('returns leaderboard results if found', async () => {
    // Arrange: mock DB execute to return leaderboard array
    mockDb.execute.mockResolvedValueOnce([[{ exponent: 7 }]]); // Simulate leaderboard found
    // Act: call function
    const result = await fillLeaderBoard(mockDb);
    // Assert: should return results array
    expect(result).toEqual([{ exponent: 7 }]); // Should return results array
  });
  it('returns empty array if not found', async () => {
    // Arrange: mock DB execute to return empty array
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no results
    // Act: call function
    const result = await fillLeaderBoard(mockDb);
    // Assert: should return empty array
    expect(result).toEqual([]); // Should return empty array
  });
  it('returns empty array on error', async () => {
    // Arrange: mock DB execute to reject
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    // Act: call function
    const result = await fillLeaderBoard(mockDb);
    // Assert: should return empty array on error
    expect(result).toEqual([]); // Should return empty array on error
  });
});

// Test suite for showUserPoints
// Tests points found, not found, and error cases

describe('showUserPoints', () => {
  it('returns user points if found', async () => {
    // Arrange: mock DB execute to return points array
    mockDb.execute.mockResolvedValueOnce([[{ points: 42 }]]); // Simulate points found
    // Act: call with username
    const result = await showUserPoints(mockDb, 'testuser');
    // Assert: should return points array
    expect(result).toEqual([{ points: 42 }]); // Should return points array
  });
  it('returns empty array if not found', async () => {
    // Arrange: mock DB execute to return empty array
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no points
    // Act: call with username
    const result = await showUserPoints(mockDb, 'nouser');
    // Assert: should return empty array
    expect(result).toEqual([]); // Should return empty array
  });
  it('returns empty array on error', async () => {
    // Arrange: mock DB execute to reject
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    // Act: call with username
    const result = await showUserPoints(mockDb, 'testuser');
    // Assert: should return empty array on error
    expect(result).toEqual([]); // Should return empty array on error
  });
});

// Test suite for checkLoginInfo
// Tests password match, user not found, password mismatch, and error cases

describe('checkLoginInfo', () => {
  it('returns true if password matches', async () => {
    // Arrange: mock DB execute to return user with hashed password, and bcrypt.compare to return true
    mockDb.execute.mockResolvedValueOnce([[{ password: 'hashedpw' }]]); // Simulate user found with hashed password
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true); // Mock bcrypt.compare to return true
    // Act: call with correct password
    const result = await checkLoginInfo(mockDb, 'testuser', 'pw');
    // Assert: should return true if password matches
    expect(result).toBe(true); // Should return true if password matches
  });
  it('returns false if user not found', async () => {
    // Arrange: mock DB execute to return empty array
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no user found
    // Act: call with non-existing user
    const result = await checkLoginInfo(mockDb, 'nouser', 'pw');
    // Assert: should return false
    expect(result).toBe(false); // Should return false
  });
  it('returns false if password does not match', async () => {
    // Arrange: mock DB execute to return user, and bcrypt.compare to return false
    mockDb.execute.mockResolvedValueOnce([[{ password: 'hashedpw' }]]); // Simulate user found
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false); // Mock bcrypt.compare to return false
    // Act: call with wrong password
    const result = await checkLoginInfo(mockDb, 'testuser', 'wrongpw');
    // Assert: should return false if password does not match
    expect(result).toBe(false); // Should return false if password does not match
  });
  it('returns false on error', async () => {
    // Arrange: mock DB execute to reject
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    // Act: call with username and password
    const result = await checkLoginInfo(mockDb, 'testuser', 'pw');
    // Assert: should return false on error
    expect(result).toBe(false); // Should return false on error
  });
});



