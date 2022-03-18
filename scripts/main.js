
const salaryDataUrl = "https://raw.githubusercontent.com/ChrisJMurdoch/DataAnalyticsLab4/main/data/salary_data.csv";

d3.csv(salaryDataUrl).then(function(salaryData) {

    console.log(salaryData);

});
