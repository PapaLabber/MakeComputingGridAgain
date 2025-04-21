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

////////// End of sqrt implementation

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

// NU PRØVER VI NOGET ANDET DUYMT HIHIHIHIHIHIHIHI

/* DET VAR NOGET LORT HAHAHAHAHHAHAHA

function isMersennePrime(p) {
    if (p == 2n) {
        return true;
    } else {
        var m_p = (1n << p) - 1n;
        var s = 4n;
        for (var i = 3n; i <= p; i++) {
            s = modMultiply(s, s, m_p) - 2n;
            if (s < 0n) s += m_p;
        }
        return s === 0n;
    }
}

*/

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