import { IAssignment } from "../../domain/models/assignment.interface";
import { IAssignmentRepository } from "../../domain/repositories/assignmentRepository";
import { AssignmentContentService } from "../assignment-content-service";


export class AssignmentUseCase {
    constructor(
        private assignmentContentService: AssignmentContentService,
        private assignmentRepository: IAssignmentRepository
    ) {}

    async createAssignment(
        prompt: string,
        assignmentData: Partial<IAssignment>,
        fileContent?: string
    ): Promise<Partial<IAssignment>> {
        console.log('reached here');
        
        return this.assignmentRepository.createAssignment(
            prompt,
            assignmentData,
            fileContent
        )
    }

    async generateAssignmentContent(
        prompt: string,
        assignmentData: Partial<IAssignment>,
        fileContent?: string
    ): Promise<Partial<IAssignment>> {
       
        
        return this.assignmentContentService.generateContent(
            prompt,
            assignmentData,
            fileContent
        )
    }
    async getAllUserAssignments(userId: string): Promise<IAssignment[]> {
            return this.assignmentRepository.getAllUserAssignments(userId)
        }
}
