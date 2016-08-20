var window_width = $(window).width();
var window_height = $(window).height();
var nav_height = $('#custom_nav').height();

$('#cover').height( window_height - nav_height );
$( window ).resize(function() {
    $('#cover').height( window_height - nav_height );
});


var socket = io.connect('http://localhost:8080');
socket.on('connect', function (data) {
    var firebase = new Firebase('https://hacktheplanet.firebaseio.com/');
    firebase.on("value", function(snapshot) {
      var steps = {};
      steps[snapshot.val().p1] = snapshot.val().s1;
      steps[snapshot.val().p2] = snapshot.val().s2;

      if(!snapshot.val().p1 || !snapshot.val().p2) {
          return
      } else{
          console.log(snapshot.val());
          console.log('sent', sent, 'snapshot', snapshot.val().p2);
          if(sent === false && snapshot.val().p2 > snapshot.val().p1 + 9) {
              sent = true;
              $.getJSON( "http://quandyfactory.com/insult/json", function( data ) {
                      socket.emit('text', data.insult);
              });
          }

          var steps = {};
          steps[snapshot.val().p1] = snapshot.val().s1;
          steps[snapshot.val().p2] = snapshot.val().s2;
          console.log('steps', steps);
      }
      // initial page render
      render(steps);
    });

    $('#start').click(function() {
        sent = false;
        firebase.set(
            {
                p1: 'Player One',
                p2: 'Player Two',
                s1: 0,
                s2: 0
            }
        );
    });

    var sent = false;

    // firebase.on("child_changed", function(snapshot) {
    // });

    var width = $(window).width()/1.5,
    height = (window_height - $('#custom_nav').height())/1.5;

    var margin = {top: 20, right:20, bottom:20, left:50};

    // draw and append the container
    var svg = d3.select("#cover").append("svg")
    .attr("height", height)
    .attr("width", width)
    .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.right + ")");

    var xScale = d3.scale.linear()
    .range([0,width - margin.left - margin.right]);

    var yScale = d3.scale.linear()
    .range([height - margin.top - margin.bottom,0]);

    var line = d3.svg.line().interpolate("monotone")
    .x(function(d){ return xScale(d.x); })
    .y(function(d){ return yScale(d.y); });


    var currentRunningStatus = [];

    function newData(steps) {
        var orderedNames = [];

        Object.keys(steps).forEach(function(key) {
            if(orderedNames.indexOf(key) < 0) {
                orderedNames.push(key);
            }
        });

        while(orderedNames.length > currentRunningStatus.length){
            currentRunningStatus.push([]);
        }

        orderedNames.forEach(function(name, index) {
            currentRunningStatus[index].push(
                {
                    x: currentRunningStatus[index].length - 10,
                    y: steps[name]
                }
            );
        });

        // console.log(steps);
        // if(steps.s1 === 1 || steps.s2 === 1) {
        //     console.log('zeroskjfhasldkfhalskdfjhalskd')
        //     currentRunningStatus = [];
        // }
        if(currentRunningStatus[0].length > 11) {
            currentRunningStatus.forEach(function(status, index) {
                currentRunningStatus[index].shift();
            });

            currentRunningStatus.map(function(personStatus) {
                personStatus.map(function(xyObject) {
                    xyObject.x -= 1;
                });
            });
        };

        return currentRunningStatus
    };

    function render(steps){
        var data = newData(steps);
        console.log(data);

        // obtain absolute min and max
        var yMin = data.reduce(function(pv,cv){
            // var currentMin = cv.reduce(function(pv,cv){
            //     return Math.min(pv,cv.y);
            // },100)
            // return Math.min(pv,currentMin);
            return 0;
        },100);
        var yMax = data.reduce(function(pv,cv){
            var currentMax = cv.reduce(function(pv,cv){
                return Math.max(pv,cv.y);
            },0)
            return Math.max(pv,currentMax);
        },0);

        // set domain for axis
        yScale.domain([yMin,yMax]);
        xScale.domain([-10,0]);

        // create axis scale
        var yAxis = d3.svg.axis()
        .scale(yScale).orient("left");

        var xAxis = d3.svg.axis()
        .scale(xScale).orient("top").ticks(10);

        // if no axis exists, create one, otherwise update it
        if (svg.selectAll(".y.axis")[0].length < 1 ){
            svg.append("g")
            .attr("class","y axis")
            .call(yAxis);
        } else {
            svg.selectAll(".y.axis").transition().duration(1500).call(yAxis);
        }

        // if no axis exists, create one, otherwise update it
        if (svg.selectAll(".x.axis")[0].length < 1 ){
            svg.append("g")
            .attr("class","x axis")
            .call(xAxis);
        } else {
            svg.selectAll(".x.axis").transition().duration(1500).call(xAxis);
        }

        d3.selection.prototype.first = function() {
          return d3.select(this[0][0]);
        };
        d3.selection.prototype.last = function() {
          var last = this.size() - 1;
          return d3.select(this[0][last]);
        };

        // generate line paths
        var lines = svg.selectAll(".line").data(data).attr("class","line");
        lines.first().attr('stroke', '#34495e');
        lines.last().attr('stroke', '#c0392b');

        // transition from previous paths to new paths
        lines.transition().duration(1500)
        .attr("d",line);

        // enter any new data
        lines.enter()
        .append("path")
        .attr("class","line")
        .attr("d",line);

        // exit
        lines.exit()
        .remove();
    }
});
