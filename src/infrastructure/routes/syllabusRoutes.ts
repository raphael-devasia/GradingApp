import { Router, Request, Response } from "express"

import { createSyllabusController } from "../factories/syllabusFactory"
import { SyllabusController } from "../../interfaces/controllers/syllabusController"
import authorize from "../../interfaces/controllers/authMiddleware"


const router: Router = Router()

const syllabusController: SyllabusController = createSyllabusController()

// Create a new syllabus AI-generated content
router.post("/generate", authorize, (req: Request, res: Response) =>
    syllabusController.generateSyllabusContent(req, res)
)

export default router
