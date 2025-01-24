"use strict";

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
let req = new XMLHttpRequest()

let baseTemp;    
let values = []; 

let xScale;
let yScale;

let minYear;
let maxYear;
let rangeYear = maxYear - minYear;

let width = 1200;
let height = 600;
let padding = 60;

let canvas = d3.select('#canvas')
canvas.attr('width', width)
    .attr('height', height);

const tooltip = d3.select('#tooltip')
    

let generateScales = () => {
    minYear = d3.min(values, (item) => {
        return item.year;
    })
    maxYear = d3.max(values, (item) => {
        return item.year;
    })

    xScale = d3.scaleLinear()
        .domain([minYear, maxYear+1])
        .range([padding, width-padding])

    yScale = d3.scaleTime()
        .domain([new Date(0,0,0,0,0,0,0), new Date(0, 12, 0, 0, 0, 0, 0)])
        .range([padding, height-padding])
};

const drawCells = () => {
    canvas.selectAll('rect')
        .data(values)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('fill', (item) => {
            let variance = item.variance;
            if(variance <= -1){
                return 'SteelBlue';
            } else if (variance <= 0) {
                return 'LightSteelBlue'
            } else if (variance <=1) {
                return 'Orange'
            } else {
                return 'red';
            }
        })
        .attr('data-year', (item) => {
            return item.year;
        })
        .attr('data-month', (item) => {
            return item.month-1;
        })
        .attr('data-temp', (item) => {
            return (item.variance+baseTemp);
        })
        .attr('height', (height - (2*padding))/12)
        .attr('y', (item) => {
            return yScale(new Date(0, item.month-1, 0,0,0,0,0))
        })
        .attr('width', (item) => {
            let rangeYear = maxYear - minYear;
            return (width - (padding*2))/rangeYear; 
        })
        .attr('x', (item) => {
            return xScale(item.year);
        })
        .on('mouseover', (event, d) => {
            const item = event.target;
            tooltip.transition()
                .style('visibility', 'visible');

            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June','July','August','September','October','November','December'
            ];

            //tooltip.text("sandwich");
            //tooltip.text(baseTemp);
            //console.log(d.year);
            tooltip.text(d.year + ' ' + monthNames[d.month-1])
                .attr('data-year', d.year)
            //tooltip.text(item['year']);
            //tooltip.text(item['year'] + ' ' + monthNames[item['month']-1] + ' - ' (baseTemp+ item.variance) + ' (' + item.variance + ')')
        })
        

        .on('mouseout', (item) => {
            tooltip.transition()
                .style('visibility', 'hidden');

        })
    }   

let drawAxes = () => {
    let xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'))

    let yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%B'));

    canvas.append('g')
        .call(xAxis)
        .attr('transform', 'translate(0, ' + (height-padding) +')')
        .attr('id','x-axis')
    canvas.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', 'translate(' + padding + ', 0)')
   
};

req.open('GET', url, true)
req.onload = () => {
        let object = JSON.parse(req.responseText);
        baseTemp = object['baseTemperature'];
        values = object['monthlyVariance'];
        generateScales();
        drawCells();
        drawAxes();
    }
req.send();