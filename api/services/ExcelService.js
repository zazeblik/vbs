const Excel = require('exceljs');
const GetMonthDateRange =  require('../utils/DateRangeHelper').GetMonthDateRange;
const GroupsService = require('./GroupsService');
const moment = require('moment');

module.exports.getTotals = async function(year, month){
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile('api/templates/totals.xlsx');
  const monthDateRange = GetMonthDateRange(year, month);
  let sheet = workbook.worksheets[0];
  const groups = await Groups.find({ hidden: false });
  const groupIds = groups.map(g => g.id);
  const events = await Events
    .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
    .sort("startsAt ASC")
    .populate("visitors")
    .populate("payments")
    .populate("group");
  let results = DashboardService.getTotals(events);
  results.forEach((r, i) => {
    sheet.getRow(i+2).values = [r.group, r.eventsTotal, r.visitsTotal, r.paymentsTotal, r.paymentsTotalSum];
  });
  const totalRow = sheet.getRow(results.length+2);
  totalRow.values = ["","","","",""];
  totalRow.eachCell(function(cell, colNumber) {
    cell.value = {'richText': [{'font': {'bold': true}, 'text': DashboardService.resolveTotalSum(results, colNumber)}]};
    cell.alignment = { horizontal: 'right' };
  })
  const wbbuf = await workbook.xlsx.writeBuffer();
  return wbbuf;
}

module.exports.getPayments = async function(year, month){
  const workbook = new Excel.Workbook();
      await workbook.xlsx.readFile('api/templates/payments.xlsx');
      const monthDateRange = GetMonthDateRange(year, month);
      let sheet = workbook.worksheets[0];
      const groups = await Groups.find({ hidden: false });
      const groupIds = groups.map(g => g.id);
      const events = await Events
        .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
        .sort("startsAt ASC")
        .populate("payments");
      let paymentIds = [];
      events.forEach(e => {
        e.payments.forEach(p => {
          if (paymentIds.includes(p.id)) return;
          paymentIds.push(p.id);
        })
      })
      const payments = await Payments.find({id: paymentIds}).populate('person');
      const incomes = await Incomes
        .find({ updatedAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() }})
        .populate('person');
      let results = DashboardService.getTransactionSums(payments, incomes);
      results.forEach((r, i) => {
        sheet.getRow(i+2).values = [r.name, r.paymentsSum, r.incomesSum];
      });
      const wbbuf = await workbook.xlsx.writeBuffer();
      return wbbuf;
}

module.exports.getInstructors = async function(year, month){
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile('api/templates/instructors.xlsx');
  const monthDateRange = GetMonthDateRange(year, month);
  let sheet = workbook.worksheets[0];
  const groups = await Groups.find({ hidden: false });
  const groupIds = groups.map(g => g.id);
  const events = await Events
    .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
    .sort("startsAt ASC")
    .populate("instructor")
    .populate("group");
  let results = DashboardService.getInstructors(events);
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    sheet.getRow(i+2).values = [r.name, r.generalsCount, r.personalsCount, r.total];
  }
  const wbbuf = await workbook.xlsx.writeBuffer();
  return wbbuf;
}

module.exports.getIncomes = async function(fromDate, toDate){
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile('api/templates/incomes.xlsx');
  let sheet = workbook.worksheets[0];
  const incomes = await Incomes.find({createdAt: {">=": fromDate, "<=": toDate}}).populate('person');
  incomes.forEach((v, i) => {
    sheet.getRow(i+2).values = [moment(v.createdAt).format("DD.MM.YYYY"), v.person.name, v.sum, v.description];
  });
  const totalsRow = sheet.getRow(incomes.length+2);
  const totalSumCell = totalsRow.getCell(3);
  totalSumCell.value = {'richText': [{'font': {'bold': true}, 'text': `Итого: ${incomes.map(x => x.sum).reduce((a, b) => a + b, 0)}`}]};
  const wbbuf = await workbook.xlsx.writeBuffer();
  return wbbuf;
}

