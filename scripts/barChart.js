
class BarChart {
    
    static aspectRatio = 2;

    constructor(identifier) {
            
        // Set the dimensions and margins of the graph
        this.margin = { top: 30, right: 100, bottom: 30, left: 100 };
        this.width = d3.select(`#${identifier}`).node().getBoundingClientRect().width - this.margin.left - this.margin.right;
        this.height = (this.width / BarChart.aspectRatio) - this.margin.top - this.margin.bottom;

        // Create SVG
        this.identifier = identifier;
        this.svg = d3.select(`#${identifier}`)
            .attr("width", this.width+this.margin.left+this.margin.right)
            .attr("height", this.height+this.margin.top+this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    }

    // Update the graph with given data
    update(data) {

        // Convert to percentages
        let totalVal = 0;
        data.forEach(element => totalVal += element[1]);
        data.forEach(element => (element[1] /= totalVal));

        // Fade out previous axes
        this.svg.selectAll(".axis")
            .transition()
            .duration(1000)
            .style("opacity", "0")
            .remove();

        // X axis
        const x = d3.scaleBand()
            .range([0, this.width])
            .domain(data.map((d) => d[0]))
            .padding(0.5);
        /*this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, 0)`)
            .call(d3.axisTop(x));*/
        this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${this.height})`)
            .call(d3.axisBottom(x));
        
        // Display every second
        this.svg.selectAll(".tick text")
            .style("display", (d, i) => (i % 2) ? "none" : "initial" );

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([0, d3.max(data, (d)=>d[1] )])
            .range([this.height, 0]);
        this.svg.append("g")
            .attr("class", "axis")
            .call(
                d3.axisLeft(y)
                    .ticks(5)
                    .tickFormat(d3.format(".0%"))
            );
        /*this.svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${this.width}, 0)`)
            .call(d3.axisRight(y));*/

        // Bind new data to rects
        const u = this.svg.selectAll("rect")
            .data(data);

        // Remove extra bars
        u.exit()
            .remove();
        
        // Add and transition new bars
        u.enter()
            .append("rect")
            .attr("x", (d) => x(d[0]))
            .attr("y", (d) => y(d[1]))
            .merge(u)
            .transition()
            .duration(1000)
            .attr("x", (d) => x(d[0]))
            .attr("y", (d) => y(d[1]))
            .attr("width", x.bandwidth())
            .attr("height", (d) => this.height - y(d[1]))
            .attr("fill", "FireBrick");
    }
}
