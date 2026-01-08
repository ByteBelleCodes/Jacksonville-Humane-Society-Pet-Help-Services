function validateRequiredColumns(record, required = ['phone_number', 'contact_name']) {
  const missing = [];
  for (const c of required) {
    if (!record[c] || record[c].toString().trim() === '') missing.push(c);
  }
  return missing;
}

module.exports = {
  validateRequiredColumns
};