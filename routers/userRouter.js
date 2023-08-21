const userController = require("../controller/userController");
const requireUser = require("../middlewares/requireUser");

const router = require("express").Router();

router.post("/follow", requireUser, userController.followOrUnfollowUserController);
router.get("/getFeedData", requireUser, userController.postOfFollowing);
router.get("/getMyPosts", requireUser, userController.getMyPosts);
router.get("/getUsersPosts", requireUser, userController.getUsersPosts);
router.delete("/", requireUser, userController.deleteMyProfile);
router.get("/getMyInfo", requireUser, userController.getMyInfo);
router.put('/', requireUser,  userController.updateUserPofile);
router.post("/getUserProfile", requireUser, userController.getUserProfile);
module.exports = router;
