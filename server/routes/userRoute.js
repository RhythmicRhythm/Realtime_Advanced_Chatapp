const express = require("express");
const {
  registerUser,
    loginUser,
    setAvatar,
    logoutUser,
      getUser,
    loginStatus,
  //   updateUser,
  //   changePassword,
  //   forgotPassword,
  //   resetPassword,
} = require("../controllers/userController");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/setavatar/:id", setAvatar);
router.get("/logout", logoutUser);
router.get("/getuser", protect, getUser);
router.get("/loggedin", loginStatus);
// router.patch("/updateuser", protect, updateUser);
// router.patch("/changepassword", protect, changePassword);
// router.post("/forgotpassword", forgotPassword);
// router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
