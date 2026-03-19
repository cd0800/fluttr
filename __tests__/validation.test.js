// Unit tests for server validation helpers.
const { isValidEmail, sanitizeName } = require("../server/validation");

test("isValidEmail accepts common valid emails", () => {
  expect(isValidEmail("user@example.com")).toBe(true);
  expect(isValidEmail("name.surname+tag@domain.co")).toBe(true);
});

test("isValidEmail rejects invalid emails", () => {
  expect(isValidEmail("not-an-email")).toBe(false);
  expect(isValidEmail("user@")).toBe(false);
  expect(isValidEmail("@domain.com")).toBe(false);
});

test("sanitizeName trims, collapses spaces, and strips angle brackets", () => {
  expect(sanitizeName("  Ada  Lovelace  ")).toBe("Ada Lovelace");
  expect(sanitizeName("<script>name</script>")).toBe("scriptname/script");
});

test("sanitizeName limits length", () => {
  const longName = "a".repeat(120);
  expect(sanitizeName(longName).length).toBe(80);
});
