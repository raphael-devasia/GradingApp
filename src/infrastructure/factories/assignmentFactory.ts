

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
