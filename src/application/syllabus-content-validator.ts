import { z } from "zod"
import { Syllabus } from "../domain/models/syllabus.interface"


const syllabusContentSchema = z.object({
    courseTitle: z.string().min(1, "Course title is required"),
    instructor: z.string().min(1, "Instructor is required"),
    term: z.string().min(1, "Term is required"),
    courseDescription: z.string().min(1, "Course description is required"),
    learningObjectives: z
        .array(z.string())
        .min(1, "At least one learning objective is required"),
    requiredMaterials: z.array(
        z.object({
            title: z.string().min(1, "Material title is required"),
            author: z.string().min(1, "Material author is required"),
            publisher: z.string().min(1, "Material publisher is required"),
            year: z.string().min(1, "Material year is required"),
            required: z.boolean(),
        })
    ),
    gradingPolicy: z
        .record(
            z.object({
                percentage: z
                    .number()
                    .min(0)
                    .max(100, "Percentage must be between 0 and 100"),
                description: z
                    .string()
                    .min(1, "Grading description is required"),
            })
        )
        .refine(
            (policy) => {
                const totalPercentage = Object.values(policy).reduce(
                    (sum, { percentage }) => sum + percentage,
                    0
                )
                return totalPercentage === 100
            },
            { message: "Grading policy percentages must sum to 100%" }
        ),
    weeklySchedule: z
        .array(
            z.object({
                week: z.number().min(1, "Week number must be positive"),
                topic: z.string().min(1, "Topic is required"),
                readings: z.string().min(1, "Readings are required"),
                assignments: z.string().min(1, "Assignments are required"),
            })
        )
        .min(1, "At least one week is required"),
    policies: z.record(z.string().min(1, "Policy description is required")),
})

export class SyllabusContentValidator {
    validate(
        content: Syllabus,
        syllabusType: string,
        courseTitle: string
    ): void {
        try {
            syllabusContentSchema.parse(content)
        } catch (error: any) {
            throw new Error(
                `Validation failed: ${error.errors
                    .map((e: any) => e.message)
                    .join(", ")}`
            )
        }
    }
}
