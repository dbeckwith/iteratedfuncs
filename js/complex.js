/**
 * @author Daniel Beckwith <info@sonaxaton.net>
 */

// TODO: more NaN checking

/**
 * Creates a new complex number of the form a + bi
 * @constructor
 * @param {Number} real The real part of the complex number. (default 0)
 * @param {Number} imag The imaginary part of the complex number. (default 0)
 */
function Complex(real, imag) {
  /** @private */
  this.real = real;
  /** @private */
  this.imag = imag;

  if (real === undefined)
    this.real = 0;
  if (imag === undefined)
    this.imag = 0;

  /**
   * Sets/gets the real part of this complex number.
   * @param {Number} real The new value of this complex number's real part. If not given the current value is returned.
   * @returns {Number}
   */
  this.re = function(real) {
    if (real === undefined)
      return this.real;
    this.real = real;
    this.calcPolar();
  };

  /**
   * Sets/gets the imaginary part of this complex number.
   * @param {Number} imag The new value of this complex number's imaginary part. If not given the current value is returned.
   * @returns {Number}
   */
  this.im = function(imag) {
    if (imag === undefined)
      return this.imag;
    this.imag = imag;
    this.calcPolar();
  };

  this.abs = function(rad) {
    if (rad === undefined)
      return this.rad;
    this.rad = rad;
    this.re = this.rad * Math.cos(this.ang);
    this.im = this.rad * Math.sin(this.ang);
  };

  this.arg = function(ang) {
    if (ang === undefined)
      return this.ang;
    this.ang = ang;
    this.re = this.rad * Math.cos(this.ang);
    this.im = this.rad * Math.sin(this.ang);
  };

  /**
   * Pre-calculates the polar form of this complex number.
   * @private
   */
  this.calcPolar = function() {
    if (this.real !== null && this.imag !== null) {
      /** @private */
      this.rad = Math.sqrt(this.real * this.real + this.imag * this.imag);
      /** @private */
      this.ang = Math.atan2(this.imag, this.real);
    }
  };

  this.add = function(z) {
    return new Complex(this.real + z.real, this.imag + z.imag);
  };

  this.sub = function(z) {
    return new Complex(this.real - z.real, this.imag - z.imag);
  };

  this.mult = function(z) {
    return new Complex(this.real * z.real - this.imag * z.imag, this.real * z.imag + this.imag * z.real);
  };

  this.div = function(z) {
    var denom = z.real * z.real + z.imag * z.imag;
    return new Complex((this.real * z.real + this.imag * z.imag) / denom, (this.imag * z.real - this.real * z.imag) / denom);
  };

  this.dist = function(z) {
    if (Complex.isNaN(this) || Complex.isNaN(z))
      return Number.NaN;
    return Math.sqrt(this.distSq(z));
  };

  this.distSq = function(z) {
    if (Complex.isNaN(this) || Complex.isNaN(z))
      return Number.NaN;
    return (this.real - z.real) * (this.real - z.real) + (this.imag - z.imag) * (this.imag - z.imag);
  };

  this.conj = function() {
    return new Complex(this.real, -this.imag);
  };

  this.recip = function() {
    var denom = this.real * this.real + this.imag * this.imag;
    return new Complex(this.real / denom, -this.imag / denom);
  };

  this.neg = function() {
    return new Complex(this.real, this.imag);
  };

  this.sqr = function() {
    return new Complex(this.real * this.real - this.imag * this.imag, 2 * this.real * this.imag);
  };

  this.sqrt = function() {
    return new Complex(Math.sqrt((this.rad + this.real) / 2), (this.imag < 0 ? -1 : 1) * (Math.sqrt(this.rad - this.real) / 2));
  };

  this.pwr = function(z) {
    if (this.rad === 0)
      return Complex.NaN;
    return Complex.fromPolar(Math.pow(this.rad, z.real) * Math.exp(-this.ang * z.imag), z.imag * Math.log(this.rad) + z.real * this.ang);
  };

  this.exp = function() {
    return Complex.fromPolar(Math.exp(this.real), this.imag);
  };

  this.log = function() {
    if (this.rad === 0)
      return Complex.NaN;
    return new Complex(Math.log(this.rad), this.ang);
  };

  this.sin = function() {
    return new Complex((Math.exp(-this.imag) * Math.sin(this.real) - Math.exp(this.imag) * Math.sin(-this.real)) / 2, (-Math.exp(-this.imag) * Math.cos(this.real) + Math.exp(this.imag) * Math.cos(-this.real)) / 2);
  };

  this.cos = function() {
    return new Complex((Math.exp(-this.imag) * Math.cos(this.real) + Math.exp(this.imag) * Math.cos(-this.real)) / 2, (Math.exp(-this.imag) * Math.sin(this.real) + Math.exp(this.imag) * Math.sin(-this.real)) / 2);
  };

  this.tan = function() {
    return this.sin().div(this.cos());
  };

  this.equals = function(z) {
    return this.real === z.real && this.imag === z.imag;
  };

  this.toString = function() {
    return this.real + ' + ' + this.imag + 'i';
  };

  this.copy = function() {
    var z = new Complex(null, null);
    z.real = this.real;
    z.imag = this.imag;
    z.rad = this.rad;
    z.ang = this.ang;
    return z;
  };

  this.calcPolar();
}

/**
 * A special Complex value representing Not a Number.
 * @type Complex
 * @static
 */
Complex.NaN = new Complex(Number.NaN, Number.NaN);

/**
 * Tests if the given complex number is NaN or not
 * @param {Complex} z
 * @returns {boolean} true if the given number is NaN
 * @static
 */
Complex.isNaN = function(z) {
  return isNaN(z.real) || isNaN(z.imag);
};

/**
 *
 * @param {Number} r
 * @param {Number} t
 * @returns {Complex}
 * @static
 */
Complex.fromPolar = function(r, t) {
  var z = new Complex(null, null);
  z.real = r * Math.cos(t);
  z.imag = r * Math.sin(t);
  z.rad = r;
  z.ang = t;
  return z;
};
