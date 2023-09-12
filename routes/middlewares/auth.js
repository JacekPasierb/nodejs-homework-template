const passport = require("passport");
const { handleUserUnauthorizedError } = require("../../helpers/handleErrors");

const auth = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (!user || err) {
      return handleUserUnauthorizedError(res, "Not authorized")
     
    }
    req.user = user;
    next();
  })(req, res, next);
};

module.exports = {
  auth,
};
