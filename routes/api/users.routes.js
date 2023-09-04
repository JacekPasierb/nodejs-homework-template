const express = require("express");
const router = express.Router();
const usersController = require("../../controller/users.controller");

const { upload } = require("../../middlewares/upload");
const { auth } = require("../../middlewares/auth");

router.post("/signup", usersController.signup);
router.post("/login", usersController.login);
router.get("/logout", auth, usersController.logout);
router.get("/current", auth, usersController.getCurrent);
router.patch("/", auth, usersController.updateSubscriptionUser);
router.patch(
  "/avatars",
  auth,
  upload.single("picture"),
  usersController.updateAvatars
);

module.exports = router;
