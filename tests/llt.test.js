import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  realLLT,
  isEven,
  isPrime,
  isMersennePrime,
  calculatePerfectNumber,
  sqrt,
  newtonRaphsonMethod
} from '../node/PublicResources/extension/llt.js';

// Mock localStorage for username
defineGlobalLocalStorage();
function defineGlobalLocalStorage() {
  beforeEach(() => {
    global.localStorage = {
      getItem: vi.fn((key) => {
        if (key === 'username') return 'testuser';
        return null;
      })
    };
  });
}

describe('isEven', () => {
  it('returns true for even BigInt', () => {
    expect(isEven(4n)).toBe(true);
    expect(isEven(0n)).toBe(true);
    expect(isEven(-2n)).toBe(true);
  });
  it('returns false for odd BigInt', () => {
    expect(isEven(3n)).toBe(false);
    expect(isEven(-1n)).toBe(false);
  });
});

describe('isPrime', () => {
  it('returns true for 2n', () => {
    expect(isPrime(2n)).toBe(true);
  });
  it('returns false for numbers <= 1n', () => {
    expect(isPrime(1n)).toBe(false);
    expect(isPrime(0n)).toBe(false);
    expect(isPrime(-5n)).toBe(false);
  });
  it('returns false for even numbers > 2', () => {
    expect(isPrime(4n)).toBe(false);
    expect(isPrime(100n)).toBe(false);
  });
  it('returns true for small odd primes', () => {
    expect(isPrime(3n)).toBe(true);
    expect(isPrime(5n)).toBe(true);
    expect(isPrime(7n)).toBe(true);
  });
  it('returns false for small odd non-primes', () => {
    expect(isPrime(9n)).toBe(false);
    expect(isPrime(15n)).toBe(false);
  });
});

describe('sqrt', () => {
  it('returns correct sqrt for perfect squares', () => {
    expect(sqrt(0n)).toBe(0n);
    expect(sqrt(1n)).toBe(1n);
    expect(sqrt(4n)).toBe(2n);
    expect(sqrt(9n)).toBe(3n);
    expect(sqrt(16n)).toBe(4n);
    expect(sqrt(123456789n)).toBe(11111n);
  });
  it('returns floor of sqrt for non-perfect squares', () => {
    expect(sqrt(2n)).toBe(1n);
    expect(sqrt(3n)).toBe(1n);
    expect(sqrt(5n)).toBe(2n);
    expect(sqrt(8n)).toBe(2n);
    expect(sqrt(10n)).toBe(3n);
  });
  it('throws for negative input', () => {
    expect(() => sqrt(-1n)).toThrow();
  });
});

describe('newtonRaphsonMethod', () => {
  it('approximates sqrt for perfect squares', () => {
    expect(newtonRaphsonMethod(9n, 1n)).toBe(3n);
    expect(newtonRaphsonMethod(16n, 1n)).toBe(4n);
  });
  it('returns floor for non-perfect squares', () => {
    expect(newtonRaphsonMethod(10n, 1n)).toBe(3n);
  });
});

describe('calculatePerfectNumber', () => {
  it('calculates perfect number for p=2', () => {
    expect(calculatePerfectNumber(2n)).toBe(6n);
  });
  it('calculates perfect number for p=3', () => {
    expect(calculatePerfectNumber(3n)).toBe(28n);
  });
  it('calculates perfect number for p=5', () => {
    expect(calculatePerfectNumber(5n)).toBe(496n);
  });
});

describe('isMersennePrime', () => {
  it('returns false if p is not prime', () => {
    expect(isMersennePrime(4n)).toBe(false);
    expect(isMersennePrime(6n)).toBe(false);
  });
  it('returns true for p=2', () => {
    expect(isMersennePrime(2n)).toBe(true);
  });
  it('returns true for known Mersenne prime exponents', () => {
    expect(isMersennePrime(3n)).toBe(true);
    expect(isMersennePrime(5n)).toBe(true);
    expect(isMersennePrime(7n)).toBe(true);
  });
  it('returns false for non-Mersenne primes', () => {
    expect(isMersennePrime(11n)).toBe(false);
  });
});

describe('realLLT', () => {
  it('returns correct result for known Mersenne prime exponent (3)', () => {
    const result = realLLT(3n);
    expect(result).toMatchObject({
      exponent: 3n,
      isMersennePrime: true,
      perfectIsEven: true,
      username: 'testuser',
      points: 10000
    });
  });

  it('returns correct result for non-prime exponent (4)', () => {
    const result = realLLT(4n);
    expect(result).toMatchObject({
      exponent: 4n,
      isMersennePrime: false,
      perfectIsEven: null,
      username: 'testuser',
      points: 10
    });
  });


  it('returns correct result for exponent 2 (special case)', () => {
    const result = realLLT(2n);
    expect(result).toMatchObject({
      exponent: 2n,
      isMersennePrime: true,
      perfectIsEven: true,
      username: 'testuser',
      points: 10000
    });
  });

  it('handles large non-prime exponents', () => {
    const result = realLLT(20n);
    expect(result.isMersennePrime).toBe(false);
    expect(result.points).toBe(10);
  });
});
