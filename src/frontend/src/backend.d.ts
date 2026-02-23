import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Course {
    id: string;
    title: string;
    creator: Principal;
    thumbnailUrl: string;
    createdAt: Time;
    description: string;
    price: bigint;
    enrollmentCount: bigint;
}
export type Time = bigint;
export interface Post {
    content: string;
    author: Principal;
    timestamp: Time;
}
export interface Enrollment {
    id: string;
    user: Principal;
    completed: boolean;
    enrolledAt: Time;
    courseId: string;
}
export interface UserProfile {
    bio: string;
    name: string;
    experience: ExperienceLevel;
    profilePic?: ExternalBlob;
}
export enum ExperienceLevel {
    intermediate = "intermediate",
    beginner = "beginner",
    advanced = "advanced"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addPost(content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCourse(id: string, title: string, description: string, price: bigint, thumbnailUrl: string): Promise<Course>;
    enrollInCourse(enrollmentId: string, courseId: string): Promise<Enrollment>;
    getAllCourses(): Promise<Array<Course>>;
    getAllPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCourseById(id: string): Promise<Course | null>;
    getCoursesByCreator(creator: Principal): Promise<Array<Course>>;
    getUserEnrollments(user: Principal): Promise<Array<Enrollment>>;
    getUserPosts(user: Principal): Promise<Array<Post>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    isUserEnrolled(user: Principal, courseId: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
