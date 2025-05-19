// since JS doesn't support sqrt for BigInt, we use:
function newtonRaphsonMethod(n, x0) {    // Newton-Raphson method for square root approximation
    const x1 = ((n / x0) + x0) >> 1n;    // division by 2^1n = 2 (using bitwise right shift)
    if (x0 === x1 || x0 === (x1 - 1n)) { // checking if approximation is close enough
        return x0;                       // if so, return the approximation
    }
    return newtonRaphsonMethod(n, x1);   // recursive call with new approximation
}

function sqrt(value) {                     // actual sqrt function
    if (value < 0n) {                      // check for negative numbers
        throw 'Taking the square of negative numbers (<0) is not supported.'
    } else if (value < 2n) {               // because sqrt(0) = 0 and sqrt(1) = 1, if value = 0 or 1
        return value;                      // return 0 or 1 (value itself)
    }
    return newtonRaphsonMethod(value, 1n); // otherwise, use NRM for sqrt
}

function isEven(number) {      // function to check if a number is even
    return number % 2n === 0n; // using modulus 2
}

function isPrime(p) {                          // function to check if a number is prime (using trial division)
    if (p == 2n) {                             // 2 is prime
        return true;                           // so return true
    } else if (p <= 1n || isEven(p)) {         // even numbers and numbers >= 1 are not prime
        return false;                          // so return false
    } else {
        let root_p = sqrt(p);                  // calculate the square root of p using sqrt function
        for (let i = 3n; i <= root_p; i += 2n) // check odd numbers up to sqrt(p)
            if (p % i == 0n) {                 // if p is divisible by i, it's not prime
                return false;                  // so return false
            }
        return true;                           // if no divisors found, it's prime (return true)
    }
}

function calculatePerfectNumber(p) {            // calculate the perfect number 2^(p - 1) * (2^p - 1)
    return ((1n << p) - 1n) * (1n << (p - 1n)); // return the perfect number (using bitwise left shift)
}                                               // no validations needed (we did that already)

function isMersennePrime(p) {           // function to check if a number is a Mersenne prime
    if (!isPrime(p))                    // check if p is prime first (using isPrime function)
        return false;                   // if p is not prime, m_p is not a mersenne prime

    if (p == 2n) {
        return true;                    // if exponent p is 2, m_p is always a mersenne prime (it's 3)
    } else {
        let m_p = (1n << p) - 1n;       // 2^p - 1 (using bitwise shift operator)
        let s = 4n;                     // llt starts with s = 4
        for (let i = 3n; i <= p; i++) { // starting from 3 to exponent p, we increment s
            s = (s * s - 2n) % m_p;     // s = (s^2 - 2) mod m_p
        }
        return s === 0n;                // if s == 0, m_p is a Mersenne prime
    }                                   // 2^p - 1 is prime if and only if p is prime and 2^p - 1 is prime
}

// ACTUAL FUNCTION WE MIGHT USE (which checks one number at a time)
console.log("-------------------------"); // log separator

export function realLLT(testedExponent) {
    let timer = Date.now(); // start timer

    const username = localStorage.getItem('username');

    const resultObject = {        // object to store the result of the test
        exponent: testedExponent, // store exponent in result object
        isMersennePrime: null,    // store if m_p is a mersenne prime in result object
        perfectIsEven: null,      // store perfect number even/odd in result object
        username: username,       // store username in result object
        taskID: null,             // store task ID in result object    
        points: 0                 // store 0 in result object
    };
    
    console.log(`Checking M_${testedExponent} :)`); // log checked exponent

    resultObject.isMersennePrime = isMersennePrime(testedExponent); // store prime or not in object and log
    console.log("Is M_" + testedExponent + " a Mersenne prime? : " + resultObject.isMersennePrime);
    
    // if m_p is a mersenne prime, we check its perfect number
    // if it's false, it doesn't have a perfect number given by the same thing
    if (resultObject.isMersennePrime) {
        resultObject.perfectIsEven = isEven(calculatePerfectNumber(testedExponent)); // store even or odd in object and log
        console.log("Is perfect number for M_" + testedExponent + " even? : " + resultObject.perfectIsEven);
    }
    
    if (resultObject.perfectIsEven === false) { // If the resulting perfect number is odd, then the problem is solved and the user is awarded with 1.000.000.000 points
        resultObject.points = 1000000000;
    } else if (resultObject.isMersennePrime) { // If the result is a mersenne prime, but the perfect number is not odd, the user is awarded with 10.000 points
        resultObject.points = 10000;
    } else { // If the result isn't prime the user is awarded with 10 points.
        resultObject.points = 10;
    }
    
    console.log(`... Took: ${Date.now() - timer} ms`); // end timer
    console.log(`M_${testedExponent} checked :)`)      // log checked exponent
    console.log("-------------------------");          // log separator

    return resultObject; // return result object
}
