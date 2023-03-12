import AuthenticationController from "../../src/controller/AuthenticationController";

/**
 *
 */
test("testing isValidEmail function", done => {
  let result1 = AuthenticationController.isValidEmail("abc@evolphin.com");
  expect(result1).toBe(true);

  let result2 = AuthenticationController.isValidEmail("abc@gmail.com");
  expect(result2).toBe(true);

  let result3 = AuthenticationController.isValidEmail("abc.evolphin.com");
  expect(result3).toBe(false);

  let result4 = AuthenticationController.isValidEmail("abc9324r059431-+5=-0#$@^&#$&@gmail.com");
  expect(result4).toBe(false);
  done();
});

/**
 *
 */
test("testing validateFirstName function", done => {
  let result1 = AuthenticationController.validateFirstName("Abc");
  expect(result1).toBe(true);

  let result2 = AuthenticationController.validateFirstName("abc");
  expect(result2).toBe(true);

  let result3 = AuthenticationController.validateFirstName("123456");
  expect(result3).toBe(false);

  let result4 = AuthenticationController.validateFirstName("abc");
  expect(result4).toBe(false);
  done();
});

/**
 *
 */
test("testing validateLastName function", done => {
  let result1 = AuthenticationController.validateLastName("ABC");
  expect(result1).toBe(true);

  let result2 = AuthenticationController.validateLastName("abc");
  expect(result2).toBe(true);

  let result3 = AuthenticationController.validateLastName("123456");
  expect(result3).toBe(false);

  let result4 = AuthenticationController.validateLastName("abc-");
  expect(result4).toBe(false);
  done();
});

/**
 *
 */
test("testing validatePassword function", done => {
  let result1 = AuthenticationController.isValidPassword("Qwerty@1234");
  expect(result1).toBe(true);

  let result2 = AuthenticationController.isValidPassword("Qwert-1");
  expect(result2).toBe(true);

  let result3 = AuthenticationController.isValidPassword("123456");
  expect(result3).toBe(false);

  let result4 = AuthenticationController.isValidPassword("abc");
  expect(result4).toBe(false);
  done();
});
