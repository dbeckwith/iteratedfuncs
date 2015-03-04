$(function() {

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
      return Complex.fromPolar(Math.pow(this.abs, z.real) * Math.exp(-this.arg * z.imag), z.imag * Math.log(abs) + z.real * this.arg);
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

  var functions = [
    {
      'f': function(z, a) {
        return a.div(new Complex(1).add(z));
      },
      'start': new Complex(1),
      'factor': new Complex(1)
    },
    {
      'f': function(z, a) {
        return a.add(z).recip();
      },
      'start': new Complex(1),
      'factor': new Complex(1)
    },
    {
      'f': function(z, a) {
        return z.div(a.sub(z));
      },
      'start': new Complex(1),
      'factor': new Complex(1)
    },
    {
      'f': function(z, a) {
        return z.sqr().add(a);
      },
      'start': new Complex(0),
      'factor': new Complex(0)
    },
    {
      'f': function(z, a) {
        return z.pwr(new Complex(3)).add(a);
      },
      'start': new Complex(0),
      'factor': new Complex(0)
    },
    {
      'f': function(z, a) {
        return z.pwr(new Complex(4)).add(a);
      },
      'start': new Complex(0),
      'factor': new Complex(0)
    },
    {
      'f': function(z, a) {
        return a.mult(z.sin());
      },
      'start': new Complex(1),
      'factor': new Complex(1)
    },
    {
      'f': function(z, a) {
        return a.mult(z.cos());
      },
      'start': new Complex(0),
      'factor': new Complex(1)
    },
    {
      'f': function(z, a) {
        return a.mult(z.tan());
      },
      'start': new Complex(1),
      'factor': new Complex(1)
    },
    {
      'f': function(z, a) {
        return a.mult(z.log());
      },
      'start': new Complex(2),
      'factor': new Complex(1)
    }

  ];

  var gw = 500;
  var gh = 500;
  var graphExtent = 4;
  var convergence = 1e-2;

  var svg = d3.select('#graph');

  var w = $('#graph').width();
  var h = $('#graph').height();

  var margin = { bottom: 35, left: w / 2 - gw / 2, top: 15, right: w / 2 - gw / 2 };
  margin.x = margin.left + margin.right;
  margin.y = margin.top + margin.bottom;

  svg = svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  var pts, lines;
  var func = functions[0];
  var start = func.start;
  var factor = func.factor;
  function calcData() {
    pts = [];
    lines = [];
    var z = start;
    var prev = null;
    for (var i = 0; i < 500; i++) {
      if (z === Complex.NaN)
        break;
      if (prev !== null && z.dist(prev) < convergence) {
//        console.log('converge');
        break;
      }
      pts.push(z);
      prev = z;
      z = func.f(z, factor);
      lines.push({ 'prev': prev, 'curr': z });
    }
  }
  calcData();

  var xScale = d3.scale.linear()
          .domain([-graphExtent, graphExtent])
          .range([0, gw]);
  var yScale = d3.scale.linear()
          .domain([-graphExtent, graphExtent])
          .range([gh, 0]);

  var xAxis = d3.svg.axis()
          .scale(xScale)
          .orient('bottom')
          .tickSize(-gh);
  svg.append('g')
          .attr('class', 'axis real-axis')
          .attr('transform', 'translate(0, ' + gh + ')')
          .call(xAxis);
  var yAxis = d3.svg.axis()
          .scale(yScale)
          .orient('left')
          .tickSize(-gw);
  svg.append('g')
          .attr('class', 'axis imag-axis')
          .call(yAxis);

  var drag = d3.behavior.drag()
          .origin(function(d) {
            return { 'x': xScale(d.re()), 'y': yScale(d.im()) };
          })
          .on('drag', function(d) {
            factor.re(xScale.invert(d3.event.x));
            factor.im(yScale.invert(d3.event.y));
            calcData();
            drawData();
          });

  function drawData() {
    svg.selectAll('.data-line').remove();
    svg.selectAll('.data-point').remove();
    svg.selectAll('.handle-point').remove();
    var colorScale = d3.scale.linear()
            .domain(d3.range(0, pts.length, pts.length / 6))
            .range(['#d62728', '#ff7f0e', '#2ca02c', '#17becf', '#1f77b4', '#9467bd']);
    svg.selectAll('.data-line')
            .data(lines)
            .enter()
            .append('line')
            .attr('class', 'data-line')
            .attr('x1', function(d, i) {
              return xScale(d.prev.re());
            })
            .attr('y1', function(d, i) {
              return yScale(d.prev.im());
            })
            .attr('x2', function(d, i) {
              return xScale(d.curr.re());
            })
            .attr('y2', function(d, i) {
              return yScale(d.curr.im());
            })
            .attr('stroke', function(d, i) {
              return colorScale(i);
            })
            .attr('opacity', 0.5);
    svg.selectAll('.data-point')
            .data(pts)
            .enter()
            .append('circle')
            .attr('class', 'data-point')
            .attr('cx', function(d, i) {
              return xScale(d.re());
            })
            .attr('cy', function(d, i) {
              return yScale(d.im());
            })
            .attr('r', 3)
            .attr('fill', function(d, i) {
              return colorScale(i);
            })
            .attr('opacity', 0.5);
    svg.append('circle')
            .datum(factor)
            .attr('class', 'handle-point')
            .attr('cx', function(d, i) {
              return xScale(d.re());
            })
            .attr('cy', function(d, i) {
              return yScale(d.im());
            })
            .attr('r', 7)
            .attr('opacity', 0.7);
    svg.select('.handle-point')
            .call(drag);
  }
  drawData();

  $('#graph .imag-axis .tick text').html(function(index, old) {
    function sp(t) {
      return '<tspan>' + t + '</tspan>';
    }
    var i = '<tspan class="math">i</tspan>';
    var n = parseInt(old);
    if (n === 0) {
      return sp(n);
    }
    if (n === 1)
      return i;
    if (n === -1)
      return sp('-') + i;
    return sp(n) + i;
  });

});