import { USERS, COURSES, STUDENT_PROGRESS, CHAT_MESSAGES, LIVE_SESSIONS, ONE_TO_ONE_SESSIONS, QUIZZES } from './constants';
import { User, Course, StudentProgress, Notification, ChatMessage, LiveSession, OneToOneSession, Quiz, LiveSessionProgress } from './types';

const KEYS = {
  USERS: 'lms_users',
  COURSES: 'lms_courses',
  STUDENT_PROGRESS: 'lms_student_progress',
  NOTIFICATIONS: 'lms_notifications',
  CHAT_MESSAGES: 'lms_chat_messages',
  LIVE_SESSIONS: 'lms_live_sessions',
  ONE_TO_ONE_SESSIONS: 'lms_one_to_one_sessions',
  QUIZZES: 'lms_quizzes',
  LIVE_SESSION_PROGRESS: 'lms_live_session_progress',
};

// --- LocalStorage for structured data ---

const get = <T>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item, (k, v) => {
                if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v)) {
                    return new Date(v);
                }
                return v;
            });
        }
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        localStorage.removeItem(key);
    }
    return defaultValue;
};

const set = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
        throw error;
    }
};

// --- IndexedDB for Large File Storage ---

const DB_NAME = 'lms_video_storage';
const STORE_NAME = 'videos';
let dbInstance: IDBDatabase | null = null;

const openVideoDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject('Error opening video database.');
        };
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
};

const saveVideo = async (id: string, videoBlob: Blob): Promise<void> => {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(videoBlob, id);
        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error saving video to IndexedDB:', request.error);
            reject('Could not save video.');
        };
    });
};

const getVideo = async (id: string): Promise<Blob | null> => {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => {
            resolve(request.result ? (request.result as Blob) : null);
        };
        request.onerror = () => {
            console.error('Error getting video from IndexedDB:', request.error);
            reject('Could not retrieve video.');
        };
    });
};

const deleteVideo = async (id: string): Promise<void> => {
    const db = await openVideoDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => {
            console.error('Error deleting video from IndexedDB:', request.error);
            reject('Could not delete video.');
        };
    });
};


export const initializeDB = () => {
    if (!localStorage.getItem(KEYS.USERS)) set(KEYS.USERS, USERS);
    if (!localStorage.getItem(KEYS.COURSES)) set(KEYS.COURSES, COURSES);
    if (!localStorage.getItem(KEYS.STUDENT_PROGRESS)) set(KEYS.STUDENT_PROGRESS, STUDENT_PROGRESS);
    if (!localStorage.getItem(KEYS.CHAT_MESSAGES)) set(KEYS.CHAT_MESSAGES, CHAT_MESSAGES);
    if (!localStorage.getItem(KEYS.LIVE_SESSIONS)) set(KEYS.LIVE_SESSIONS, LIVE_SESSIONS);
    if (!localStorage.getItem(KEYS.ONE_TO_ONE_SESSIONS)) set(KEYS.ONE_TO_ONE_SESSIONS, ONE_TO_ONE_SESSIONS);
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) set(KEYS.NOTIFICATIONS, []);
    if (!localStorage.getItem(KEYS.QUIZZES)) set(KEYS.QUIZZES, QUIZZES);
    if (!localStorage.getItem(KEYS.LIVE_SESSION_PROGRESS)) set(KEYS.LIVE_SESSION_PROGRESS, []);
};

export const db = {
    getUsers: (): User[] => get(KEYS.USERS, []),
    saveUsers: (data: User[]) => set(KEYS.USERS, data),
    getCourses: (): Course[] => get(KEYS.COURSES, []),
    saveCourses: (data: Course[]) => set(KEYS.COURSES, data),
    getStudentProgress: (): StudentProgress[] => get(KEYS.STUDENT_PROGRESS, []),
    saveStudentProgress: (data: StudentProgress[]) => set(KEYS.STUDENT_PROGRESS, data),
    getNotifications: (): Notification[] => get(KEYS.NOTIFICATIONS, []),
    saveNotifications: (data: Notification[]) => set(KEYS.NOTIFICATIONS, data),
    getChatMessages: (): ChatMessage[] => get(KEYS.CHAT_MESSAGES, []),
    saveChatMessages: (data: ChatMessage[]) => set(KEYS.CHAT_MESSAGES, data),
    getLiveSessions: (): LiveSession[] => get(KEYS.LIVE_SESSIONS, []),
    saveLiveSessions: (data: LiveSession[]) => set(KEYS.LIVE_SESSIONS, data),
    getOneToOneSessions: (): OneToOneSession[] => get(KEYS.ONE_TO_ONE_SESSIONS, []),
    saveOneToOneSessions: (data: OneToOneSession[]) => set(KEYS.ONE_TO_ONE_SESSIONS, data),
    getQuizzes: (): Quiz[] => get(KEYS.QUIZZES, []),
    saveQuizzes: (data: Quiz[]) => set(KEYS.QUIZZES, data),
    getLiveSessionProgress: (): LiveSessionProgress[] => get(KEYS.LIVE_SESSION_PROGRESS, []),
    saveLiveSessionProgress: (data: LiveSessionProgress[]) => set(KEYS.LIVE_SESSION_PROGRESS, data),
    saveVideo,
    getVideo,
    deleteVideo,
};