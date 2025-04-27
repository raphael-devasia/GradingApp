import { Router } from "express"
import { createUserController } from "../factories/userFactory"
import authorize from "../../interfaces/controllers/authMiddleware"

const authRoutes = Router()
const userController = createUserController()

authRoutes.post("/signup", (req, res) => userController.createUser(req, res))
authRoutes.post("/update-plan",authorize, (req, res) =>
    userController.updatePlan(req, res)
)
authRoutes.post("/login", (req, res) => userController.loginUser(req, res))
authRoutes.post("/oauth", (req, res) => userController.authOAuth(req, res))
authRoutes.get("/test", (req, res) => {
    res.send("test")
})
authRoutes.post("/refresh", (req, res) => userController.refreshToken(req, res))







export default authRoutes
