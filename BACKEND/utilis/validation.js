// utils/validation.js
const swiftCodePattern = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

function isValidSwiftCode(swiftCode) {
  return swiftCodePattern.test(swiftCode);
}

// Function to validate SWIFT code
function validateSwiftCode(swiftCode) {
  // Basic validation: Check if it's 8 or 11 characters long and follows the format
  return swiftCodePattern.test(swiftCode);
}

module.exports = { isValidSwiftCode };
