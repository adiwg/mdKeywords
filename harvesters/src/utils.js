function throwError(msg) {
  console.log(`Error: ${msg}`);
  process.exit(1);
}

module.exports = { throwError };
