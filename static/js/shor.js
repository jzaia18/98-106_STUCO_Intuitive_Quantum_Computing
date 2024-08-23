//////////////////////////////////////// Functions for managing inputs ////////////////////////////////////////

function update_N() {
  // Read user inputs
  let p = parseInt($("#shor-p")[0].value);
  let q = parseInt($("#shor-q")[0].value);

  // Set modulus
  let N = p*q;
  $("#shor-N")[0].value = N;

  // Set totient value
  $("#shor-totN")[0].value = (p-1)*(q-1);

  // Update all other values which depend on N
  update_e();
  update_m();
  update_a();

  validate_all();
}

function update_e() {
  // Read user inputs
  let e = parseInt($("#shor-e")[0].value);
  let totN = parseInt($("#shor-totN")[0].value);

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
  let m = parseInt($("#shor-m")[0].value);
  let e = parseInt($("#shor-e")[0].value);
  let d = parseInt($("#shor-d")[0].value);
  let N = parseInt($("#shor-N")[0].value);

  m %= N;
  if (m <= 0) {
    m += N;
  }

  let c = mod_sq_and_mult(m, e, N);
  if (c <= 0) {
    c += N;
  }

  let mdec = mod_sq_and_mult(c, d, N);
  if (mdec <= 0) {
    mdec += N;
  }

  $("#shor-m")[0].value = m;
  $("#shor-c")[0].value = c;
  $("#shor-mdec")[0].value = mdec;
}

function update_a() {
  let a = parseInt($("#shor-a")[0].value);
  let N = parseInt($("#shor-N")[0].value);

  a %= N;
  if (a <= 0) {
    a += N;
  }

  let K = gcd(a, N);

  let r = find_order(a, N);

  $("#shor-a")[0].value = a;
  $("#shor-K")[0].value = K;
  $("#shor-r")[0].value = r;

  let v = mod_sq_and_mult(a, Math.floor(r/2), N);

  let v1 = NaN;
  let g1 = NaN;
  if (r % 2 == 0) {
    v1 = v + 1;
    g1 = gcd(v1, N);
  }

  let v2 = NaN;
  let g2 = NaN;
  if (r % 2 == 0) {
    v2 = v - 1;
    g2 = gcd(v2, N);
  }

  $("#shor-v1")[0].value = v1;
  $("#shor-v2")[0].value = v2;
  $("#shor-g1")[0].value = g1;
  $("#shor-g2")[0].value = g2;

  validate_all();
}

function validate_all() {
  // Read user inputs
  let p = parseInt($("#shor-p")[0].value);
  let q = parseInt($("#shor-q")[0].value);
  let N = parseInt($("#shor-N")[0].value);

  let totN = parseInt($("#shor-totN")[0].value);
  let e = parseInt($("#shor-e")[0].value);
  let d = parseInt($("#shor-d")[0].value);

  let m = parseInt($("#shor-m")[0].value);
  let c = parseInt($("#shor-c")[0].value);

  let a = parseInt($("#shor-a")[0].value);
  let r = parseInt($("#shor-r")[0].value);

  // Validate moduli
  if (p >= 2 && is_prime(p)) {
    $("#shor-p")[0].setCustomValidity("");
  } else {
    $("#shor-p")[0].setCustomValidity("p must be prime");
  }

  if (q >= 2 && is_prime(q) && p != q) {
    $("#shor-q")[0].setCustomValidity("");
  } else {
    $("#shor-q")[0].setCustomValidity("q must be prime");
  }

  // Validate e
  if (e >= 2 && e < totN && coprime(e, totN)) {
    $("#shor-e")[0].setCustomValidity("");
  } else {
    $("#shor-e")[0].setCustomValidity("e must be coprime with φ(N)");
  }

  // Validate m
  if (m >= 1 && m <= N) {
    $("#shor-m")[0].setCustomValidity("");
  } else {
    $("#shor-m")[0].setCustomValidity("m must be between 1 and N");
  }

  // Validate a
  if (a > 1 && a < N) {
    $("#shor-a")[0].setCustomValidity("");
  } else {
    $("#shor-a")[0].setCustomValidity("a must be between 2 and N-1");
  }

  // Validate r
  if (r > 0) {
    $("#shor-r-fake")[0].setCustomValidity("");
  } else {
    $("#shor-r-fake")[0].setCustomValidity("r should not be negative");
  }

  // Validate vs and gs
  if (r > 0 && r % 2 == 0) {
    $("#shor-v-fake")[0].setCustomValidity("");
    $("#shor-g-fake")[0].setCustomValidity("");
  } else {
    $("#shor-v-fake")[0].setCustomValidity("r invalid for v");
    $("#shor-g-fake")[0].setCustomValidity("r invalid for g");
  }

}

//////////////////////////////////////// Helper functions ////////////////////////////////////////

function is_prime(x) {
  if (x == 2) {
    return true;
  }
  if (x % 2 == 0) {
    return false;
  }

  for (let i = 3; i * i <= x; i += 2) {
    if (x % i == 0) {
      return false;
    }
  }

  return true;
}

function gcd(a, b) {
  while (b != 0) {
    t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function coprime(a, b) {
  return gcd(a, b) == 1;
}

function mod_inv(x, N) {
  let t = 0;
  let new_t = 1;
  let r = N;
  let new_r = x;

  while (new_r != 0) {
    let quotient = Math.floor(r / new_r);

    let temp = new_t;
    new_t = t - quotient*new_t;
    t = temp;

    temp = new_r;
    new_r = r - quotient*new_r;
    r = temp;
  }

  if (r > 1) {
    return 0; // sentinel for something bad
  }
  if (t < 0) {
    t += N;
  }

  return t;
}

function mod_sq_and_mult(b, e, N) {
  let value = 1;

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
  let r = 1;
  let val = a;

  while (val != 1) {
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

// Stop after 10 million iters
let FORCE_ORDER_FIND_STOP = 10000000;

// Initialize all form data
update_N();
update_e();
update_m();
update_a();
