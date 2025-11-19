export enum UserRole {
    Student = 'Student',
    Instructor = 'Instructor',
    Admin = 'Admin',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    phoneNumber?: string;
    address?: string;
}

export interface Question {
    text: string;
    options: string[];
    correctAnswerIndex: number;
}

export interface Quiz {
    id: string;
    title: string;
    questions: Question[];
}

export interface Module {
    id: string;
    title: string;
    type: 'text' | 'video';
    content: string;
    durationMinutes: number;
}

export enum CourseDifficulty {
    Beginner = 'Beginner',
    Intermediate = 'Intermediate',
    Advanced = 'Advanced',
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructorId: string;
    thumbnailUrl: string;
    modules: Module[];
    quizId: string;
    rating?: number;
    totalRatings?: number;
    price?: number;
    category: string;
    difficulty: CourseDifficulty;
}

export type NewQuestion = Omit<Question, 'id'>;
export type NewModule = Omit<Module, 'id'>;

export interface NewCourse {
    id?: string;
    title: string;
    description: string;
    instructorId: string;
    thumbnailUrl: string;
    modules: NewModule[];
    quiz: {
        id?: string;
        title: string;
        questions: NewQuestion[];
    };
    price?: number;
    // FIX: Add category and difficulty to align with the Course interface and fix creation errors.
    category: string;
    difficulty: CourseDifficulty;
}

export interface StudentProgress {
    courseId: string;
    studentId: string;
    completedModules: string[];
    quizScore: number | null;
    assignmentStatus: 'pending' | 'submitted' | 'graded';
    rating?: number;
    completionNotified?: boolean;
    certificateIssued?: boolean;
}

export interface Notification {
    id: string;
    recipientId: string;
    message: string;
    createdAt: Date;
    read: boolean;
    type: 'system' | 'course' | 'certificate' | 'session' | 'announcement';
    link?: string;
}

export interface ChatMessage {
    id: string;
    user: User;
    timestamp: Date;
    text: string;
}

export interface LiveSession {
    id: string;
    title: string;
    description: string;
    instructorId: string;
    dateTime: Date;
    endTime: Date;
    price?: number;
    attendeeIds: string[];
    recordingUrl?: string;
    reminderSent?: boolean;
    feedback?: Array<{
        studentId: string;
        rating: number;
        comment: string;
    }>;
    quizId?: string;
}

export interface NewLiveSession {
    id?: string;
    title: string;
    description: string;
    dateTime: string;
    endTime: string;
    instructorId: string;
    price?: number;
    quiz?: {
        title: string;
        questions: NewQuestion[];
    };
    // FIX: Add quizId to allow selecting an existing quiz for a live session.
    quizId?: string;
}

export interface Assignment {
    id:string;
    courseId: string;
    title: string;
    prompt: string;
}

export interface OneToOneSession {
    id: string;
    studentId: string;
    instructorId: string;
    dateTime: Date;
    status: 'pending' | 'scheduled' | 'completed' | 'canceled' | 'rejected';
    requestedById: string;
    reminderSent?: boolean;
    rating?: number;
    feedback?: string;
}

export interface LiveSessionProgress {
    sessionId: string;
    studentId: string;
    quizScore: number | null;
}

export interface Banner {
    id: string;
    title: (name: string) => string; // Function to allow personalization
    subtitle: string;
    ctaText: string;
    ctaLink: string; // Can be a course ID or a page like 'live', 'sessions'
    background: string; // CSS class for background
    roles?: UserRole[];
}