const GroupType = require('../../enums').GroupType;
const SalaryRuleType = require('../../enums').SalaryRuleType;

let findSalaryRule = ( rules, group, instructorId ) => {
    const filteredRules = rules.filter(x => x.forGroupType == group.type);
    return filteredRules.find( x => x.group == group.id && x.instructor == instructorId  )
        || filteredRules.find( x => x.group == null && x.instructor == instructorId )
        || filteredRules.find( x => x.group == null && x.instructor == null );
}

// Делает подсчет зарплаты тренеров
module.exports.calculateSalaries = async function(dateRange, providerId){
    const start = dateRange.start;
    const end = dateRange.end;

    let salaryRules = await SalaryRules.find();

    let events = await Events
        .find({startsAt: { ">=": start.valueOf(), "<=": end.valueOf() }, provider: providerId})
        .sort("startsAt ASC")
        .populate("payments")
        .populate("group")
        .populate("instructor");
    let eventsWithPayments = events.filter(x => x.payments && x.payments.length > 0);
    
    let eventsGroupedByInstructor = {};
    eventsWithPayments.forEach(event => {
        if ( !eventsGroupedByInstructor[event.instructor.id] ) {
            eventsGroupedByInstructor[event.instructor.id] = [];
        }
        eventsGroupedByInstructor[event.instructor.id].push(event);
    });

    let result = [];
    for(let instructorId of Object.keys(eventsGroupedByInstructor)){
        let instructorEvents = eventsGroupedByInstructor[instructorId];
        let instructor = instructorEvents[0].instructor;
        let salaryInfoForInstructor = {
            instructor: instructor.name,
            types: [],
            totalSum: 0
        };
        
        let eventsByGroup = {};
        instructorEvents.forEach(event => {
            if ( !eventsByGroup[event.group.id] ) {
                eventsByGroup[event.group.id] = [];
            }
            eventsByGroup[event.group.id].push(event);
        });

        let generalSalary = { groupType: GroupType.General, groups: [], totalSum: 0 };
        let personalSalary = { groupType: GroupType.Personal, groups: [], totalSum: 0 };
        for(let groupId of Object.keys(eventsByGroup)){
            let eventsPerGroup =  eventsByGroup[groupId];
            let group = eventsPerGroup[0].group;
            let rule = findSalaryRule( salaryRules, group, instructorId );
            let paymentsPerGroup = [];
            let paymentIds = new Set();
            eventsPerGroup.forEach(event => {
                event.payments.forEach(payment => {
                    if ( !paymentIds.has(payment.id) ) {
                        paymentsPerGroup.push( payment );
                        paymentIds.add(payment.id);
                    }
                });
            });

            let salaryInfo = {
                eventsCount: eventsPerGroup.length,
                name: group.name,
                rule: rule,
                sum: 0
            };

            if ( !rule ) {
                continue;
            }

            if ( rule.type == SalaryRuleType.FixMonthly ) {
                const monthsCount = end.diff((start), 'months') || 1;
                salaryInfo.sum = rule.value * monthsCount;
            } else if ( rule.type == SalaryRuleType.FixPerEvent ) {
                salaryInfo.sum = rule.value * eventsPerGroup.length;
            } else if (  rule.type == SalaryRuleType.Precentage ) {
                paymentsPerGroup.forEach( payment => {
                    salaryInfo.sum += payment.sum * (rule.value / 100) // тут уточнить 0.5 или 50 процентов будет(вид какой)
                } )
            }
            salaryInfo.rule.title = this.getRule(salaryInfo);
            if (group.type == GroupType.General) {
                generalSalary.groups.push(salaryInfo);
                generalSalary.totalSum += salaryInfo.sum
            } else {
                personalSalary.groups.push(salaryInfo);
                personalSalary.totalSum += salaryInfo.sum
            }
        }
        salaryInfoForInstructor.types[0] = generalSalary;
        salaryInfoForInstructor.totalSum += generalSalary.totalSum;
        salaryInfoForInstructor.types[1] = personalSalary;
        salaryInfoForInstructor.totalSum += personalSalary.totalSum;
        result.push( salaryInfoForInstructor );
    }
    return result;
}


module.exports.getRule = function (group){
    const rule = group.rule;
    let adding = "";
    switch (rule.type) {
      case SalaryRuleType.Precentage:
        adding = "% от всех платежей"
        break;
      case SalaryRuleType.FixPerEvent:
        adding = " за каждое занятие"
        break;
      case SalaryRuleType.FixMonthly:
        adding = " за месяц занятий в группе"
        break;
      default:
        console.log("Непонятное правило");
        break;
    }
    return `${rule.value}${adding}`;
}