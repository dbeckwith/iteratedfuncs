$(function() {

  function Complex(real, imag) {
    this.real = real;
    this.imag = imag;
    this.abs = Math.sqrt(this.real * this.real + this.imag * this.imag);
    this.arg = Math.atan2(this.imag, this.real);

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

    this.log = function() {
      if (this.abs === 0)
        return Complex.NaN;
      return new Complex(Math.log(this.abs), this.arg);
    };

    this.toString = function() {
      return real + ' + ' + imag + 'i';
    };
  }
  Complex.NaN = new Complex(Number.NaN, Number.NaN);
  Complex.isNaN = function(z) {
    return Number.isNaN(z.real) || Number.isNaN(z.imag);
  };

  var w = 500;
  var h = 500;
  var graphExtent = 4;
  var convergence = 1e-2;

  var svg = d3.select('#test')
          .attr('width', w)
          .attr('height', h);

  var pts = [];
  {
    var z = new Complex(2, 0);
    var prev = null;
    var f = function(z) {
      return z.log();
    };
    for (var i = 0; i < 100; i++) {
      if (z === Complex.NaN)
        break;
      if (prev !== null && z.dist(prev) < convergence) {
        console.log('converge');
        break;
      }
      prev = z;
      pts.push(z);
      z = f(z);
    }
  }

  var xScale = d3.scale.linear()
          .domain([-graphExtent, graphExtent])
          .range([0, w]);
  var yScale = d3.scale.linear()
          .domain([-graphExtent, graphExtent])
          .range([h, 0]);
  var colorScale = d3.scale.linear()
          .domain([0, pts.length])
          .range(['#1f77b4', '#d62728']);

  svg.selectAll('circle')
          .data(pts)
          .enter()
          .append('circle')
          .attr('cx', function(d, i) {
            return xScale(d.real);
          })
          .attr('cy', function(d, i) {
            return yScale(d.imag);
          })
          .attr('r', 3)
          .attr('fill', function(d, i) {
            return colorScale(i);
          });

});