const xlsx = require('xlsx');
const wb = xlsx.readFile('OrangeHRM_TestCases_v5.xlsx');
['Login', 'Employee List', 'User Management'].forEach(sheetName => {
  const sheet = wb.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { defval: '' });
  data.forEach(row => {
    if (row['Test Case ID']) {
      const id = row['Test Case ID'];
      const status = row['Trạng thái (Pass/Fail)'] || row['Trạng thái'] || row['Status'] || '';
      const notes = row['Ghi chú/Bug ID'] || row['Ghi chú'] || row['Notes'] || '';
      console.log(`${id} | ${status} | ${notes.substring(0, 100).replace(/\n/g, ' ')}`);
    }
  });
});
