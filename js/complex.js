// TODO: more NaN checking

function Complex(real, imag) {
  if (real === undefined)
    this.real = 0;
  else
    this.real = real;
  if (imag === undefined)
    this.imag = 0;
  else
    this.imag = imag;

  this.re = function(real) {
    if (real === undefined)
      return this.real;
    this.real = real;
    this.calcPolar();
  };

  this.im = function(imag) {
    if (imag === undefined)
      return this.imag;
    this.imag = imag;
    this.calcPolar();
  };

  this.calcPolar = function() {
    if (this.real !== null && this.imag !== null) {
      this.abs = Math.sqrt(this.real * this.real + this.imag * this.imag);
      this.arg = Math.atan2(this.imag, this.real);
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
    return new Complex(Math.sqrt((this.abs + this.real) / 2), (this.imag < 0 ? -1 : 1) * (Math.sqrt(this.abs - this.real) / 2));
  };

  this.pwr = function(z) {
    if (this.abs === 0)
      return Complex.NaN;
    return Complex.fromPolar(Math.pow(this.abs, z.real) * Math.exp(-this.arg * z.imag), z.imag * Math.log(this.abs) + z.real * this.arg);
  };

  this.exp = function() {
    return Complex.fromPolar(Math.exp(this.real), this.imag);
  };

  this.log = function() {
    if (this.abs === 0)
      return Complex.NaN;
    return new Complex(Math.log(this.abs), this.arg);
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
    return real + ' + ' + imag + 'i';
  };

  this.calcPolar();
}
Complex.NaN = new Complex(Number.NaN, Number.NaN);
Complex.isNaN = function(z) {
  return Number.isNaN(z.real) || Number.isNaN(z.imag);
};
Complex.fromPolar = function(r, t) {
  var z = new Complex(null, null);
  z.real = r * Math.cos(t);
  z.imag = r * Math.sin(t);
  z.abs = r;
  z.arg = t;
  return z;
};