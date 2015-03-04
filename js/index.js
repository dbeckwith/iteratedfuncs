$(function() {

  function Complex(real, imag) {
    this.real = real;
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
      this.abs = Math.sqrt(this.real * this.real + this.imag * this.imag);
      this.arg = Math.atan2(this.imag, this.real);
    };

    this.mult = function(z) {
      return new Complex(this.real * z.real - this.imag * z.imag, this.real * z.imag + this.imag * z.real);
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

    this.log = function() {
      if (this.abs === 0)
        return Complex.NaN;
      return new Complex(Math.log(this.abs), this.arg);
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

  var gw = 500;
  var gh = 500;
  var graphExtent = 4;
  var margin = { bottom: 35, left: 35, top: 15, right: 15 };
  margin.x = margin.left + margin.right;
  margin.y = margin.top + margin.bottom;
  var convergence = 1e-2;
  var w = gw + margin.x;
  var h = gh + margin.y;

  var svg = d3.select('#graph')
          .attr('width', w)
          .attr('height', h)
          .append('g')
          .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  var pts, lines;
  var start = new Complex(2, 0);
  var factor = new Complex(1, 0);
  function calcData() {
    pts = [];
    lines = [];
    var z = start;
    var prev = null;
    var f = function(z) {
      return factor.mult(z.log());
    };
    for (var i = 0; i < 100; i++) {
      if (z === Complex.NaN)
        break;
      if (prev !== null && z.dist(prev) < convergence) {
//        console.log('converge');
        break;
      }
      pts.push(z);
      prev = z;
      z = f(z);
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
  var colorScale = d3.scale.linear()
          .domain([0, pts.length])
          .range(['#1f77b4', '#d62728']);

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
            });
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
            });
    svg.append('circle')
            .datum(factor)
            .attr('class', 'handle-point')
            .attr('cx', function(d, i) {
              return xScale(d.re());
            })
            .attr('cy', function(d, i) {
              return yScale(d.im());
            })
            .attr('r', 7);
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