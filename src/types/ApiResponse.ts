import { Message } from "@/model/UserModel";

export interface ApiResponse{
    success: boolean;
    messagge: string;
    isAcceptingMessages?:  boolean;
    message?: Array<Message>
}