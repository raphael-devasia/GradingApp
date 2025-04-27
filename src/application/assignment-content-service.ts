// import { AssignmentContentValidator } from "./assignment-content-validator";
// import { IAssignment } from "../domain/models/assignment.interface";
// import { ChatPromptTemplate } from "@langchain/core/prompts";
// import { OpenRouterAIProvider } from "./open-router-ai-provider"; // Import the new provider

// export class AssignmentContentService {
//     constructor(
//         private aiProvider: OpenRouterAIProvider,
//         private validator: AssignmentContentValidator
//     ) {}

//     async generateContent(
//         prompt: string,
//         assignmentDetails: Partial<IAssignment>,
//         fileContent?: string
//     ): Promise<Partial<IAssignment>> {
//         // Define prompt template
//         const generationPrompt = ChatPromptTemplate.fromMessages([
//             ["system", "Generate assignment content in JSON format."],
//             [
//                 "user",
//                 "Assignment: {title}\nType: {type}\nCourse: {courseId}\nDescription: {description}\nObjectives: {learningObjectives}\nPrompt: {prompt}\nFile Content: {fileContent}",
//             ],
//         ]);

//         // Format prompt
//         const formattedPrompt = await generationPrompt.format({
//             title: assignmentDetails.title || "",
//             type: assignmentDetails.type || "",
//             courseId: assignmentDetails.courseId || "",
//             description: assignmentDetails.description || "",
//             learningObjectives: assignmentDetails.learningObjectives || "",
//             prompt,
//             fileContent: fileContent || "",
//         });

//         // Generate content
//         const content = await this.aiProvider.generateAssignmentContent(
//             formattedPrompt,
//             assignmentDetails,
//             fileContent
//         );

//         // Validate content
//         this.validator.validate(
//             content,
//             assignmentDetails.type || "",
//             assignmentDetails.title || ""
//         );

//         return content;
//     }
// }


// import { AssignmentContentValidator } from "./assignment-content-validator"
// import { IAssignment } from "../domain/models/assignment.interface"
// import { ChatPromptTemplate } from "@langchain/core/prompts"
// import { OpenRouterAIProvider } from "./OpenRouterAIProvider"


// export class AssignmentContentService {
//     constructor(
//         private aiProvider: OpenRouterAIProvider,
//         private validator: AssignmentContentValidator
//     ) {}

//     async generateContent(
//         prompt: string,
//         assignmentDetails: Partial<IAssignment>,
//         fileContent?: string
//     ): Promise<Partial<IAssignment>> {
//         // Define prompt template
//         const generationPrompt = ChatPromptTemplate.fromMessages([
//             ["system", "Generate assignment content in JSON format."],
//             [
//                 "user",
//                 "Assignment: {title}\nType: {type}\nCourse: {courseId}\nDescription: {description}\nObjectives: {learningObjectives}\nPrompt: {prompt}\nFile Content: {fileContent}",
//             ],
//         ])

//         // Format prompt
//         const formattedPrompt = await generationPrompt.format({
//             title: assignmentDetails.title || "",
//             type: assignmentDetails.type || "",
//             courseId: assignmentDetails.courseId || "",
//             description: assignmentDetails.description || "",
//             learningObjectives: assignmentDetails.learningObjectives || "",
//             prompt,
//             fileContent: fileContent || "",
//         })
        
        
//         // Generate content
//         const content = await this.aiProvider.generateAssignmentContent(
//             formattedPrompt,
//             assignmentDetails,
//             fileContent
//         )

//         // Validate content
//         this.validator.validate(
//             content,
//             assignmentDetails.type || "",
//             assignmentDetails.title || ""
//         )

//         return content
//     }
// }

import { AssignmentContentValidator } from "./assignment-content-validator"
import { IAssignment } from "../domain/models/assignment.interface"
import { ChatPromptTemplate } from "@langchain/core/prompts"
import { OpenRouterAIProvider } from "./OpenRouterAIProvider"

export class AssignmentContentService {
    constructor(
        private aiProvider: OpenRouterAIProvider,
        private validator: AssignmentContentValidator
    ) {}

    async generateContent(
        prompt: string,
        assignmentDetails: Partial<IAssignment>,
        fileContent?: string
    ): Promise<Partial<IAssignment>> {
        // Define prompt template
        const generationPrompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `Generate assignment content in JSON format. Ensure fields like instructions, rubric, questions, answerKey, checklist, participationCriteria, and peerEvaluation are strings (e.g., JSON strings or formatted text), not nested objects.`,
            ],
            [
                "user",
                `Assignment: {title}\nType: {type}\nCourse: {courseId}\nDescription: {description}\nObjectives: {learningObjectives}\nPrompt: {prompt}\nFile Content: {fileContent}`,
            ],
        ])

        // Format prompt
        const formattedPrompt = await generationPrompt.format({
            title: assignmentDetails.title || "",
            type: assignmentDetails.type || "",
            courseId: assignmentDetails.courseId || "",
            description: assignmentDetails.description || "",
            learningObjectives: assignmentDetails.learningObjectives || "",
            prompt,
            fileContent: fileContent || "",
        })

        // Generate content
        const content = await this.aiProvider.generateAssignmentContent(
            formattedPrompt,
            assignmentDetails,
            fileContent
        )

        // Validate content
        this.validator.validate(
            content,
            assignmentDetails.type || "",
            assignmentDetails.title || ""
        )

        return content
    }
}