import express from "express"
import { getPublishedCreations, getUserCreations, getUserPlan, toggleLikeCreation, getCreationVersions } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.get('/get-user-plan', auth, getUserPlan)
userRouter.get('/get-user-creations', auth, getUserCreations)
userRouter.get('/get-published-creations', auth, getPublishedCreations)
userRouter.get('/get-creation-versions/:id', auth, getCreationVersions)
userRouter.post('/toggle-like-creation', auth, toggleLikeCreation)

export default userRouter;
