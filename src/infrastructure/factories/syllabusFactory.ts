import { OpenRouterSyllabusProvider } from "../../application/OpenRouterSyllabusProvider"
import { SyllabusContentService } from "../../application/syllabus-content-service"
import { SyllabusContentValidator } from "../../application/syllabus-content-validator"
import { SyllabusUseCase } from "../../application/usecases/syllabus.usecase"
import { SyllabusController } from "../../interfaces/controllers/syllabusController"


export const createSyllabusController = (): SyllabusController => {
    const apiKey: string | undefined = process.env.DEEP_SEEK_API
    if (!apiKey) {
        throw new Error("DEEP_SEEK_API is not set in environment variables")
    }

    const aiProvider = new OpenRouterSyllabusProvider(apiKey)
    const syllabusContentValidator = new SyllabusContentValidator()
    const syllabusContentService = new SyllabusContentService(
        aiProvider,
        syllabusContentValidator
    )
    const syllabusUseCase = new SyllabusUseCase(syllabusContentService)
    return new SyllabusController(syllabusUseCase)
}
