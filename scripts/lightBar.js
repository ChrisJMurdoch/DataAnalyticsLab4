
function addSalaryBar(data, toSalId) {

    const div = d3.select(`#${toSalId(data)}`);
    const width = div.node().getBoundingClientRect().width,
          height = 32
          barHeight = 4;
    
    const svg = div.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    const baseFraction = data.meanBase/data.meanCompensation,
          bonusFraction = data.meanBonus/data.meanCompensation,
          stockFraction = data.meanStock/data.meanCompensation;
    
    svg.append("rect")
        .attr("x", width * (0))
        .attr("width", width * baseFraction)
        .attr("height", barHeight)
        .attr("fill", "#007CC7");
    
    svg.append("rect")
        .attr("x", width * (baseFraction))
        .attr("width", width * bonusFraction)
        .attr("height", barHeight)
        .attr("fill", "#4DA8DA");
    
    svg.append("rect")
        .attr("x", width * (baseFraction+bonusFraction))
        .attr("width", width * stockFraction)
        .attr("height", barHeight)
        .attr("fill", "#EEFBFB");
    
    svg.append("text")
        .attr("x", 10)
        .attr("y", barHeight+20)
        .attr("text-anchor", "start")
        .text(`${(baseFraction*100).toFixed(0)}% Salary`)
        .attr("fill", "#007CC7");
    
    svg.append("text")
        .attr("x", width * Math.min(baseFraction+bonusFraction*0.5, 0.625))
        .attr("y", barHeight+20)
        .attr("text-anchor", "middle")
        .text(`${(bonusFraction*100).toFixed(0)}% Bonus`)
        .attr("fill", "#4DA8DA");

    svg.append("text")
        .attr("x", width)
        .attr("y", barHeight+20)
        .attr("text-anchor", "end")
        .text(`${(stockFraction*100).toFixed(0)}% Stocks`)
        .attr("fill", "#EEFBFB");
}

function addEqualityBar(data, toEqId) {

    const div = d3.select(`#${toEqId(data)}`);
    const width = div.node().getBoundingClientRect().width,
          height = 40
          barHeight = 4;
    
    const svg = div.append("svg")
        .attr("width", width)
        .attr("height", height);
    
    const maleFraction   = data.meanMaleCompensation   / data.meanCompensation,
          femaleFraction = data.meanFemaleCompensation / data.meanCompensation;
    const maleBarRatio   = 2 * maleFraction   / (maleFraction+femaleFraction),
          femaleBarRatio = 2 * femaleFraction / (maleFraction+femaleFraction);
    
    svg.append("rect")
        .attr("x", width * (0))
        .attr("width", width * 0.5*maleBarRatio)
        .attr("height", barHeight)
        .attr("fill", "#007CC7");
    
    svg.append("rect")
        .attr("x", width * 0.5*maleBarRatio)
        .attr("width", width * 0.5*femaleBarRatio)
        .attr("height", barHeight)
        .attr("fill", "#9e42ff");
    
    svg.append("text")
        .attr("x", 10)
        .attr("y", barHeight+20)
        .attr("text-anchor", "start")
        .text(`Male Salary: ${(maleFraction*100).toFixed(0)}%`)
        .attr("fill", "#EEFBFB");
    svg.append("text")
        .attr("x", 10)
        .attr("y", barHeight+36)
        .attr("text-anchor", "start")
        .text(`of Mean`)
        .attr("fill", "#EEFBFB");
    
    svg.append("text")
        .attr("x", width)
        .attr("y", barHeight+20)
        .attr("text-anchor", "end")
        .text(`Female Salary: ${(femaleFraction*100).toFixed(0)}%`)
        .attr("fill", "#EEFBFB");
    svg.append("text")
        .attr("x", width)
        .attr("y", barHeight+36)
        .attr("text-anchor", "end")
        .text(`of Mean`)
        .attr("fill", "#EEFBFB");
    
    svg.append("rect")
        .attr("x", width * 0.5 - 0.375)
        .attr("width", 1.5)
        .attr("height", barHeight*3)
        .attr("fill", "#EEFBFB");
}
