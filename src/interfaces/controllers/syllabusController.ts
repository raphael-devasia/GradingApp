import { Request, Response } from "express"
import { HttpStatus } from "../../domain/models/http-status.enum"
import { SyllabusUseCase } from "../../application/usecases/syllabus.usecase"
import { SYLLABUS_TYPES, SyllabusType } from "../../domain/models/syllabus-type"
import { Syllabus } from "../../domain/models/syllabus.interface"

// Define interface for request body
interface SyllabusRequestBody {
    prompt: string
    syllabusType: SyllabusType
    details: {
        userId: string
        name: string
        description: string
        subject: string
        gradeLevel: string
    }
    fileContent?: string
}

export class SyllabusController {
    constructor(private syllabusUseCase: SyllabusUseCase) {}

    async generateSyllabusContent(req: Request, res: Response): Promise<void> {
        try {
            const { prompt, syllabusType, details, fileContent } =
                req.body as SyllabusRequestBody

                console.log(req.body);
                

            // Validate required fields
            if (!prompt) {
                throw new Error("Prompt is required")
            }
            if (
                !syllabusType ||
                !Object.values(SYLLABUS_TYPES).includes(syllabusType)
            ) {
                throw new Error(
                    `Invalid syllabus type. Must be one of: ${Object.values(
                        SYLLABUS_TYPES
                    ).join(", ")}`
                )
            }
            if (
                !details ||
                !details.userId ||
                !details.name ||
                !details.description ||
                !details.subject ||
                !details.gradeLevel
            ) {
                throw new Error(
                    "All details fields (userId, name, description, subject, gradeLevel) are required"
                )
            }

            // Prepare syllabus data for use case
            const syllabusData: Partial<Syllabus> & {
                userId: string
                syllabusType: SyllabusType
            } = {
                courseTitle: details.name,
                courseDescription: details.description,
                subject: details.subject,
                gradeLevel: details.gradeLevel,
                userId: details.userId,
                syllabusType,
            }

            // Call use case to generate syllabus
            const syllabus: Syllabus =
                await this.syllabusUseCase.generateSyllabusContent(
                    prompt,
                    syllabusData,
                    fileContent
                )

            // Send success response
            res.status(HttpStatus.CREATED).json({
                success: true,
                data: syllabus,
            })
        } catch (error: any) {
            console.error("Error generating syllabus:", error)
            const statusCode =
                error.message.includes("required") ||
                error.message.includes("Invalid syllabus type")
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.INTERNAL_SERVER_ERROR
            res.status(statusCode).json({
                success: false,
                message: error.message || "Failed to generate syllabus",
            })
        }
    }
}
