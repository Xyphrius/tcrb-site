/**
 * TCRB Logger — Minimal, timestamped, prefixed
 */
function log(prefix, message) {
  const ts = new Date().toISOString().replace('T', ' ').substring(0, 19);
  console.log(`[${ts}] [${prefix}] ${message}`);
}

function logData(prefix, data) {
  log(prefix, JSON.stringify(data, null, 2));
}

module.exports = { log, logData };
