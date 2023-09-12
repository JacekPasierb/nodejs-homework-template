

const handleValidationError = ( error, res) => {
   return res.status(400).json({
     statusText: "Bad Request",
     code: 400,
     ResponseBody: {
       message: `Input data validation error: ${error.message}`,
     },
   });
};

const handleUserConflictError = (res, ...user) => {
  const [ isUser, firstName, email ] = user;
  
  return res
    .status(409)
    .header("Content-Type", "application/json")
    .json({
      status: "conflict",
      code: 409,
      ResponseBody: {
        message: `${isUser.firstName === firstName ? "Firstname" : isUser.email === email ? "Email" : null} in use`,
      },
    });
}

const handleUserUnauthorizedError = (res, message) => {
  return res.status(401).json({
    statusText: "Unauthorized",
    code: 401,
    ResponseBody: {
      message: `${message}`,
    },
  });
}

const handleUserNotVerifiedEmail = (res) => {
   return res.status(403).json({
     statusText: "",
     code: 403,
     ResponseBody: {
       message: "E-mail is not verified",
     },
   });
}

const handleUserNotFoundError = (res) => {
   return res.status(404).json({ message: "User not found" });
}

const handleUserVerifiedEmailError = (res) => {
  return res.status(400).json({
    statusText: "Bad Request",
    code: 400,
    ResponseBody: {
      message: "Verification has already been passed",
    },
  });
}
module.exports = {
  handleValidationError,
  handleUserConflictError,
  handleUserUnauthorizedError,
  handleUserNotVerifiedEmail,
  handleUserNotFoundError,
  handleUserVerifiedEmailError,
};