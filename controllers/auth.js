const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.getLogin = (req, res, next) => {
  const errorMessage = req.flash("error")[0];
  res.status(422).render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorMessage,
    oldInput: { email: "", password: "" },
    validationError: [],
  });
};

exports.getSignup = (req, res, next) => {
  const errorMessage = req.flash("error")[0];
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: errorMessage,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationError: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: error.array()[0].msg,
      oldInput: { email: email, password: password },
      validationError: error.array(),
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: "Invalid email or password",
          oldInput: { email: email, password: password },
          validationError: [],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            errorMessage: "Invalid email or password",
            oldInput: { email: email, password: password },
            validationError: [],
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const error = validationResult(req);

  if (!error.isEmpty()) {
    console.log(error.array().find((e) => e.path === "email"));
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: error.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationError: error.array(),
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
