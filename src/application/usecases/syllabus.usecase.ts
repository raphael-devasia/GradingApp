import { SyllabusContentService } from "../syllabus-content-service"
import { Syllabus } from "../../domain/models/syllabus.interface"
import { SyllabusType } from "../../domain/models/syllabus-type"

export class SyllabusUseCase {
    constructor(private syllabusContentService: SyllabusContentService) {}

    async generateSyllabusContent(
        prompt: string,
        syllabusData: Partial<Syllabus> & {
            userId: string
            syllabusType: SyllabusType
        },
        fileContent?: string
    ): Promise<Syllabus> {
        try {
            // Validate syllabus type
            if (!syllabusData.syllabusType) {
                throw new Error("Syllabus type is required")
            }

            // Delegate to content service
            const syllabus: Syllabus =
                await this.syllabusContentService.generateContent(
                    prompt,
                    syllabusData,
                    fileContent
                )

            // Validate required fields
            const requiredFields: (keyof Syllabus)[] = [
                "courseTitle",
                "instructor",
                "term",
                "courseDescription",
                "learningObjectives",
                "requiredMaterials",
                "gradingPolicy",
                "weeklySchedule",
                "policies",
            ]
            for (const field of requiredFields) {
                if (!(field in syllabus)) {
                    throw new Error(
                        `Generated syllabus is missing required field: ${field}`
                    )
                }
            }

            return syllabus
        } catch (error: any) {
            throw new Error(
                `Failed to generate syllabus: ${error.message || String(error)}`
            )
        }
    }
}