module.exports.getVisits = async function(year, month){
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile('api/templates/visits.xlsx');
  const monthDateRange = GetMonthDateRange(year, month);
  let sheet = workbook.worksheets[0];
  const groups = await Groups.find({ hidden: false });
  const groupIds = groups.map(g => g.id);
  const events = await Events
    .find({ group: groupIds, startsAt: { ">=": monthDateRange.start.valueOf(), "<=": monthDateRange.end.valueOf() } })
    .sort("startsAt ASC")
    .populate("visitors")
    .populate("group");
  let visits = DashboardService.getVisits(events);
  visits.forEach((v, i) => {
    sheet.getRow(i+2).values = [v.name, v.generalsCount, v.personalsCount, v.total];
  });
  const wbbuf = await workbook.xlsx.writeBuffer();
  return wbbuf;
}

module.exports.getPersons = async function(){
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile('api/templates/persons.xlsx');
  let sheet = workbook.worksheets[0];
  const persons = await Persons.find();
  persons.forEach((p, i) => {
    const ncell = sheet.getCell(`A${i+2}`);
    ncell.value = p.name;
    if (p.birthday) {
      const bcell = sheet.getCell(`B${i+2}`);
      bcell.value = moment(p.birthday).format('DD.MM.YYYY');
    }
  });
  const wbbuf = await workbook.xlsx.writeBuffer();
  return wbbuf;
}

module.exports.parsePersons = async function(fd, updater){
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile(fd);
  let sheet = workbook.worksheets[0];
  let lastRowNumber = sheet.getColumn(1).values.length;
  let persons = [];
  for (let i = 2; i < lastRowNumber; i++) {
    const row = sheet.getRow(i);
    const name = row.getCell(1).value; 
    const birthday = moment(row.getCell(2).value, 'DD.MM.YYYY').valueOf();
    const person = { 
      name: name,
      updater: updater
    };
    if (birthday) person.birthday = birthday;
    persons.push(person);
  }
  return persons;
}

