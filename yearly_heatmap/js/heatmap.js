    var margin = {top: 20, right: 30, bottom: 20, left: 20};
    width = 700 - margin.left - margin.right;
    height = 600 - margin.top - margin.bottom;

    var format = d3.timeFormat("%Y-%m-%d"),
        dayFormat = d3.timeFormat('%j'),
        formatParse = d3.timeParse("%Y-%m-%d"); 

    var colorScale = d3.scaleThreshold();

    var years = d3.range(2012, 2017),
        sizeByYear = height/years.length+1,
        sizeByDay = d3.min([sizeByYear/8,width/54]),
        sizeByMonth = width/12.5,
        day = function(d) { return (d.getDay() + 6) % 7; },
        week = d3.timeFormat('%W'),
        date = d3.timeFormat('%b %d');

    var svg = d3.select("#heatmap")
        .append('svg')
        .attr("class",'chart')
        .attr('width',width + margin.left + margin.right)
        .attr('height',height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var legend = d3.legendColor()
                 .labelFormat(d3.format(".0f"))
                 .labels(d3.legendHelpers.thresholdLabels)
                 .titleWidth(200);

	var legendSVG = d3.select("#legend")
	                  .append("svg")
	                  .attr("width",200)
	                  .attr("height",200);


	legendSVG.append("g")
	         .attr("class", "legend")
	         .attr("transform", "translate(0,30)");

    var year = svg.selectAll('.year')
        .data(years)
        .enter().append('g')
            .attr('class', 'year')
            .attr('transform', function(d,i) { return 'translate(30,' + i * sizeByYear + ')'; });


    year.append('text')
        .attr('class','year-title')
        .attr('transform','translate(-35,' + sizeByDay * 3.5 + ')rotate(-90)')
        .style('text-anchor','middle')
        .style('font-weight','bold')
        .text(function(d) { return d; });
    
    var rect = year.selectAll('.day')
        .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
        .enter().append('rect')
        .attr("class","day")
        .attr("width",sizeByDay)
        .attr("height",sizeByDay)
        .attr("rx",2)
        .attr("ry",2)
        .attr("x",function(d) { return week(d) * sizeByDay; })
        .attr("y",function(d) { return day(d) * sizeByDay; })
        .datum(format);

    year.selectAll('.month')
        .data(function (d) { 
            return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); 
        })
        .enter().append('path')
        .attr("class","month")
        .attr("d",monthPath);


    var weekDays = ['Mon', 'Wed', 'Fri','Sun'],
        month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];


	var titlesDays = d3.selectAll('.year')
	                .selectAll('.titles-day')
	                .data(weekDays)
	                .enter().append('g')
	                .attr('class', 'titles-day')
	                .attr('transform', function (d, i) {
	                    return 'translate(-15,' + (sizeByDay*(i+0.4)*2) + ')';
	                });

    titlesDays.append('text')
        .attr('class', function (d,i) { return weekDays[i]; })
        .style('text-anchor', 'middle')
        .text(function (d, i) { return weekDays[i]; });

	var titlesMonth = svg.selectAll(".year")
		.selectAll('.titles-month')
	  	.data(month)
	  .enter().append("text")
	    .text((d) => d)
	    .attr("x", (d, i) => i * (sizeByMonth))
	    .attr("y", 0)
	    .style("text-anchor", "middle")
	    .attr("transform", function(d,i){
	    	var year = d3.select(this.parentNode).datum();
	    	if (year == 2012){
	    		return"translate(" + sizeByMonth/1.2 + ", -7)";
	    	} else  if (year == 2013 || year == 2014){
	    		if (i !=0 && i!=11){
	    			return"translate(" + sizeByMonth/1.5 + ", -7)";
	    		}
	    	} else if (year == 2015){
	    		if (i!=7 && i!=8 && i!=9 && i!=10 && i!=11){
	    			return"translate(" + sizeByMonth/1.5 + ", -7)";	    			
	    		} else {
	    			return"translate(" + sizeByMonth/1.3 + ", -7)";	    			    			
	    		}
	    	} else if (year == 2016){
	    		if (i==2 || i==5 || i==7 || i==8 || i==9 || i==10 || i==11){
	    			return"translate(" + sizeByMonth/1.2 + ", -7)";	    			
	    		} else {
	    			return"translate(" + sizeByMonth/1.4 + ", -7)";	    			    			
	    		}	    		
	    	} 
	    	
	    	return"translate(" + sizeByMonth/1.4 + ", -7)";	    			    			
	    	
	    });


	var tooltipDiv = d3.select("body")
	            .append("div")
	            .attr("class", "tooltip")
	            .style("display", "none");


	var heatmapChart = function(dataset){
		d3.csv(dataset, function(error, csv) {
			if (error) throw error;


			var colors,legendTitle;

			csv.forEach(function(d) {
				d.count= +d.count;
			});

			var data = d3.nest()
			.key(function(d) { return d.date; })
			.rollup(function(d) { return d[0].count; })
			.map(csv);



			if (dataset=="data/trip.csv"){
				colors = colorbrewer.YlGnBu[5];
				legendTitle = "Trips Per Day";
				colorScale.domain([100,500,1000,4000]).range(colors);
			} else {
				colors = colorbrewer.YlOrRd[5];
				legendTitle = "Vehicles Per Day";
				colorScale.domain([100,250,500,1000]).range(colors);
			}


			var rectFiltered = rect.filter(function(d) {return data.has(d); });
			
			 rectFiltered.transition()
			  .delay(function(d){   
			  	return (dayFormat(formatParse(d))*2);
			  })
			  .duration(500)
			  .style("fill", function(d) {return colorScale(data.get(d)); });

			 rectFiltered
		 	.on("mouseover",function(d){

	            d3.select(this).attr("opacity",0.6);

	            tooltipDiv.transition()
	               .duration(200)
	               .style("display", null);
	            tooltipDiv.html("<p>" + d + ": " + data.get(d) + "</p>")
	               .style("left", (d3.event.pageX+10 ) + "px")
	               .style("top", (d3.event.pageY-20) + "px");
			  })
			.on("mouseout",function(){
	            d3.select(this).attr("opacity",1);

				tooltipDiv.transition()
		               .duration(500)
		               .style("display", "none");
			});


		    legend
		    .title(legendTitle)
		    .scale(colorScale);

		    d3.select(".legend")
		    .call(legend);

		    d3.selectAll(".legend rect")
		      .style("fill",function(d,i){return colorScale.range()[i];});


		});

	};


	heatmapChart(datasets[0]);


    function monthPath(t0) {
        var t1 = new Date(t0.getFullYear(), 
            t0.getMonth() + 1, 0),
            d0 = +day(t0), w0 = +week(t0),
            d1 = +day(t1), w1 = +week(t1);

        return 'M' + (w0 + 1) * sizeByDay + ',' + d0 * sizeByDay + 'H' + w0 * sizeByDay + 'V' + 7 * sizeByDay + 'H' + w1 * sizeByDay + 'V' + (d1 + 1) * sizeByDay + 'H' + (w1 + 1) * sizeByDay + 'V' + 0 + 'H' + (w0 + 1) * sizeByDay + 'Z';
    }