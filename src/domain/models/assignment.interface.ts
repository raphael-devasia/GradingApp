

import { ASSIGNMENT_TYPES } from "./assignment-types"



export interface IAssignment {
    id: any
    title: string
    courseId: any
    type: (typeof ASSIGNMENT_TYPES)[keyof typeof ASSIGNMENT_TYPES]
    dueDate: string
    description: string
    learningObjectives: string
    instructions?: string
    rubric?: string
    questions?: string
    answerKey?: string
    checklist?: string
    participationCriteria?: string
    peerEvaluation?: string
    userId: any
    createdAt: string
    updatedAt: string
}