export { isPrime, isMersennePrime };

// Newton-Raphson method for square root approximation, as JS doesn't support sqrt for BigInt
function newtonRaphsonMethod(n, x0) {
    const x1 = ((n / x0) + x0) >> 1n; // division by 2 (using bitwise right shift)
    if (x0 === x1 || x0 === (x1 - 1n)) { // checking if approximation is close enough
        return x0;
    }
    return newtonRaphsonMethod(n, x1); // recursive call with new approximation
}

// actual sqrt function
function sqrt(value) {
    if (value < 0n) { // check for negative numbers
        throw 'Taking the square of negative numbers (<0) is not supported.'
    }

    if (value < 2n) { // if value = 0 or 1, return 0 or 1 (because sqrt(0) = 0 and sqrt(1) = 1)
        return value;
    }
    return newtonRaphsonMethod(value, 1n); // otherwise, use NRM for sqrt
}

function isPrime(p) {
    if (p == 2n) { // 2 is prime
        return true;
    } else if (p <= 1n || p % 2n === 0n) { // 1 and even numbers are not prime
        return false;
    } else {
        let root_p = sqrt(p);
        for (let i = 3n; i <= root_p; i += 2n) // check odd numbers up to sqrt(p)
            if (p % i == 0n) { // if p is divisible by i, it's not prime
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
        return true; // if exponent p is 2, m_p is always a mersenne prime (it's 3)
    } else {
        let m_p = (1n << p) - 1n; // 2^p - 1 (using bitwise shift operator)
        let s = 4n; // llt starts with s = 4
        for (let i = 3n; i <= p; i++) { // starting from 3 to exponent p, we increment s
            s = (s * s - 2n) % m_p; // 
        }
        return s === 0n;
    }
} // 2^p - 1 is prime if and only if p is prime and 2^p - 1 is prime.

/* // initial code using intervals (we want to check one number at a time)
let upperBound = 5000; // exponents up to 5000
let timer = Date.now();
console.log(`Finding Mersenne primes in M[2..${upperBound}]:`);
console.log('M2');
for (let p = 3n; p <= upperBound; p += 2n) {
    if (isPrime(p) && isMersennePrime(p)) {
        console.log("M" + p);
    }
}
console.log(`... Took: ${Date.now() - timer} ms`);
*/

// ACTUAL FUNCTION WE MIGHT USE (checking one number at a time)
let testedExponentTrueMP = 2n; // 2 gives mersenne prime
let testedExponentFalseMP = 8n; // 8 gives not mersenne prime
//  fetch OR input tasked exponent instead 

function realLLT(testedExponent) {
    let timer = Date.now(); // start timer
    console.log(`Checking if M_${testedExponent} is a Mersenne prime:`); // log checked exponent
    if (isPrime(testedExponent) && isMersennePrime(testedExponent)) { // both testedExponent (p) and m_p (using testedExponent) must be prime for m_p to be a mersenne prime
        console.log("M_" + testedExponent + " IS A MERSENNE PRIME :)))) (congartulations)"); // log success
        // insert into database or insert into whatever logs the thing
    } else {
        console.log("M_" + testedExponent + " is not a Mersenne prime :(((("); // log failure
        // insert into database or insert into whatever logs the thing
    }
    console.log(`... Took: ${Date.now() - timer} ms`); // end timer
    console.log("-------------------------"); // log separator
    // insert into database or insert into whatever logs the thing
}

// testing different exponents
realLLT(testedExponentTrueMP); // call the function with the true exponent
realLLT(testedExponentFalseMP); // call the function with the false exponent
realLLT(9n); // random exponent 1
realLLT(11n); // random exponent 2
realLLT(211n); // random exponent 3
realLLT(607n); // random exponent 4 (true)
realLLT(3217n); // random exponent 5 (true)
realLLT(4237n); // random exponent 5