module.exports.getPersonals = async function(year, month, instructor){
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile('api/templates/personals.xlsx');
  const monthDateRange = GetMonthDateRange(year, month);
  let sheet = workbook.worksheets[0];
  const events = await GroupsService.getInstructorScheduleEvents(instructor, monthDateRange);
  const fields = GroupsService.getInstructorScheduleFields(events);
  const rows = GroupsService.getInstructorScheduleRows(year, month, events, fields);
  const paymentsSum = GroupsService.getInstructorSchedulePaymentsSum(events);
  const hoursSum = GroupsService.getInstructorScheduleHoursSum(events);
  const shownFields = fields.filter(x => x.isShown);
  const shownFieldLabels = shownFields.map(x => x.label);
  const shownFieldKeys = shownFields.map(x => x.key);
  let maxColumnLength = [];
  const totals = [`Всего часов: ${hoursSum}`, `Сумма оплат: ${paymentsSum}`]
  sheet.getRow(1).values = totals;
  sheet.getRow(1).eachCell((cell, colNum) => {
    cell.value = {'richText': [{'font': {'bold': true}, 'text': totals[colNum-1]}]};
    cell.alignment = { horizontal: 'center' };
  });
  sheet.getRow(2).values = shownFieldLabels;
  sheet.getRow(2).eachCell((cell, colNum) => {
    cell.value = {'richText': [{'font': {'bold': true}, 'text': shownFieldLabels[colNum-1]}]};
    cell.alignment = { horizontal: 'center' };
    maxColumnLength[colNum-1] = shownFieldLabels[colNum-1].length;
  });
  rows.forEach((x, i) => {
    const row = sheet.getRow(i+3);
    const rowValues = [];
    let maxEventsCount = 0;
    for (const key in x) {
      if (shownFieldKeys.includes(key)){
        let cellValue = x[key].date.getDate() + ' \r\n';
        const cellEvents =  x[key].events;
        let maxCellLength = 0;
        if (cellEvents.length > maxEventsCount) maxEventsCount = cellEvents.length;
        for (let j = 0; j < cellEvents.length; j++) {
          const cellEvent = cellEvents[j];
          const cellEventMembers = cellEvent.members;
          const cellEventMemberNames = cellEventMembers
            .map(y => `${y.name.split(" ")[0]}(${y.isVisitor ? '✓' : '×'}, ${
              !!cellEvent.payments.find(p => p.person == y.id) 
                ? cellEvent.payments.find(p => p.person == y.id).sum
                : '-'})`)
            .join(' - ');
          const eventCellValue = `${moment(cellEvent.startsAt).format("HH:mm")} ${cellEventMemberNames} \r\n`;
          maxCellLength = eventCellValue.length > maxCellLength ? eventCellValue.length : maxCellLength;
          cellValue += eventCellValue;
        }
        rowValues.push(cellValue);
        maxColumnLength[rowValues.length - 1] = maxColumnLength[rowValues.length - 1] > maxCellLength ? maxColumnLength[rowValues.length - 1] : maxCellLength;
      }
    }
    if (shownFieldKeys.includes("0")) {
      rowValues.push(rowValues.shift());
    }
    row.height = (maxEventsCount + 1) * 15;
    rowValues.forEach((y, j) => {
      const cell = row.getCell(j+1);
      sheet.getColumn(j+1).style = { alignment: { wrapText: true } };
      cell.value = y;
      cell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    });
  });
  if (shownFieldKeys.includes("0")) {
    maxColumnLength.push(maxColumnLength.shift());
  }
  sheet.columns.forEach((c, i) => {
    c.width = maxColumnLength[i]*0.85;
  })
  const wbbuf = await workbook.xlsx.writeBuffer();
  return wbbuf;
}

module.exports.getGenerals = async function(year, month, group){
  const workbook = new Excel.Workbook();
  await workbook.xlsx.readFile('api/templates/generals.xlsx');
  const monthDateRange = GetMonthDateRange(year, month);
  let sheet = workbook.worksheets[0];
  const sheetData = await GroupsService.getSheet(group, monthDateRange);
  const headers = sheetData.fields.map(x => x.label);
  sheet.getRow(1).values = headers;
  sheet.getRow(1).eachCell((cell, colNum) => {
    cell.value = {'richText': [{'font': {'bold': true}, 'text': headers[colNum-1]}]};
    if (colNum != 1) cell.alignment = { horizontal: 'center' };
  });
  sheetData.rows.forEach((x, i) => {
    sheetData.fields.forEach((y, j) => {
      const row = sheet.getRow(i+2);
      const cell = row.getCell(j+1);
      if (y.key == 'person'){
        cell.value = x[y.key].name;
      } else if (y.key == 'visits' || y.key == 'payments') {
        cell.value = x[y.key];
        cell.alignment = { horizontal: 'center' };
        sheet.getColumn(j+1).width = 12;
      } else {
        cell.value = x[y.key].visited ? '+' : 'н';
        if (x[y.key].payed) cell.fill = {
          type: 'pattern',
          pattern:'solid',
          fgColor: { argb: "FFC3E6CB" },
          bgColor: { argb: "FF000000" }
        };
        cell.alignment = { horizontal: 'center' };
      }
    })
  });
  const totalsRow = sheet.getRow(sheetData.rows.length+2);
  sheetData.fields.forEach((x, i) => {
    const cell = totalsRow.getCell(i+1);
    cell.value = {'richText': [{'font': {'bold': true}, 'text': sheetData.totals[x.key]}]};
    if (x.key != 'person'){
      cell.alignment = { horizontal: 'center' };
    }
  })
  const wbbuf = await workbook.xlsx.writeBuffer();
  return wbbuf;
}