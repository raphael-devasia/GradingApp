

import { AssignmentContentService } from "../../application/assignment-content-service"
import { AssignmentContentValidator } from "../../application/assignment-content-validator"
import { MockAIProvider } from "../../application/mock-ai-provider"
import { OpenRouterAIProvider } from "../../application/OpenRouterAIProvider"
import { AssignmentUseCase } from "../../application/usecases/assignment.usecase"
import { AssignmentController } from "../../interfaces/controllers/assignmentController"
import { AssignmentRepositoryMongo } from "../repositories/assignmentRepositoryMongo"


export const createAssignmentController = (): AssignmentController => {
    const api_key =
        process.env.DEEP_SEEK_API ||
        "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"
    const aiProvider = new OpenRouterAIProvider(api_key)
    const assignmentContentValidator = new AssignmentContentValidator()
    const assignmentRepository = new AssignmentRepositoryMongo()
    const assignmentContentService = new AssignmentContentService(
        aiProvider,
        assignmentContentValidator
    )
    const assignmentUseCase = new AssignmentUseCase(
        assignmentContentService,
        assignmentRepository
    )
    return new AssignmentController(assignmentUseCase)
}
