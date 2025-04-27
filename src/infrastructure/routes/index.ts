import { Router } from "express"

import userRoutes from "./userRoutes"

import courseRoutes from './courseRoutes'
import assignmentRoutes from './assignmentRouts'
import classRoomRoutes from "./classRoomRoutes"

import authRoutes from "./authRoutes"
import syllabusRoutes from "./syllabusRoutes"






const router: Router = Router()

router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/courses", courseRoutes)
router.use("/syllabus", syllabusRoutes)
router.use("/assignments", assignmentRoutes)
router.use("/classrooms", classRoomRoutes)










export default router
