const { parse } = require("csv-parse/sync");

function parseCSVContents(text) {
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  return records;
}

function normalizeRecord(record, sourceSystem = 'unknown') {
  return {
    case_external_id: record.case_id || record.id || null,
    contact_name: record.contact_name || record.name || record.contact || '',
    phone_number: record.phone_number || record.phone || '',
    pet_name: record.pet_name || record.pet || '',
    pet_species: record.pet_species || record.species || '',
    pet_breed: record.pet_breed || record.breed || '',
    initial_request: record.request || record.initial_request || '',
    source_system: sourceSystem,
    status: record.status || 'open',
    outcome: record.outcome || '',
    notes: record.notes || ''
  };
}

module.exports = {
  parseCSVContents,
  normalizeRecord
};
