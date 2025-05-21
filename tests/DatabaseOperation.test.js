// Import Vitest utilities for mocking, describing, and assertions
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import bcrypt from 'bcrypt';
import { registerUserToDB, storeResultsInDB, getUserProfile, fillLeaderBoard, pointAdder, getUserResults, showUserPoints, checkLoginInfo, getDbConnection } from "../node/DatabaseOperation.js";

// Create a reusable mock dbConnection for all tests
let mockDb;

// Reset the mockDb and clear all mocks before/after each test
beforeEach(() => {
  // Arrange: create a new mock database connection object with a mock execute method before each test
  mockDb = { execute: vi.fn() };
});
afterEach(() => {
  // Clean up all mocks after each test to avoid cross-test pollution
  vi.clearAllMocks();
});

// Each test follows Arrange, Act, Assert pattern and is fully isolated

describe('registerUserToDB', () => {
  it('registers a new user successfully', async () => {
    // Arrange:
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpw'); // Watch the call bcrypt.hash but replace return value with "hashedpw"
    mockDb.execute.mockResolvedValueOnce(); //mock DB execute to resolve (can be empty when testing for try/catch)
    
    // Act: call registerUserToDB with test user data
    const result = await registerUserToDB(mockDb, 'test@mail.com', 'testuser', 'pw');
    
    // Assert: function should return true and DB should be called with correct SQL and parameters
    expect(result).toBe(true);
    expect(mockDb.execute).toHaveBeenCalledWith(
      'INSERT INTO users (email, username, password, points) VALUES (?, ?, ?, ?)', 
      ['test@mail.com', 'testuser', 'hashedpw', 0]
    );
  });

  it('returns false if user already exists', async () => {
    // Arrange: 
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpw'); // mock bcrypt.hash to return a fake hash
    mockDb.execute.mockRejectedValueOnce({ code: 'ER_DUP_ENTRY' }); //DB execute to reject with duplicate entry error
    
    // Act: call registerUserToDB with duplicate user data
    const result = await registerUserToDB(mockDb, 'test@mail.com', 'testuser', 'pw');
    
    // Assert: function should return false if user already exists
    expect(result).toBe(false);
  });

  it('returns false on other errors', async () => {
    // Arrange: mock bcrypt.hash to return a fake hash, and DB execute to reject with a generic error
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('hashedpw');
    mockDb.execute.mockRejectedValueOnce({ code: 'OTHER'});
    
    // Act: call registerUserToDB with test data
    const result = await registerUserToDB(mockDb, 'test@mail.com', 'testuser', 'pw');
    
    // Assert: function should return false on any other error
    expect(result).toBe(false);
  });
});

describe('storeResultsInDB', () => {
  it('stores a non-prime result', async () => {
    // Arrange: mock DB execute to resolve (simulate DB insert)
    mockDb.execute.mockResolvedValueOnce();
    
    // Act: call storeResultsInDB with isPrime set to false
    const result = await storeResultsInDB(mockDb, 7, 'testuser', false, null, 10);
    
    // Assert: function should return false (not a prime number)
    expect(result).toBe(false);
    expect(mockDb.execute).toHaveBeenCalled();
  });

  it('stores a prime result', async () => {
    // Arrange: mock DB execute to resolve (simulate DB insert)
    mockDb.execute.mockResolvedValueOnce();
    
    // Act: call storeResultsInDB with isPrime set to true
    const result = await storeResultsInDB(mockDb, 7, 'testuser', true, 'Even', 20);
    
    // Assert: function should return true (prime number found)
    expect(result).toBe(true);
    expect(mockDb.execute).toHaveBeenCalled();
  });

  it('returns false on error', async () => {
    // Arrange: mock DB execute to reject (simulate DB error)
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    
    // Act: call storeResultsInDB with isPrime true
    const result = await storeResultsInDB(mockDb, 7, 'testuser', true, 'Even', 20);
    
    // Assert: function should return false on DB error
    expect(result).toBe(false);
  });
});

describe('getUserProfile', () => {
  it('returns user data if found', async () => {
    // Arrange: mock DB execute to return a user object in the result array
    mockDb.execute.mockResolvedValueOnce([[{ username: 'testuser', points: 10 }]]); // Simulate user found
    
    // Act: call with existing username
    const result = await getUserProfile(mockDb, 'testuser');
    
    // Assert: function should return the user object if found
    expect(result).toEqual({ username: 'testuser', points: 10 }); // Should return user object
  });

  it('returns false if not found', async () => {
    // Arrange: mock DB execute to return an empty array (no user found)
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no user found
    
    // Act: call with non-existing username
    const result = await getUserProfile(mockDb, 'testuser');
    
    // Assert: function should return false if user not found
    expect(result).toBe(false); // Should return false
  });

  it('returns false on error', async () => {
    // Arrange: mock DB execute to reject
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    
    // Act: call with username
    const result = await getUserProfile(mockDb, 'testuser');
    
    // Assert: function should return false on DB error
    expect(result).toBe(false); // Should return false on error
  });
});

describe('pointAdder', () => {
  it('adds points successfully', async () => {
    // Arrange: mock DB execute to resolve (simulate successful update)
    mockDb.execute.mockResolvedValueOnce();
    
    // Act: call with username and points to add
    const result = await pointAdder(mockDb, 'testuser', 5);
    
    // Assert: function should return true and DB should be called with correct SQL and parameters
    expect(result).toBe(true);
    expect(mockDb.execute).toHaveBeenCalledWith(
      'UPDATE users SET points = points + ? WHERE username = ?',
      [5, 'testuser']
    );
  });

  it('returns false on error', async () => {
    // Arrange: mock DB execute to reject (simulate DB error)
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    
    // Act: call with username and points
    const result = await pointAdder(mockDb, 'testuser', 5);
    
    // Assert: function should return false on DB error
    expect(result).toBe(false); // Should return false on error
  });
});

