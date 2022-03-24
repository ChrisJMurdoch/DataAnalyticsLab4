
const salaryDataUrl = "https://raw.githubusercontent.com/ChrisJMurdoch/DataAnalyticsLab4/main/data/salary_data.csv";
const invalidChars = /\.| |&|'/gm;
let companyMap;

d3.csv(salaryDataUrl).then(function(data) {
    


    // ===== ENRICH DATA =====

    // Filter invalid entries
    const unfilteredLength = data.length;
    data = Enricher.filter(data);
    console.log(`Filtered data.  ${data.length} entries (${(100*data.length/unfilteredLength).toFixed(0)}%) remaining.`);

    // Index records by company name
    companyMap = Enricher.indexByCompany(data);

    // Create list of companies (can be sorted)
    let companyList = [];
    companyMap.forEach(entry => companyList.push(entry));
    companyList = companyList.filter((company) => company.salaries.length>50 && company.meanMaleCompensation && company.meanFemaleCompensation);

    // Create sorted lists
    const nEntriesSorted = companyList.sort((a, b) => b.salaries.length - a.salaries.length);



    // ===== LEFT COMPANY BAR =====

    console.log(nEntriesSorted);

    // Define how to uniquely identify elements
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
        .text((data) => data.name)
        .on("click", (event, data) => displayCompanyInsights(data.name));
    top.append("div")
        .classed("salary", true)
        .text((data) => data.meanCompensation.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }))
        .on("mouseover", (event, data) => d3.select(`#${toSalId(data)}`).classed("active", true) )
        .on("mouseout", (event, data) => d3.select(`#${toSalId(data)}`).classed("active", false) );
    const grad = d3.scaleLinear().domain([60,85,100]).range(["red", "Gold", "green"]);
    top.append("div")
        .classed("equality", true)
        .text((data) => data.equalityScore)
        .on("mouseover", (event, data) => d3.select(`#${toEqId(data)}`).classed("active", true) )
        .on("mouseout", (event, data) => d3.select(`#${toEqId(data)}`).classed("active", false) )
        .style("color", (data) => grad(data.equalityScore));

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



    // ===== RIGHT INSIGHT BAR =====

    jobPie = new PieChart("job_pie");
    educationPie = new PieChart("education_pie");
    yoeBar = new BarChart("yoe_bar");

    displayCompanyInsights("Amazon");
});

function displayCompanyInsights(companyName) {
    
    // Change text
    d3.select(`#insight_logo`).attr("src", `https://www.${companyName.replaceAll(invalidChars, "")}.com/favicon.ico`);
    d3.select("#insight_title").text(companyName);
    d3.select("#insight_count").text(`${companyMap.get(companyName).salaries.length} Reported Salaries`);
    d3.select("#insight_header").text(`Roles at ${companyName}`);

    // Count job types in list
    const jobTypes = new Map();
    companyMap.get(companyName).salaries.forEach((salary) => {
        if (!jobTypes.has(salary.title))
            jobTypes.set(salary.title, 0);
        jobTypes.set(salary.title, jobTypes.get(salary.title)+1);
    });
    let jobTypesList = [];
    for (let type of jobTypes)
        jobTypesList.push(type);
    jobTypesList = jobTypesList.sort( (a,b) => b[1] - a[1] );

    // Job Pie
    jobPie.update(jobTypesList.slice(0, 8), "#005270");
    updateJobList(jobTypesList);

    // Breakdown Pies
    educationPie.update(countOccurrences(
        companyMap.get(companyName).salaries,
        (salary) => salary.Education,
    ), "green");

    // Breakdown Bars
    yoeBar.update(countOccurrences(
        companyMap.get(companyName).salaries,
        (salary) => salary.yearsofexperience,
        (a,b) => a[0] - b[0]
    ), "red");
}

function countOccurrences(data, getLabel, sort) {

    // Count occurrences of labels
    const occurrences = new Map();
    data.forEach(element => {
        const label = getLabel(element);
        if (!occurrences.has(label))
            occurrences.set(label, 0);
        occurrences.set(label, occurrences.get(label)+1);
    });

    // Remove NAs
    occurrences.delete("NA");
    occurrences.delete("N/A");

    // Convert to list
    let occurrencesList = [];
    for (let occurrence of occurrences)
        occurrencesList.push([occurrence[0]+"", occurrence[1]]);
    return occurrencesList.sort( sort || ((a,b) => b[1] - a[1]) );
}

function average(data, getLabel, getValue) {

    // Sum up element values
    const values = new Map();
    data.forEach(element => {
        const label = getLabel(element);
        if (!values.has(label))
            values.set(label, {n:0, t:0});
        values.get(label).n++;
        values.get(label).t+=getValue(element);
    });

    // Remove NAs
    values.delete("NA");

    // Find averages
    let valuesList = [];
    for (let element of values)
        valuesList.push([element[0]+"", Math.floor(element[1].t / element[1].n)]);
    return valuesList.sort((a,b) => b[1] - a[1]);
}
