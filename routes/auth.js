const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/User");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid Email")
      .normalizeEmail()
      .trim(),
    check(
      "password",
      "Please enter a password cotaining only Aplhabets and Numbers with a minimum length of 5"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid Email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              "E-Mail already exists, Please pick a different One"
            );
          }
        });
      })
      .normalizeEmail()
      .trim(),
    check(
      "password",
      "Please enter a password cotaining only Aplhabets and Numbers with a minimum length of 5"
    )
      .isLength({ min: 5 })
      .isAlphanumeric(),
    body("confirmPassword")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      })
      .trim(),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

module.exports = router;
