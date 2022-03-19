
class Enricher {

    /**
     * Filters out the invalid data based on set criteria
     * @param data Input data
     * @returns Filtered data
     */
    static filter(data) {

        // ===== SPECIFY FILTER CRITERIA =====

        // Expected salary range
        const expectedSalaryRange = (base, bonus, stock, total) => total>0 && total===base+bonus+stock;

        // NOTE: This isn't to constrain other identities - it's to remove the data entry where the gender is 'Software Engineer'
        const expectedGender = (gender) => gender==="Male" || gender==="Female" || gender==="Other";

        // Specify properties that should be numbers
        const numericalProperties = ["basesalary", "bonus", "stockgrantvalue", "totalyearlycompensation", "yearsatcompany", "yearsofexperience"];



        // ===== FILTER INVALID DATA =====

        // Filter data
        return data.filter(function(record) {

            // Parse numerical properties and ensure valid numbers
            numericalProperties.forEach((property) => {
                record[property] = parseInt(record[property]);
                if (isNaN(record[property]))
                    return false;
            });

            return expectedSalaryRange(record.basesalary, record.bonus, record.stockgrantvalue, record.totalyearlycompensation) && expectedGender(record.gender);
        });
    }

    /**
     * Maps records by company name then computes aggregate data such as mean pay for each company
     * @param data Input data
     * @returns Map of record lists, indexed by company name
     */
    static indexByCompany(data) {

        // Map each record to respective company
        const companies = new Map();
        data.forEach(function(record) {
            
            // Add new list
            if (!companies.has(record.company))
                companies.set(record.company, {name: record.company, salaries: []});

            // Append record to list
            companies.get(record.company).salaries.push(record);
        });

        // Compute aggregate data
        companies.forEach(function(company) {

            // Sum per-gender sums
            let nSalary=0, nMaleSalary=0, nFemaleSalary=0, nOtherSalary=0,
                tSalary=0, tMaleSalary=0, tFemaleSalary=0, tOtherSalary=0,
                tDuration=0, tExperience=0;
            company.salaries.forEach(function(salary) {
                nSalary++, tSalary += salary.totalyearlycompensation;
                if      (salary.gender=="Male")   nMaleSalary++,   tMaleSalary   += salary.totalyearlycompensation;
                else if (salary.gender=="Female") nFemaleSalary++, tFemaleSalary += salary.totalyearlycompensation;
                else if (salary.gender=="Other")  nOtherSalary++,  tOtherSalary  += salary.totalyearlycompensation;
                tDuration += salary.yearsatcompany;
                tExperience += salary.yearsofexperience;
            });

            // Calculate averages
            company.meanCompensation       = Math.round( tSalary       / nSalary       );
            company.meanMaleCompensation   = Math.round( tMaleSalary   / nMaleSalary   );
            company.meanFemaleCompensation = Math.round( tFemaleSalary / nFemaleSalary );
            company.meanOtherCompensation  = Math.round( tOtherSalary  / nOtherSalary  );
            company.meanJobDuration = tDuration / nSalary;
            company.meanJobExperience = tExperience / nSalary;

            // Calculate scores
            company.equalityScore = Math.round( 100 * Math.min(
                company.meanMaleCompensation / company.meanFemaleCompensation,
                company.meanFemaleCompensation / company.meanMaleCompensation
            ) );
        });

        return companies;
    }
}