describe('getUserResults', () => {
  it('returns user results if found', async () => {
    // Arrange: mock DB execute to return an array of results
    mockDb.execute.mockResolvedValueOnce([[{ exponent: 7 }]]); // Simulate results found
    
    // Act: call with username
    const result = await getUserResults(mockDb, 'testuser');
    
    // Assert: function should return the results array if found
    expect(result).toEqual([{ exponent: 7 }]); // Should return results array
  });

  it('returns empty array if not found', async () => {
    // Arrange: mock DB execute to return an empty array (no results)
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no results
    
    // Act: call with username
    const result = await getUserResults(mockDb, 'testuser');
    
    // Assert: function should return an empty array if no results found
    expect(result).toEqual([]); // Should return empty array
  });

  it('returns empty array on error', async () => {
    // Arrange: mock DB execute to reject (simulate DB error)
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    
    // Act: call with username
    const result = await getUserResults(mockDb, 'testuser');
    
    // Assert: function should return an empty array on DB error
    expect(result).toEqual([]); // Should return empty array on error
  });
});

describe('fillLeaderBoard', () => {
  it('returns leaderboard results if found', async () => {
    // Arrange: mock DB execute to return an array of leaderboard results
    mockDb.execute.mockResolvedValueOnce([[{ exponent: 7 }]]); // Simulate leaderboard found
    
    // Act: call function
    const result = await fillLeaderBoard(mockDb);
    
    // Assert: function should return the leaderboard array if found
    expect(result).toEqual([{ exponent: 7 }]); // Should return results array
  });
  it('returns empty array if not found', async () => {
    // Arrange: mock DB execute to return an empty array (no leaderboard data)
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no results
    
    // Act: call function
    const result = await fillLeaderBoard(mockDb);
    
    // Assert: function should return an empty array if no leaderboard data
    expect(result).toEqual([]); // Should return empty array
  });
  it('returns empty array on error', async () => {
    // Arrange: mock DB execute to reject (simulate DB error)
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    
    // Act: call function
    const result = await fillLeaderBoard(mockDb);
    
    // Assert: function should return an empty array on DB error
    expect(result).toEqual([]); // Should return empty array on error
  });
});

describe('showUserPoints', () => {
  it('returns user points if found', async () => {
    // Arrange: mock DB execute to return an array with user points
    mockDb.execute.mockResolvedValueOnce([[{ points: 42 }]]); // Simulate points found
    
    // Act: call with username
    const result = await showUserPoints(mockDb, 'testuser');
    
    // Assert: function should return the points array if found
    expect(result).toEqual([{ points: 42 }]); // Should return points array
  });

  it('returns empty array if not found', async () => {
    // Arrange: mock DB execute to return an empty array (no points)
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no points
    
    // Act: call with username
    const result = await showUserPoints(mockDb, 'testuser');
    
    // Assert: function should return an empty array if no points found
    expect(result).toEqual([]); // Should return empty array
  });

  it('returns empty array on error', async () => {
    // Arrange: mock DB execute to reject (simulate DB error)
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    
    // Act: call with username
    const result = await showUserPoints(mockDb, 'testuser');
    
    // Assert: function should return an empty array on DB error
    expect(result).toEqual([]); // Should return empty array on error
  });
});

describe('checkLoginInfo', () => {
  it('returns true if password matches', async () => {
    // Arrange: mock DB execute to return a user with a hashed password, and mock bcrypt.compare to return true (password matches)
    mockDb.execute.mockResolvedValueOnce([[{ password: 'hashedpw' }]]); // Simulate user found with hashed password
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true); // Mock bcrypt.compare to return true
    
    // Act: call with correct password
    const result = await checkLoginInfo(mockDb, 'testuser', 'pw');
    
    // Assert: function should return true if password matches
    expect(result).toBe(true); // Should return true if password matches
  });
  
  it('returns false if user not found', async () => {
    // Arrange: mock DB execute to return an empty array (user not found)
    mockDb.execute.mockResolvedValueOnce([[]]); // Simulate no user found
    
    // Act: call with non-existing user
    const result = await checkLoginInfo(mockDb, 'testuser', 'pw');
    
    // Assert: function should return false if user not found
    expect(result).toBe(false); // Should return false
  });

  it('returns false if password does not match', async () => {
    // Arrange: mock DB execute to return a user, and mock bcrypt.compare to return false (password mismatch)
    mockDb.execute.mockResolvedValueOnce([[{ password: 'hashedpw' }]]); // Simulate user found
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false); // Mock bcrypt.compare to return false
    
    // Act: call with wrong password
    const result = await checkLoginInfo(mockDb, 'testuser', 'wrongpw');
    
    // Assert: function should return false if password does not match
    expect(result).toBe(false); // Should return false if password does not match
  });
  
  it('returns false on error', async () => {
    // Arrange: mock DB execute to reject (simulate DB error)
    mockDb.execute.mockRejectedValueOnce(new Error('fail'));
    
    // Act: call with username and password
    const result = await checkLoginInfo(mockDb, 'testuser', 'pw');
    
    // Assert: function should return false on DB error
    expect(result).toBe(false); // Should return false on error
  });
});
