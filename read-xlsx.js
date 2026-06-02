const XLSX = require('xlsx');
const wb = XLSX.readFile('./OrangeHRM_TestCases_v5.xlsx');
const ws = wb.Sheets['👤 User Management'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
rows.slice(2).forEach(row => {
  if (row[0]) {
    console.log(`${row[0]} | ${row[1]} | Input: ${JSON.stringify(row[3])}`);
  }
});
