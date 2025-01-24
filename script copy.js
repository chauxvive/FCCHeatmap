const svgWidth = 1500;
const svgHeight = 600;
const margin = { top: 70, right: 50, bottom: 100, left: 100 };

// Set up the width and height for the heatmap's content area (excluding margins)
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const colors = ['#d73027','#f46d43','#fdae61','#fee090','#ffffbf','#e0f3f8','#abd9e9','#74add1','#4575b4']
const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "septempber", "october", "november", "december"];

// Create SVG container
const svg = d3.select("#chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("#tooltip");

// Fetch the data
fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
    .then(response => response.json())
    .then(data => {
        const baseTemperature = data.baseTemperature;
        const monthlyData = data.monthlyVariance;

        // Create scales
        const years = Array.from(new Set(monthlyData.map(d => d.year))); // Extract unique years
        const months = Array.from(new Set(monthlyData.map(d => d.month - 1))); // Extract unique months (0-indexed)

        const xScale = d3.scaleBand()
            .domain(years)  
            .range([0, width])
            .padding(0);

        const yScale = d3.scaleBand()
            .domain(d3.range(0,12))  
            .range([0, height])
            .padding(0.05);

        // Color scale based on temperature
        const colorScale = d3.scaleQuantize()
            .domain([
                d3.min(monthlyData, d => baseTemperature + d.variance),
                d3.max(monthlyData, d => baseTemperature + d.variance)
            ])
            .range(colors.reverse());

        // Add the heatmap cells
        chart.selectAll(".cell")
            .data(monthlyData)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("x", d => xScale(d.year))  // Use year for x position
            .attr("y", d => yScale(d.month - 1))  // Use month for y position
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(baseTemperature + d.variance))  // Calculate the temperature here
            .attr("data-month", d => d.month - 1)
            .attr("data-year", d => d.year)
            .attr("data-temp", d => baseTemperature + d.variance)
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip
                    .attr("data-year", d.year)
                    .html(
                        `${d.year} - ${d.month} <br> Temp: ${(baseTemperature + d.variance).toFixed(2)} °C`
                    )
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 28}px`);
            })
            .on("mouseout", () => {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        // Add the x-axis (years) with 10-year interval
        const xAxis = d3.axisBottom(xScale)
            .ticks(Math.floor(years.length / 10)) // Calculate the number of ticks, 1 tick every 10 years
            .tickFormat(d => (d % 10 === 0 ? d : ""))  // Show labels only for multiples of 10 years

            
        chart.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(xAxis)
            .attr("id", "x-axis")

        // Add the y-axis (months)
        const yAxis = d3.axisLeft(yScale)
            .tickValues(yScale.domain())
            .tickFormat(d => {
                return monthNames[d];
            });

        chart.append("g")
            .call(yAxis)
            .attr("id", "y-axis");

        // Add title
        svg.append("text")
            .attr("x", svgWidth / 2)
            .attr("y", margin.top / 2)
            .attr("id", "title")
            .style("font-size", "24px")
            .text("Global Temperature Heatmap");

        // Add x-axis label
        chart.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .style("font-size", "16px")
            .text("Year");

        // Add y-axis label
        chart.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 50)
            .attr("x", -height / 2)
            .style("font-size", "16px")
            .text("Month");

        // Add y-axis label
        chart.append("text")
            .attr("id", "description")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth / 2)
            .attr("y", height + 70)
            .style("font-size", "16px")
            .text("Base temp is 8.4");
    })


    .catch(error => console.error("Error fetching the data:", error));
