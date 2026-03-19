// Unit test for the example helper.
const sum = require("../index");

test("sum adds two numbers", () => {
  expect(sum(2, 3)).toBe(5);
});
