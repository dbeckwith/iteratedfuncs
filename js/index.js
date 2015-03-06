/* global d3, MathJax */

function updateTex() {
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

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

  // TODO: handle NaNs better
  var functions = [
    {
      f: function(z, a) {
        return a.div(new Complex(1).add(z));
      },
      start: new Complex(1),
      factor: new Complex(1),
      descrip: '\\frac a {1 + z}'
    },
    {
      f: function(z, a) {
        return a.add(z).recip();
      },
      start: new Complex(1),
      factor: new Complex(1),
      descrip: '\\frac 1 {a + z}'
    },
    {
      f: function(z, a) {
        return z.div(a.sub(z));
      },
      start: new Complex(1),
      factor: new Complex(1),
      descrip: '\\frac z {a - z}'
    },
    {
      f: function(z, a) {
        return z.sqr().add(a);
      },
      start: new Complex(0),
      factor: new Complex(0),
      descrip: 'z^2 + a'
    },
    {
      f: function(z, a) {
        return a.mult(z.sin());
      },
      start: new Complex(1),
      factor: new Complex(1),
      descrip: 'a \\sin z'
    },
    {
      f: function(z, a) {
        return a.mult(z.cos());
      },
      start: new Complex(0),
      factor: new Complex(1),
      descrip: 'a \\cos z'
    },
    {
      f: function(z, a) {
        return a.mult(z.tan());
      },
      start: new Complex(1),
      factor: new Complex(1),
      descrip: 'a \\tan z'
    },
    {
      f: function(z, a) {
        return a.mult(z.log());
      },
      start: new Complex(2),
      factor: new Complex(1),
      descrip: 'a \\ln z'
    }
  ];
  function getFuncDescrip(func) {
    return 'f\\!\\left(z\\right) = ' + func.descrip + '';
  }

  // TODO: lay out function radios better
  functions.forEach(function(func, i) {
    $('#funcChooser').append('\n\
<label class="radio-inline">\n\
  <input type="radio" name="funcSelector" value="' + i + '">\n\
  \\(' + getFuncDescrip(func) + '\\)\n\
</label>');
  });
  $('#funcChooser input:first').prop('checked', true);
  $('#funcChooser input').change(function() {
    setFunction(+$(this).val());
  });

  var gw = 500;
  var gh = 500;
  var graphExtent = 4;
  var convergence = 1e-2;

  var svg = d3.select('#graph');

  // TODO: update dimensions when graph resizes
  var w = $('#graph').width();
  var h = $('#graph').height();

  var margin = { bottom: h / 2 - gh / 2 + 10, left: w / 2 - gw / 2, right: w / 2 - gw / 2 };
  margin.top = h - gh - margin.bottom;
  margin.x = margin.left + margin.right;
  margin.y = margin.top + margin.bottom;

  svg = svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  var lines;
  var func;
  var start;
  var factor;
  function calcData() {
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
      prev = z;
      z = func.f(z, factor);
      lines.push({ 'prev': prev, 'curr': z });
    }
  }

  var xScale = d3.scale.linear()
          .domain([-graphExtent, graphExtent])
          .range([0, gw]);
  var yScale = d3.scale.linear()
          .domain([-graphExtent, graphExtent])
          .range([gh, 0]);
  var dragXScale = d3.scale.linear()
          .domain([xScale.invert(-margin.left), xScale.invert(gw + margin.right)])
          .range([-margin.left, gw + margin.right])
          .clamp(true);
  var dragYScale = d3.scale.linear()
          .domain([yScale.invert(-margin.top), yScale.invert(gh + margin.bottom)])
          .range([-margin.top, gh + margin.bottom])
          .clamp(true);

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

  svg.append('g')
          .attr('class', 'func-points');

  // TODO: make factor point and start point both be control points
  svg.append('circle')
          .attr('class', 'handle-point')
          .attr('r', 7)
          .attr('opacity', 0.7)
          .call(d3.behavior.drag()
                  .origin(function(d) {
                    return { 'x': xScale(d.re()), 'y': yScale(d.im()) };
                  })
                  .on('drag', function(d) {
                    d3.select(this).datum(factor = new Complex(dragXScale.invert(d3.event.x), dragYScale.invert(d3.event.y)));
                    calcData();
                    drawData();
                  }));

  function drawData() {
    var colorScale = d3.scale.linear()
            .domain(d3.range(0, lines.length, lines.length / 6))
            .range(['#d62728', '#ff7f0e', '#2ca02c', '#17becf', '#1f77b4', '#9467bd']);

    var segments = svg.select('.func-points').selectAll('.data-segment').data(lines);

    var newSegs = segments.enter()
            .append('g')
            .attr('class', 'data-segment')
            .attr('opacity', 0.3);
    newSegs.append('line')
            .attr('class', 'data-line')
            .attr('x1', 0)
            .attr('y1', 0);
    newSegs.append('circle')
            .attr('class', 'data-point')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 3);

    segments
            .attr('transform', function(d) {
              return 'translate(' + xScale(d.curr.re()) + ', ' + yScale(d.curr.im()) + ')';
            });
    segments.select('.data-line')
            .attr('x2', function(d) {
              return xScale(d.prev.re()) - xScale(d.curr.re());
            })
            .attr('y2', function(d) {
              return yScale(d.prev.im()) - yScale(d.curr.im());
            })
            .attr('stroke', function(d, i) {
              return colorScale(i);
            });
    segments.select('.data-point')
            .attr('fill', function(d, i) {
              return colorScale(i);
            });

    segments.exit().remove();

    svg.select('.handle-point')
            .attr('cx', function(d) {
              return xScale(d.re());
            })
            .attr('cy', function(d) {
              return yScale(d.im());
            });
  }

  function setFunction(i) {
    func = functions[i];
    start = func.start;
    factor = func.factor;

    $('#funcDescrip').text('\\[' + getFuncDescrip(func) + '\\]');
    updateTex();

    svg.select('.handle-point')
            .datum(factor)
            .attr('cx', function(d) {
              return xScale(d.re());
            })
            .attr('cy', function(d) {
              return yScale(d.im());
            });

    calcData();
    drawData();
  }

  setFunction(0);

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