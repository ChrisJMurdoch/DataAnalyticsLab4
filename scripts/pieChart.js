
class PieChart {

    constructor(identifier) {

        // Dimensions
        const width = d3.select(`#${identifier}`).node().getBoundingClientRect().width,
            height = width / 2.5,
            radius = Math.min(width, height) / 2,
            padding = 1.1;

        // Create SVG
        this.svg = d3.select(`#${identifier}`)
            .style("height", height)
            .append("g")
            .attr("transform", `translate(${width/2},${height/2})`);

        // Create pie without size sorting
        this.pie = d3.pie()
            .sort(null)
            .value(d => d[1]);
            this.arc = d3.arc()
            .innerRadius((radius/padding) * 0.5)
            .outerRadius(radius/padding);

        // Store last data for interpolation
        this.lastData = [];
    }

    // Update pie chart with new data
    update(data, colour) {

        // Colour scheme
        const colourSchemeOld = d3.scaleOrdinal().range(d3.schemeSet3);
        const colourScheme = d3.scaleLinear().domain([0, (data.length-1)*1.2]).range([colour || "steelblue", "white"]);

        // Pad data with 0 values for each missing segment
        let padding = data.length - this.lastData.length;
        for (let i=0; i<padding; i++)
        this.lastData.push(["", 0]);
        for (let i=0; i<-padding; i++)
            data.push(["", 0]);

        // Create pie data
        const pieData = this.pie(this.pie(data));
        this.pieLastData = this.pie(this.lastData);

        // Bind data to path
        const boundPath = this.svg.selectAll("path").data(this.pie(data));
        const boundText = this.svg.selectAll("text").data(this.pie(data));
        
        // Enter new segments and apply transition
        const paths = boundPath.enter()
            .append("path")
            .merge(boundPath)
            .attr("fill", (d, i) => colourScheme(i))
            .attr("d", this.arc)
            .on("mouseover", (event, data) => {
                this.svg.select(`#_${data.data[0].replaceAll(invalidChars, "_")}`)
                    .style("opacity", 1);
            })
            .on("mouseout", (event, data) => {
                this.svg.select(`#_${data.data[0].replaceAll(invalidChars, "_")}`)
                    .style("opacity", 0);
            })
            .classed("pie_segment", true);
        paths.transition()
            .duration(1000)
            .attrTween("d", (d, i) => {

                const last = this.pieLastData[i];
                const interpolateS = d3.interpolate(last.startAngle, d.startAngle);
                const interpolateE = d3.interpolate(last.endAngle, d.endAngle);

                return (t) => {
                    d.startAngle = interpolateS(t);
                    d.endAngle = interpolateE(t);
                    return this.arc(d);
                }
            });
        boundText.enter()
            .append("text")
            .merge(boundText)
            .style("fill", "black")
            .text((d) => `${d.data[0]} (${d.data[1]})`)
            .attr("transform", (d) => `translate(${this.arc.centroid(d)})`)
            .style("text-anchor", "middle")
            .attr("id", (d) => `_${d.data[0].replaceAll(invalidChars, "_")}`)
            .style("opacity", 0)
            .style("pointer-events", "none")
            .style("filter", "drop-shadow(0 0 8px rgba(255,255,255,1))");
        
        // Save current data for next interpolation
        this.lastData = data;
    }
}
