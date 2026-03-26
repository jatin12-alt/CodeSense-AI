// test-fail.js
console.log("🚀 Testing Fixr Auto-Fix Pipeline...");

// Jaan-booch kar error throw kar rahe hain taaki CI fail ho jaye
if (true) {
  throw new Error("🔴 FIXR_TEST_FAILURE: AI should detect this and suggest a fix!");
}
// Fixr testing 