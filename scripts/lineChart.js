
class LineChart {

    static dateFormatting = "%m/%Y";
    static aspectRatio = 2.5;
    static padding = {top: 60, bottom: 33, sides: 80};
    static transitionDuration = 1200;

    /**
     * Create a line graph on the provided SVG element
     * @param identifier String identifier for SVG upon which to draw
     */
    constructor(identifier) {

        // Set ID
        this.identifier = identifier;

        // Set dimensions
        this.outerWidth = d3.select(`#${this.identifier}`).node().getBoundingClientRect().width;
        this.outerHeight = this.outerWidth / LineChart.aspectRatio;
        this.innerWidth = this.outerWidth - LineChart.padding.sides*2;
        this.innerHeight = this.outerHeight - (LineChart.padding.top+LineChart.padding.bottom);

        // Create canvas components
        const svg = d3.select(`#${this.identifier}`)
            .style("height",  this.outerHeight);
        const linechart = svg
            .append("g")
            .attr("id", "linechart")
            .attr("width",  this.innerWidth)
            .attr("height",  this.innerHeight)
            .attr("transform", `translate(${LineChart.padding.sides}, ${LineChart.padding.top})`);

        // Create title component
        svg.append("text")
            .classed("title", true)
            .attr("transform", `translate(${this.outerWidth/2}, ${LineChart.padding.top/2-3})`)
            .style("text-anchor", "middle");
    }

    update(title, data, lines, xExtent, yExtent) {

        // Bind validity-filtered data to each line
        for (let line of lines)
            line.data = data.filter( d => line.getX(d) && line.getY(d) );

        // Get canvas components
        const svg = d3.select(`#${this.identifier}`);
        const linechart = svg.select("#linechart");
        svg.select(".title").text(title);

        // Fade old axes and lines
        svg.selectAll(".axis")
            .classed("axis", false) // So that new fade-in doesn't apply
            .transition()
            .duration(LineChart.transitionDuration)
            .style("opacity", "0")
            .remove();
        linechart.selectAll(".linegroup, .linegroup *")
            .transition()
            .duration(LineChart.transitionDuration)
            .style("opacity", "0")
            .remove();
        
        // Calc extents
        let xMin=null, xMax=null, yMin=null, yMax=null;
        for (let line of lines) {
            for (let record of line.data) {
                const x = line.getX(record),
                      y = line.getY(record);
                xMin = (xMin===null) ? x : Math.min(xMin, x);
                xMax = (xMax===null) ? x : Math.max(xMax, x);
                yMin = (yMin===null) ? y : Math.min(yMin, y);
                yMax = (yMax===null) ? y : Math.max(yMax, y);
            }
        }
        xExtent = (xExtent===null) ? [xMin, xMax] : xExtent;
        yExtent = (yExtent===null) ? [yMin, yMax] : yExtent;

        // Create axes
        const x = d3.scaleTime()
            .domain([ xExtent[0], xExtent[1] ])
            .range([0,  this.innerWidth]);
        const y = d3.scaleLinear()
            .domain([ yExtent[0], yExtent[1] ])
            .range([ this.innerHeight, 0]);
        linechart.append("g")
            .call(d3.axisLeft(y))
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisTop(x).tickFormat(d3.timeFormat(LineChart.dateFormatting)))
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisRight(y))
            .attr("transform", `translate(${ this.innerWidth}, 0)`)
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat(LineChart.dateFormatting)))
            .attr("transform", `translate(0, ${ this.innerHeight})`)
            .classed("axis", true);
        
        // Fade in
        linechart.selectAll(".axis")
            .style("opacity", "0")
            .transition()
            .duration(LineChart.transitionDuration)
            .style("opacity", "1");
        
        // Draw each line
        for (let line of lines) {

            const lineGroup = linechart.append("g").attr("class", "linegroup");

            // Plot line
            const path = lineGroup.append("path")
                .datum(line.data)
                .attr("fill", "none")
                .attr("stroke", line.colour)
                .attr("stroke-width", 1.3)
                .attr("d", d3.line()
                    .x( (d) => x(line.getX(d)) )
                    .y( (d) => y(line.getY(d)) )
                )
                .style("opacity", "0")
                .transition()
                .duration(LineChart.transitionDuration)
                .style("opacity", "1");
            
            // COnversion from datestring to valid id
            const dateToId = (date) => `_${date.toString().replaceAll(/\.| |-|:|\+|\(|\)+/gm, "_")}`;
                

            // Create rectangle hitboxes
            const hitbox = {width: 30, height: 80};
            lineGroup.selectAll("rect")
                .data(line.data)
                .enter()
                .append("rect")
                .classed("datapoint_hitbox", true)
                .attr("x", (d) => x(line.getX(d)) )
                .attr("y", (d) => 0 )
                .attr("width", hitbox.width)
                .attr("height", this.innerHeight)
                .style("fill", "rgba(0,0,0,0)")

                // Add hitbox interaction
                .on("mouseover", function(event, data) {
                    const clzz = dateToId(line.getX(data));
                    d3.selectAll(`.${clzz}`)
                        .style("opacity", 1);
                })
                .on("mouseout", function(event, data) {
                    const clzz = dateToId(line.getX(data));
                    d3.selectAll(`.${clzz}`)
                        .style("opacity", 0);
                });
            
            // Create visible circles
            const dotRadius = 2;
            lineGroup.selectAll("circle")
                .data(line.data)
                .enter()
                .append("circle")
                .attr("class", (d) => dateToId(line.getX(d)))
                .attr("cx", (d) => x(line.getX(d)) )
                .attr("cy", (d) => y(line.getY(d)) )
                .attr("r", dotRadius)
                .style("fill", line.colour)
                .style("opacity", 0)
                .style("pointer-events", "none");

            // Create data labels
            lineGroup.selectAll("text")
                .data(line.data)
                .enter()
                .append("text")
                .text((d) => `${parseFloat(line.getY(d)).toFixed(2)}`)
                .attr("class", (d) => dateToId(line.getX(d)))
                .attr("x", (d) => x(line.getX(d)) )
                .attr("y", (d) => y(line.getY(d)) - (dotRadius+2) )
                .style("opacity", 0)
                .style("text-anchor", "middle")
                .style("pointer-events", "none")
                .style("font-size", "0.75em");
        }
    }
}
