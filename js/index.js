/* global d3, MathJax, Complex */

function updateTex() {
  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

$(function() {

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

  var graph = svg.append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

  var lines;
  var func;
  var start;
  var factor;
  function calcData() {
    lines = [];
    var z = start;
    var prev = null;
    for (var i = 0; i < 500; i++) {
      if (prev !== null && z.dist(prev) < convergence) {
//        console.log('converge');
        break;
      }
      prev = z;
      z = func.f(z, factor);
      if (Complex.isNaN(z))
        break;
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
  graph.append('g')
          .attr('class', 'axis real-axis')
          .attr('transform', 'translate(0, ' + gh + ')')
          .call(xAxis);
  var yAxis = d3.svg.axis()
          .scale(yScale)
          .orient('left')
          .tickSize(-gw);
  graph.append('g')
          .attr('class', 'axis imag-axis')
          .call(yAxis);


  var circleScale = d3.scale.linear()
          .domain([0, graphExtent])
          .range([0, gw / 2]);
  var circleTicks = d3.range(1, graphExtent * 2 + 1);
  graph.selectAll('.tick-circle')
          .data(circleTicks)
          .enter()
          .append('circle')
          .attr('class', 'tick-circle')
          .attr('cx', xScale(0))
          .attr('cy', yScale(0))
          .attr('r', function(d) {
            return circleScale(d / 2);
          })
          .attr('fill', 'none')
          .attr('stroke', function(d, i) {
            return 'hsla(0, 0%, 0%, ' + (i % 2 === 0 ? 0.1 : 0.2) + ')';
          });

  graph.append('g')
          .attr('class', 'func-points');

  function drawData() {
    var colorScale = d3.scale.linear()
            .domain(d3.range(0, lines.length, lines.length / 6))
            .range(['#d62728', '#ff7f0e', '#2ca02c', '#17becf', '#1f77b4', '#9467bd']);

    var segments = graph.select('.func-points').selectAll('.data-segment').data(lines);

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

    graph.selectAll('.control-point')
            .attr('cx', function(d) {
              return xScale(d.pt.re());
            })
            .attr('cy', function(d) {
              return yScale(d.pt.im());
            });

    svg.selectAll('.control-point-display')
            .html(function(d) {
              var s = '';
              s += '<tspan class="math">';
              s += d.name;
              s += '</tspan>';
              s += ': ';
              s += '<tspan x="15" dy="1.2em">';
              s += d.pt.re();
              s += ' + ';
              s += d.pt.im();
              s += '<tspan class="math imag">i</tspan>';
              s += '</tspan>';
              s += '<tspan x="15" dy="1.2em">';
              s += d.pt.abs();
              s += ' &times; exp(';
              s += d.pt.arg() * 180 / Math.PI;
              s += '&deg; <tspan class="math imag">i</tspan>)';
              s += '</tspan>';
              return  s;
            });
  }

  function setFunction(i) {
    func = functions[i];
    start = func.start.copy();
    factor = func.factor.copy();

    $('#funcDescrip').text('\\[' + getFuncDescrip(func) + '\\]');
    updateTex();

    var ctrlPts = [
      {
        pt: start,
        name: 'z<tspan baseline-shift="sub" font-size="8pt">0</tspan>'
      },
      {
        pt: factor,
        name: 'a'
      }
    ];
    ctrlPts.forEach(function(curr) {
      curr.dragging = false;
    });

    var colorScale = d3.scale.category10()
            .domain(d3.range(2));
    var sizeScale = d3.scale.ordinal()
            .domain(d3.range(2))
            .range([4, 6]);
    graph.selectAll('.control-point')
            .data(ctrlPts)
            .enter()
            .append('circle')
            .attr('class', 'control-point')
            .attr('r', function(d, i) {
              return sizeScale(i);
            })
            .attr('fill', function(d, i) {
              return colorScale(i);
            })
            .attr('stroke-width', 0)
            .attr('opacity', 0.9)
            .on('mouseenter', function(d, i) {
              if (!d.dragging)
                d3.select(this).transition().duration(100)
                        .attr('r', sizeScale(i) * 1.5)
                        .attr('stroke', '#444')
                        .attr('stroke-width', 1)
                        .attr('opacity', 0.6);
            })
            .on('mouseleave', function(d, i) {
              if (!d.dragging)
                d3.select(this).transition().duration(100)
                        .attr('r', sizeScale(i))
                        .attr('stroke-width', 0)
                        .attr('opacity', 0.9);
            })
            .call(d3.behavior.drag()
                    .origin(function(d) {
                      return { 'x': xScale(d.pt.re()), 'y': yScale(d.pt.im()) };
                    })
                    .on('drag', function(d) {
                      d.pt.re(dragXScale.invert(d3.event.x));
                      d.pt.im(dragYScale.invert(d3.event.y));
                      calcData();
                      drawData();
                    })
                    .on('dragstart', function(d) {
                      d.dragging = true;
                    })
                    .on('dragend', function(d) {
                      d.dragging = false;
                    }));

    svg.select('.control-point-displays')
            .selectAll('.control-point-display')
            .data(ctrlPts)
            .enter()
            .append('text')
            .attr('class', 'control-point-display')
            .attr('x', 0)
            .attr('y', function(d, i) {
              return (i * 3.8) + 'em';
            })
            .attr('fill', function(d, i) {
              return colorScale(i);
            });

    calcData();
    drawData();
  }

  // TODO: find better place for displays, on think screens can overlap graph too much
  svg.append('g')
          .attr('class', 'control-point-displays')
          .attr('transform', 'translate(4, 14)');

  setFunction(0);

  $('#graph .imag-axis .tick text').html(function(index, old) {
    function sp(t) {
      return '<tspan>' + t + '</tspan>';
    }
    var i = '<tspan class="math imag">i</tspan>';
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
