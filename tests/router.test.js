// Import Vitest testing utilities and the router module to be tested
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as router from '../node/router.js';

// --- MOCK DEPENDENCIES ---
// Mock all external modules used by router.js to isolate tests from real DB, broker, and server logic

vi.mock('../node/DatabaseOperation.js', () => ({
  fillLeaderBoard: vi.fn(async (db = mockDbConnection) => [{ username: 'test', points: 100 }]), // fillLeaderBoard returns a static leaderboard array
  showUserPoints: vi.fn(async (db = mockDbConnection) => [{ points: 42 }]), // showUserPoints returns a static points array
  checkLoginInfo: vi.fn(async (db = mockDbConnection, user, pass) => user === 'valid' && pass === 'pass'), // checkLoginInfo only returns true for a specific valid user/pass
  registerUserToDB: vi.fn(() => true), // registerUserToDB always succeeds
  storeResultsInDB: vi.fn(), // storeResultsInDB and pointAdder are dummies
  pointAdder: vi.fn(),
  dbConnection: { execute: vi.fn() }, // dummy DB connection (mocked in tests, not imported from DatabaseOperation.js)
}));
vi.mock('../node/TaskBroker.js', () => ({
  dequeue: vi.fn(() => ({ id: 1, taskData: 'data' })), // dequeue always returns a dummy task
  messageQueue: {},
  dqList: {},
  acknowledge: vi.fn(() => true), // acknowledge always returns true
}));
vi.mock('../node/server.js', () => ({
  sendJsonResponse: vi.fn((res, code, obj) => { // sendJsonResponse captures status and response body for assertions
    res._code = code;
    res._json = obj;
    res.end();
  }),
}));

// --- HELPER FUNCTIONS ---
// Create a mock response object with spies for header and end
function createRes() {
  return {
    setHeader: vi.fn(), // Spy for header setting
    writeHead: vi.fn(), // Spy for writing headers
    end: vi.fn(),       // Spy for ending response
    _code: undefined,   // Custom: stores status code
    _json: undefined,   // Custom: stores response body
  };
}

// Create a mock request object that can emit 'data' and 'end' events
function createReq({ method = 'GET', url = '/', headers = {}, body = '' } = {}) {
  let listeners = {};
  return {
    method,
    url,
    headers,
    on: (event, cb) => { listeners[event] = cb; }, // Register event listeners (e.g., for 'data', 'end')
    emit: (event, ...args) => listeners[event]?.(...args), // Emit events to trigger listeners
    _body: body, // Not used directly, but could be for more advanced mocks
  };
}

// --- MAIN TEST SUITE ---
describe('router.js', () => {
  let res;      // Mock response object
  let users;    // In-memory users array
  let tasks;    // In-memory tasks array
  let hostname = 'localhost';
  let PORT = 3000;

  // Reset mocks and test data before each test to ensure isolation
  beforeEach(() => {
    res = createRes();
    users = [{ username: 'existing', email: 'existing@email.com', password: 'Password1' }];
    tasks = [];
  });

  // --- ROUTE TESTS ---

  // Test GET / (landing page): should set headers (file serving is not asserted here)
  it('serves landing page', () => {
    const req = createReq({ url: '/' });
    router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res.setHeader).toHaveBeenCalled();
  });

  // Test GET /node/fillLeaderBoard: should return mocked leaderboard data
  it('returns leaderboard data', async () => {
    const req = createReq({ url: '/node/fillLeaderBoard' });
    await router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._json).toEqual([{ username: 'test', points: 100 }]);
  });

  // Test GET /node/users-tasks with valid username: should return mocked points
  it('returns user points for valid user', async () => {
    const req = createReq({ url: '/node/users-tasks', headers: { authorization: 'Bearer token' } });
    req.url += '?username=valid';
    await router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._json).toHaveProperty('points', 42);
  });

  // Test GET /node/users-tasks with missing username: should return 400 error
  it('returns 400 if username missing in users-tasks', async () => {
    const req = createReq({ url: '/node/users-tasks', headers: { authorization: 'Bearer token' } });
    await router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._code).toBe(400);
  });

  // Test POST /node/login with valid credentials: should return a token
  it('handles login with valid credentials', async () => {
    const req = createReq({ method: 'POST', url: '/node/login' });
    req.on('data', () => {}); // Register dummy listeners
    req.on('end', async () => {});
    req.emit('data', JSON.stringify({ username: 'valid', password: 'pass' })); // Simulate sending data
    req.emit('end'); // Simulate end of request
    await router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._json).toHaveProperty('token');
  });

  // Test POST /node/login with invalid credentials: should return 401 error
  it('handles login with invalid credentials', async () => {
    const req = createReq({ method: 'POST', url: '/node/login' });
    req.on('data', () => {});
    req.on('end', async () => {});
    req.emit('data', JSON.stringify({ username: 'invalid', password: 'wrong' }));
    req.emit('end');
    await router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._code).toBe(401);
  });

  // Test POST /node/register with valid data: should return 201
  it('handles registration with valid data', async () => {
    const req = createReq({ method: 'POST', url: '/node/register' });
    req.on('data', () => {});
    req.on('end', () => {});
    req.emit('data', JSON.stringify({ username: 'newuser', email: 'new@email.com', password: 'Password1' }));
    req.emit('end');
    await router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._code).toBe(201);
  });

  // Test POST /node/register with missing fields: should return 400
  it('rejects registration with missing fields', async () => {
    const req = createReq({ method: 'POST', url: '/node/register' });
    req.on('data', () => {});
    req.on('end', () => {});
    req.emit('data', JSON.stringify({ username: '', email: '', password: '' }));
    req.emit('end');
    await router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._code).toBe(400);
  });

  // Test unknown route: should return 404
  it('returns 404 for unknown route', () => {
    const req = createReq({ url: '/unknown' });
    router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._code).toBe(404);
  });

  // Test GET /node/requestTask: should return a dummy task
  it('handles /node/requestTask GET', async () => {
    const req = createReq({ url: '/node/requestTask' });
    await router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._json).toHaveProperty('id', 1);
    expect(res._json).toHaveProperty('taskData', 'data');
  });

  // Test POST /node/clientTaskDone: should return 200 and a message
  it('handles /node/clientTaskDone POST', async () => {
    const req = createReq({ method: 'POST', url: '/node/clientTaskDone' });
    req.on('data', () => {});
    req.on('end', () => {});
    req.emit('data', JSON.stringify({ result: { exponent: 2, username: 'valid', isMersennePrime: true, perfectIsEven: false, points: 10 }, taskId: 1 }));
    req.emit('end');
    await router.handleRoutes(req, res, hostname, PORT, users, tasks);
    expect(res._code).toBe(200);
    expect(res._json).toHaveProperty('message');
  });
});
