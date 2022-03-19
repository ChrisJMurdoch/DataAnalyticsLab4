
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
    const companyList = [];
    companyMap.forEach(entry => companyList.push(entry));

    // Create sorted lists
    const nEntriesSorted = companyList.sort((a, b) => b.salaries.length - a.salaries.length);



    // ===== DISPLAY DATA =====

    console.log(nEntriesSorted);

    // Add entries to company bar
    const companyCards = d3.select("#company_bar")
        .selectAll("_")
        .data(nEntriesSorted)
        .enter()
        .append("div")
        .classed("company_card", true);
    companyCards.append("img")
        .classed("logo", true)
        .attr("src", (data) => `https://www.${data.name.replaceAll(" ", "")}.com/favicon.ico`)
        .attr("onerror", "this.style.opacity=0");
    companyCards.append("div")
        .classed("title", true)
        .text((data) => data.name);
    companyCards.append("div")
        .classed("salary", true)
        .text((data) => data.meanCompensation.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }));
    companyCards.append("div")
        .classed("equality", true)
        .text((data) => data.equalityScore);
});
