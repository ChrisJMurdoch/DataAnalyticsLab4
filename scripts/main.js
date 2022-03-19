
const salaryDataUrl = "https://raw.githubusercontent.com/ChrisJMurdoch/DataAnalyticsLab4/main/data/salary_data.csv";

d3.csv(salaryDataUrl).then(function(data) {
    


    // ===== ENRICH DATA =====

    // Filter invalid entries
    const unfilteredLength = data.length;
    data = Enricher.filter(data);
    console.log(`Filtered data.  ${data.length} entries (${(100*data.length/unfilteredLength).toFixed(0)}%) remaining.`);

    // Index records by company name
    const companyMap = Enricher.indexByCompany(data);

    // Create list of companies (can be sorted)
    let companyList = [];
    companyMap.forEach(entry => companyList.push(entry));
    companyList = companyList.filter((company) => company.salaries.length>20);

    // Create sorted lists
    const nEntriesSorted = companyList.sort((a, b) => b.salaries.length - a.salaries.length);



    // ===== DISPLAY DATA =====

    console.log(nEntriesSorted);

    // Define how to uniquely identify elements
    const invalidChars = /\.| |&|'/gm;
    const toSalId = (data) => `salary_expand_${data.name.replaceAll(invalidChars, "")}`;
    const toEqId  = (data) => `equality_expand_${data.name.replaceAll(invalidChars, "")}`;

    // Add entries to company bar
    const companyCards = d3.select("#company_bar")
        .selectAll("_")
        .data(nEntriesSorted)
        .enter()
        .append("div")
        .classed("company_card", true);
    
    // Top section of card
    const top = companyCards.append("div")
        .classed("top", true);
    top.append("img")
        .classed("logo", true)
        .attr("src", (data) => `https://www.${data.name.replaceAll(invalidChars, "")}.com/favicon.ico`)
        .attr("onerror", "this.style.opacity=0");
    top.append("div")
        .classed("title", true)
        .text((data) => data.name);
    top.append("div")
        .classed("salary", true)
        .text((data) => data.meanCompensation.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }))
        .on("mouseover", (event, data) => d3.select(`#${toSalId(data)}`).classed("active", true) )
        .on("mouseout", (event, data) => d3.select(`#${toSalId(data)}`).classed("active", false) );
    top.append("div")
        .classed("equality", true)
        .text((data) => data.equalityScore)
        .on("mouseover", (event, data) => d3.select(`#${toEqId(data)}`).classed("active", true) )
        .on("mouseout", (event, data) => d3.select(`#${toEqId(data)}`).classed("active", false) );

    // Expandable sections of card
    const salary_expand = companyCards.append("div")
        .classed("expand", true)
        .attr("id", toSalId);
    const equality_expand = companyCards.append("div")
        .classed("expand", true)
        .attr("id", toEqId);

    // Add bars
    salary_expand.each( (data) => addSalaryBar(data, toSalId) );
    equality_expand.each( (data) => addEqualityBar(data, toEqId) );
});
