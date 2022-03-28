
function updateJobList(data, jobSelect) {

    const joblist = d3.select(`#joblist`);

    // Set dimensions
    const width = joblist.node().getBoundingClientRect().width
    joblist.style("height", `${width / 2.5}px`);

    // Remove existing jobs
    joblist.selectAll(".job_entry")
        .remove();
    
    // Append new jobs
    joblist.selectAll(".job_entry")
        .data(data)
        .enter()
        .append("div")
        .text(data => `${data[0]} (${data[1]})`)
        .classed("job_entry", true)
        .on("click", (event, data) => displayRole(data[0]));
}
