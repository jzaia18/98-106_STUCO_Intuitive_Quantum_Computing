//////////////////////////////////////// Functions for managing inputs ////////////////////////////////////////

function update_N() {
  // Read user inputs
  let p = BigInt($("#shor-p")[0].value);
  let q = BigInt($("#shor-q")[0].value);

  // Set modulus
  let N = p*q;
  $("#shor-N")[0].value = N;

  // Set totient value
  $("#shor-totN")[0].value = (p-1n)*(q-1n);

  // Update all other values which depend on N
  update_e();
  update_m();
  update_a();

  validate_all();
}

function update_e() {
  // Read user inputs
  let e = BigInt($("#shor-e")[0].value);
  let totN = BigInt($("#shor-totN")[0].value);

  // Fix modulo
  e %= totN;
  $("#shor-e")[0].value = e;

  // Compute secret key
  $("#shor-d")[0].value = mod_inv(e, totN);

  // Update all other values which depend on e
  update_m();

  validate_all();
}

function update_m() {
  let m = BigInt($("#shor-m")[0].value);
  let e = BigInt($("#shor-e")[0].value);
  let d = BigInt($("#shor-d")[0].value);
  let N = BigInt($("#shor-N")[0].value);

  m %= N;
  if (m <= 0n) {
    m += N;
  }

  let c = mod_sq_and_mult(m, e, N);
  if (c <= 0n) {
    c += N;
  }

  let mdec = mod_sq_and_mult(c, d, N);
  if (mdec <= 0n) {
    mdec += N;
  }

  $("#shor-m")[0].value = m;
  $("#shor-c")[0].value = c;
  $("#shor-mdec")[0].value = mdec;
}

function update_a() {
  let a = BigInt($("#shor-a")[0].value);
  let N = BigInt($("#shor-N")[0].value);

  a %= N;
  if (a <= 0n) {
    a += N;
  }

  let K = gcd(a, N);

  let r = find_order(a, N);

  $("#shor-a")[0].value = a;
  $("#shor-K")[0].value = K;
  $("#shor-r")[0].value = r;

  let v1 = NaN;
  let g1 = NaN;
  let v2 = NaN;
  let g2 = NaN;

  if (typeof(r) == 'bigint') {
    let v = mod_sq_and_mult(a, r/2n, N);
    if (r % 2n == 0n) {
      v1 = v + 1n;
      g1 = gcd(v1, N);
    }

    if (r % 2n == 0n) {
      v2 = v - 1n;
      g2 = gcd(v2, N);
    }
  }

  $("#shor-v1")[0].value = v1;
  $("#shor-v2")[0].value = v2;
  $("#shor-g1")[0].value = g1;
  $("#shor-g2")[0].value = g2;

  validate_all();
}

function validate_all() {
  // Read user inputs
  let p = BigInt($("#shor-p")[0].value);
  let q = BigInt($("#shor-q")[0].value);
  let N = BigInt($("#shor-N")[0].value);

  let totN = BigInt($("#shor-totN")[0].value);
  let e = BigInt($("#shor-e")[0].value);
  let d = BigInt($("#shor-d")[0].value);

  let m = BigInt($("#shor-m")[0].value);
  let c = BigInt($("#shor-c")[0].value);

  let a = BigInt($("#shor-a")[0].value);
  let r = NaN;
  if (!isNaN($("#shor-r")[0].value)) {
    r = BigInt($("#shor-r")[0].value);
  }

  // Validate moduli
  if (p >= 2n && is_prime(p)) {
    $("#shor-p")[0].setCustomValidity("");
  } else {
    $("#shor-p")[0].setCustomValidity("p must be prime");
  }

  if (q >= 2n && is_prime(q) && p != q) {
    $("#shor-q")[0].setCustomValidity("");
  } else {
    $("#shor-q")[0].setCustomValidity("q must be prime");
  }

  // Validate e
  if (e >= 2n && e < totN && coprime(e, totN)) {
    $("#shor-e")[0].setCustomValidity("");
  } else {
    $("#shor-e")[0].setCustomValidity("e must be coprime with φ(N)");
  }

  // Validate m
  if (m >= 1n && m <= N) {
    $("#shor-m")[0].setCustomValidity("");
  } else {
    $("#shor-m")[0].setCustomValidity("m must be between 1 and N");
  }

  // Validate a
  if (a > 1n && a < N) {
    $("#shor-a")[0].setCustomValidity("");
  } else {
    $("#shor-a")[0].setCustomValidity("a must be between 2 and N-1");
  }

  // Validate r
  if (r > 0n) {
    $("#shor-r-fake")[0].setCustomValidity("");
  } else {
    $("#shor-r-fake")[0].setCustomValidity("r should not be negative");
  }

  // Validate vs and gs
  if (r > 0n && r % 2n == 0n) {
    $("#shor-v-fake")[0].setCustomValidity("");
    $("#shor-g-fake")[0].setCustomValidity("");
  } else {
    $("#shor-v-fake")[0].setCustomValidity("r invalid for v");
    $("#shor-g-fake")[0].setCustomValidity("r invalid for g");
  }

}

//////////////////////////////////////// Helper functions ////////////////////////////////////////

function is_prime(x) {
  if (x == 2n) {
    return true;
  }
  if (x % 2n == 0n) {
    return false;
  }

  for (let i = 3n; i * i <= x; i += 2n) {
    if (x % i == 0n) {
      return false;
    }
  }

  return true;
}

function gcd(a, b) {
  while (b != 0n) {
    t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function coprime(a, b) {
  return gcd(a, b) == 1n;
}

function mod_inv(x, N) {
  let t = 0n;
  let new_t = 1n;
  let r = N;
  let new_r = x;

  while (new_r != 0n) {
    let quotient = (r - (r % new_r)) / new_r;

    let temp = new_t;
    new_t = t - quotient*new_t;
    t = temp;

    temp = new_r;
    new_r = r - quotient*new_r;
    r = temp;
  }

  if (r > 1n) {
    return 0n; // sentinel for something bad
  }
  if (t < 0n) {
    t += N;
  }

  return t;
}

function mod_sq_and_mult(b, e, N) {
  let value = 1n;

  let bits = e.toString(2);

  // while (e != 0) {
  for (let bit of bits) {
    value *= value;

    if (bit == "1") {
      value *= b;
    }
    value %= N;
  }

  return value;
}

function find_order(a, N) {
  let r = 1n;
  let val = a;

  while (val != 1n) {
    val *= a;
    val %= N;
    r++;

    if (r > FORCE_ORDER_FIND_STOP) {
      return NaN;
    }
  }

  return r;
}

// function totient(n) {
//   let count = 0;
//   for (let i = 1; i <= n; i++) {
//     if (coprime(i, n)) {
//       count++;
//     }
//   }

//   return count;
// }

// Stop after 20 million iters
let FORCE_ORDER_FIND_STOP = 20000000n;

// Initialize all form data
update_N();
update_e();
update_m();
update_a();
