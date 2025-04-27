import { SyllabusContentValidator } from "./syllabus-content-validator"
import { OpenRouterSyllabusProvider } from "./OpenRouterSyllabusProvider"
import { Syllabus } from "../domain/models/syllabus.interface"


export class SyllabusContentService {
    constructor(
        private aiProvider: OpenRouterSyllabusProvider,
        private validator: SyllabusContentValidator
    ) {}

    async generateContent(
        prompt: string,
        syllabusDetails: Partial<Syllabus> & {
            userId: string
            syllabusType: string
        },
        fileContent?: string
    ): Promise<Syllabus> {
        // Create prompt with syllabus details
        const formattedPrompt = `
      System: Generate syllabus content in JSON format.
      User: 
      Syllabus: ${syllabusDetails.courseTitle || ""}
      Type: ${syllabusDetails.syllabusType || ""}
      Description: ${syllabusDetails.courseDescription || ""}
      Subject: ${syllabusDetails.subject || ""}
      Grade Level: ${syllabusDetails.gradeLevel || ""}
      Prompt: ${prompt}
      ${fileContent ? `Additional context:\n${fileContent}` : ""}
    `

        // Generate content
        const content: Syllabus = await this.aiProvider.generateSyllabusContent(
            formattedPrompt,
            syllabusDetails,
            fileContent
        )

        // Validate content
        this.validator.validate(
            content,
            syllabusDetails.syllabusType || "",
            syllabusDetails.courseTitle || ""
        )

        return content
    }
}
