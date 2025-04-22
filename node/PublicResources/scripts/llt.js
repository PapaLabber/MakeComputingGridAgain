export { isPrime, isMersennePrime };

////////// In JavaScript we don't have sqrt for BigInt - so here is implementation

function newtonRaphsonMethod(n, x0) {
    const x1 = ((n / x0) + x0) >> 1n;
    if (x0 === x1 || x0 === (x1 - 1n)) {
        return x0;
    }
    return newtonRaphsonMethod(n, x1);
}

function sqrt(value) {
    if (value < 0n) {
        throw 'Taking the square of negative numbers (<0) is not supported.'
    }

    if (value < 2n) {
        return value;
    }
    return newtonRaphsonMethod(value, 1n);
}

function isPrime(p) {
    if (p == 2n) {
        return true;
    } else if (p <= 1n || p % 2n === 0n) {
        return false;
    } else {
        var root_p = sqrt(p);
        for (var i = 3n; i <= root_p; i += 2n)
            if (p % i == 0n) {
                return false;
            }
        return true;
    }
}

function isPerfectNumber(n) {
    if (n <= 0n) {
        return false;
    }
    let sum = 1n;
    for (let i = 2n; i <= sqrt(n); i++) {
        if (n % i === 0n) {
            sum += i;
            if (i !== n / i) {
                sum += n / i;
            }
        }
    }
    return sum === n;
}

function isEven(n) {
    return n % 2n === 0n;
}

function isOdd(n) {
    return n % 2n !== 0n;
}

function isMersennePrime(p) {
    if (p == 2n) {
        return true;
    } else {
        var m_p = (1n << p) - 1n;
        var s = 4n;
        for (var i = 3n; i <= p; i++) {
            s = (s * s - 2n) % m_p;
        }
        return s === 0n;
    }
}

var upperBound = 5000;
var timer = Date.now();
console.log(`Finding Mersenne primes in M[2..${upperBound}]:`);
console.log('M2');
for (var p = 3n; p <= upperBound; p += 2n) {
    if (isPrime(p) && isMersennePrime(p)) {
        console.log("M" + p);
    }
}
console.log(`... Took: ${Date.now() - timer} ms`);