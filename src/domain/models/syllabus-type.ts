export const SYLLABUS_TYPES = {
    UNDERGRADUATE: "undergraduate",
    GRADUATE: "graduate",
    HIGH_SCHOOL: "high_school",
    MIDDLE_SCHOOL: "middle_school",
    ONLINE: "online",
    BLENDED: "blended",
    PROFESSIONAL: "professional",
    SHORT_COURSE: "short_course",
    SEMINAR: "seminar",
    WORKSHOP: "workshop",
    CERTIFICATION: "certification",
} as const

export type SyllabusType = (typeof SYLLABUS_TYPES)[keyof typeof SYLLABUS_TYPES]
