import React, { useState, useEffect, useCallback } from 'react';
import { AuthScreen } from './components/auth/AuthScreen';
import StudentDashboard from './components/student/StudentDashboard';
import InstructorDashboard from './components/instructor/InstructorDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import { User, UserRole, Course, StudentProgress, Notification, ChatMessage, LiveSession, NewCourse, NewLiveSession, OneToOneSession, Quiz, LiveSessionProgress } from './types';
import { Toast } from './components/shared/Toast';
import { db, initializeDB } from './db';

const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    // FIX: Add quizzes to state to manage them throughout the app.
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
    const [oneToOneSessions, setOneToOneSessions] = useState<OneToOneSession[]>([]);
    const [liveSessionProgress, setLiveSessionProgress] = useState<LiveSessionProgress[]>([]);
    const [whatsAppPosition, setWhatsAppPosition] = useState('bottom-6 right-6');
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    // State for the OTP signup flow
    const [pendingSignupData, setPendingSignupData] = useState<{ name: string; email: string; role: UserRole } | null>(null);
    const [signupOtp, setSignupOtp] = useState<string | null>(null);

    // Load all data from DB on initial render
    useEffect(() => {
        initializeDB();
        setUsers(db.getUsers());
        setCourses(db.getCourses());
        setStudentProgress(db.getStudentProgress());
        setNotifications(db.getNotifications());
        setChatMessages(db.getChatMessages());
        setLiveSessions(db.getLiveSessions());
        setOneToOneSessions(db.getOneToOneSessions());
        setLiveSessionProgress(db.getLiveSessionProgress());
        // FIX: Load quizzes from the database into the app's state.
        setQuizzes(db.getQuizzes());
    }, []);

    // Wrapper for setting notifications to also save them
    const handleSetNotifications = useCallback((updater: React.SetStateAction<Notification[]>) => {
        setNotifications(prev => {
            const newState = typeof updater === 'function' ? updater(prev) : updater;
            db.saveNotifications(newState);
            return newState;
        });
    }, []);

    // Effect for sending welcome notification
    useEffect(() => {
        if (currentUser) {
            const welcomeNotif: Notification = {
                id: `notif-${Date.now()}`,
                recipientId: currentUser.id,
                message: `Welcome back, ${currentUser.name}!`,
                createdAt: new Date(),
                read: false,
                type: 'system',
            };
            handleSetNotifications(prev => [...prev, welcomeNotif]);
        }
    }, [currentUser, handleSetNotifications]);

    // Effect for sending session reminders
    useEffect(() => {
        const reminderInterval = setInterval(() => {
            const now = new Date().getTime();
            
            // --- 1-on-1 Session Reminders (30 mins) ---
            const updatedOneToOneSessions = oneToOneSessions.map(session => {
                const sessionTime = new Date(session.dateTime).getTime();
                const timeUntil = sessionTime - now;
                const thirtyMinutes = 30 * 60 * 1000;

                if (session.status === 'scheduled' && !session.reminderSent && timeUntil > 0 && timeUntil <= thirtyMinutes) {
                    const student = users.find(u => u.id === session.studentId);
                    const instructor = users.find(u => u.id === session.instructorId);

                    if (student && instructor) {
                        const studentMsg = `Your 1-on-1 session with ${instructor.name} is starting in 30 minutes.`;
                        const instructorMsg = `Your 1-on-1 session with ${student.name} is starting in 30 minutes.`;

                        handleSetNotifications(prev => [
                            ...prev,
                            { id: `notif-${Date.now()}-s`, recipientId: student.id, message: studentMsg, createdAt: new Date(), read: false, type: 'session', link: 'sessions' },
                            { id: `notif-${Date.now()}-i`, recipientId: instructor.id, message: instructorMsg, createdAt: new Date(), read: false, type: 'session', link: 'sessions' }
                        ]);
                    }
                    return { ...session, reminderSent: true };
                }
                return session;
            });

            if (JSON.stringify(updatedOneToOneSessions) !== JSON.stringify(oneToOneSessions)) {
                setOneToOneSessions(updatedOneToOneSessions);
                db.saveOneToOneSessions(updatedOneToOneSessions);
            }

            // --- Live Webinar Reminders (1 hour) ---
            const updatedLiveSessions = liveSessions.map(session => {
                const sessionTime = new Date(session.dateTime).getTime();
                const timeUntil = sessionTime - now;
                const oneHour = 60 * 60 * 1000;

                if (!session.reminderSent && timeUntil > 0 && timeUntil <= oneHour) {
                    const message = `The webinar "${session.title}" is starting in 1 hour.`;
                    const recipients = [...session.attendeeIds, session.instructorId];
                    
                    const newNotifications: Notification[] = recipients.map(recipientId => ({
                        id: `notif-${Date.now()}-${recipientId}`,
                        recipientId,
                        message,
                        createdAt: new Date(),
                        read: false,
                        type: 'session',
                        link: 'live',
                    }));

                    handleSetNotifications(prev => [...prev, ...newNotifications]);
                    return { ...session, reminderSent: true };
                }
                return session;
            });
            
            if (JSON.stringify(updatedLiveSessions) !== JSON.stringify(liveSessions)) {
                setLiveSessions(updatedLiveSessions);
                db.saveLiveSessions(updatedLiveSessions);
            }

        }, 60000); // Check every minute

        return () => clearInterval(reminderInterval);
    }, [oneToOneSessions, liveSessions, users, handleSetNotifications]);

    // --- AUTH HANDLERS ---
    const handleLogin = (email: string): User | null => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user) {
            setCurrentUser(user);
            return user;
        }
        return null;
    };

    const handleLogout = () => {
        setCurrentUser(null);
    };

    const handleInitiateSignup = (name: string, email: string, role: UserRole): boolean => {
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            return false;
        }
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setSignupOtp(generatedOtp);
        setPendingSignupData({ name, email, role });
        setToast({ message: `(For testing) Your OTP is: ${generatedOtp}`, type: 'success' });
        return true;
    };

    const handleVerifyOtpAndSignup = (otp: string): boolean => {
        if (otp === signupOtp && pendingSignupData) {
            const newUser: User = { 
                id: `user-${Date.now()}`, 
                name: pendingSignupData.name, 
                email: pendingSignupData.email, 
                role: pendingSignupData.role 
            };
            const updatedUsers = [...users, newUser];
            db.saveUsers(updatedUsers);
            setUsers(updatedUsers);
            setCurrentUser(newUser);
            setToast({ message: 'Account created successfully! Welcome.', type: 'success' });
            setPendingSignupData(null);
            setSignupOtp(null);
            return true;
        }
        return false;
    };

    // --- DATA HANDLERS ---
    // FIX: Refactor course creation to handle quiz data separately, fixing errors where the 'quiz' object was incorrectly assigned to the 'Course' type.
    const handleCreateCourse = (courseData: NewCourse) => {
        let updatedCourses: Course[];
        let quizId: string;
        let updatedQuizzes = [...quizzes];

        // Create or update the quiz associated with the course
        if (courseData.quiz.id) { // Update existing quiz
            quizId = courseData.quiz.id;
            const quizToUpdate: Quiz = { id: quizId, title: courseData.quiz.title, questions: courseData.quiz.questions };
            updatedQuizzes = updatedQuizzes.map(q => q.id === quizId ? quizToUpdate : q);
        } else { // Create new quiz
            quizId = `q-${Date.now()}`;
            const newQuiz: Quiz = { id: quizId, title: courseData.quiz.title, questions: courseData.quiz.questions };
            updatedQuizzes.push(newQuiz);
        }
        db.saveQuizzes(updatedQuizzes);
        setQuizzes(updatedQuizzes);
        
        // Prepare course data without the quiz object, using quizId instead
        const { quiz, ...restCourseData } = courseData;

        if (courseData.id) { // Update existing course
            updatedCourses = courses.map(c => c.id === courseData.id ? { 
                ...c, 
                ...restCourseData, 
                quizId: quizId,
                modules: courseData.modules.map((m, i) => ({...m, id: c.modules[i]?.id || `m-${Date.now()}-${i}` })), 
            } : c);
        } else { // Create new course
            const newCourse: Course = {
                ...restCourseData,
                id: `course-${Date.now()}`,
                quizId: quizId,
                rating: 0,
                totalRatings: 0,
                modules: courseData.modules.map((m, i) => ({ ...m, id: `m-${Date.now()}-${i}` })),
            };
            updatedCourses = [...courses, newCourse];
        }
        
        try {
            db.saveCourses(updatedCourses);
            setCourses(updatedCourses);
        } catch (e: any) {
            if (e.name === 'QuotaExceededError') {
                setToast({ message: 'Storage limit exceeded. Could not save course. Please reduce video sizes.', type: 'error' });
            } else {
                setToast({ message: 'An unexpected error occurred while saving the course.', type: 'error' });
            }
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        const courseToDelete = courses.find(c => c.id === courseId);
        if (courseToDelete) {
            const videoDeletionPromises = courseToDelete.modules
                .filter(module => module.type === 'video' && module.content.startsWith('indexeddb://'))
                .map(module => {
                    const videoId = module.content.replace('indexeddb://', '');
                    return db.deleteVideo(videoId).catch(err => console.error(`Failed to delete video ${videoId}`, err));
                });
            await Promise.all(videoDeletionPromises);
        }

        const updatedCourses = courses.filter(c => c.id !== courseId);
        db.saveCourses(updatedCourses);
        setCourses(updatedCourses);
    };

    const handleModuleComplete = (courseId: string, moduleId: string) => {
        if (!currentUser) return;
        setStudentProgress(prev => {
            const updatedProgress = JSON.parse(JSON.stringify(prev)); // Deep copy
            const progressIndex = updatedProgress.findIndex((p: StudentProgress) => p.courseId === courseId && p.studentId === currentUser.id);
            if (progressIndex > -1) {
                const currentProgress = updatedProgress[progressIndex];
                if (!currentProgress.completedModules.includes(moduleId)) {
                    currentProgress.completedModules.push(moduleId);
                }
            } else {
                updatedProgress.push({ courseId, studentId: currentUser.id, completedModules: [moduleId], quizScore: null, assignmentStatus: 'pending', completionNotified: false, certificateIssued: false });
            }
            db.saveStudentProgress(updatedProgress);
            return updatedProgress;
        });
    };
    
    const handleQuizComplete = (courseId: string, score: number) => {
        if (!currentUser) return;
         setStudentProgress(prev => {
            const updatedProgress = JSON.parse(JSON.stringify(prev));
            const progressIndex = updatedProgress.findIndex((p: StudentProgress) => p.courseId === courseId && p.studentId === currentUser.id);
            if (progressIndex > -1) {
                updatedProgress[progressIndex].quizScore = score;
            } else {
                updatedProgress.push({ courseId, studentId: currentUser.id, completedModules: [], quizScore: score, assignmentStatus: 'pending', completionNotified: false, certificateIssued: false });
            }
            db.saveStudentProgress(updatedProgress);
            return updatedProgress;
        });
        const newNotification: Notification = { 
            id: `notif-${Date.now()}`, 
            recipientId: currentUser.id, 
            message: `You scored ${score}% on the quiz!`, 
            createdAt: new Date(), 
            read: false,
            type: 'course',
            link: 'courses'
        };
        handleSetNotifications(prev => [...prev, newNotification]);
        setToast({ message: newNotification.message, type: 'success' });
    };
    
    const handleRateCourse = (courseId: string, rating: number) => {
        if (!currentUser) return;

        // Update student progress first. This is small and unlikely to fail.
        setStudentProgress(prev => {
            const updatedProgress = JSON.parse(JSON.stringify(prev));
            const progressIndex = updatedProgress.findIndex((p: StudentProgress) => p.courseId === courseId && p.studentId === currentUser.id);
            if (progressIndex > -1) {
                updatedProgress[progressIndex].rating = rating;
            }
            db.saveStudentProgress(updatedProgress);
            return updatedProgress;
        });

        // Now, prepare and try to save the updated courses array.
        const updatedCourses = courses.map(c => c.id === courseId ? {...c, rating: ((c.rating || 0) * (c.totalRatings || 0) + rating) / ((c.totalRatings || 0) + 1), totalRatings: (c.totalRatings || 0) + 1} : c);

        try {
            db.saveCourses(updatedCourses);
            setCourses(updatedCourses);
        } catch (e: any) {
            if (e.name === 'QuotaExceededError') {
                setToast({ message: 'Storage limit exceeded. Course rating could not be saved.', type: 'error' });
            } else {
                setToast({ message: 'An unexpected error occurred while saving the rating.', type: 'error' });
            }
        }
    };

    const handleSendMessage = (text: string) => {
        if (!currentUser) return;
        const newMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            user: currentUser,
            timestamp: new Date(),
            text,
        };
        const updatedMessages = [...chatMessages, newMessage];
        db.saveChatMessages(updatedMessages);
        setChatMessages(updatedMessages);
    };

    const handleCreateLiveSession = (sessionData: NewLiveSession) => {
        const newSession: LiveSession = {
            ...sessionData,
            id: `ls-${Date.now()}`,
            dateTime: new Date(sessionData.dateTime),
            endTime: new Date(sessionData.endTime),
            attendeeIds: [],
        };
        const updatedSessions = [...liveSessions, newSession];
        db.saveLiveSessions(updatedSessions);
        setLiveSessions(updatedSessions);
    };
    
    const handleUpdateLiveSession = (sessionData: NewLiveSession) => {
        if (!sessionData.id) return;
        const updatedSessions = liveSessions.map(s => 
            s.id === sessionData.id 
                ? { ...s, ...sessionData, id: s.id, dateTime: new Date(sessionData.dateTime), endTime: new Date(sessionData.endTime) } 
                : s
        );
        db.saveLiveSessions(updatedSessions);
        setLiveSessions(updatedSessions);
        setToast({ message: 'Live session updated successfully!', type: 'success' });
    };
    
    const handleDeleteLiveSession = (sessionId: string) => {
        const updatedSessions = liveSessions.filter(s => s.id !== sessionId);
        db.saveLiveSessions(updatedSessions);
        setLiveSessions(updatedSessions);
    };
    
    const handleUpdateUser = (userData: {name: string, role: UserRole, id?: string}) => {
        if (userData.id) {
            const updatedUsers = users.map(u => u.id === userData.id ? { ...u, name: userData.name, role: userData.role } : u);
            db.saveUsers(updatedUsers);
            setUsers(updatedUsers);
        }
    };
    
    const handleDeleteUser = (userId: string) => {
        const updatedUsers = users.filter(u => u.id !== userId);
        db.saveUsers(updatedUsers);
        setUsers(updatedUsers);
    };
    
    const handleCreateOneToOne = (studentId: string, instructorId: string, dateTime: Date) => {
        if (!currentUser) return;
        
        const conflictWindow = 60 * 60 * 1000; // 1 hour in milliseconds
        const newTime = dateTime.getTime();

        const hasConflict = oneToOneSessions.some(session => 
            session.status === 'scheduled' &&
            (session.studentId === studentId || session.instructorId === instructorId) &&
            Math.abs(newTime - session.dateTime.getTime()) < conflictWindow
        );

        if (hasConflict) {
            setToast({ message: 'Scheduling conflict detected. The instructor or student is unavailable at this time.', type: 'error' });
            return;
        }

        const newSession: OneToOneSession = {
            id: `oto-${Date.now()}`,
            studentId,
            instructorId,
            dateTime,
            status: 'pending',
            requestedById: currentUser.id,
        };
        const updatedSessions = [...oneToOneSessions, newSession];
        db.saveOneToOneSessions(updatedSessions);
        setOneToOneSessions(updatedSessions);

        const student = users.find(u => u.id === studentId);
        const instructor = users.find(u => u.id === instructorId);

        if (student && instructor) {
            const dateString = dateTime.toLocaleString();
            const recipientId = currentUser.id === student.id ? instructor.id : student.id;
            const message = `New 1-on-1 session request from ${currentUser.name} for ${dateString}.`;

            handleSetNotifications(prev => [...prev, {
                id: `notif-${Date.now()}-recipient`,
                recipientId,
                message,
                createdAt: new Date(),
                read: false,
                type: 'session',
                link: 'sessions'
            }]);
            setToast({ message: 'Session request sent successfully.', type: 'success' });
        }
    };
    
    const handleUpdateOneToOne = (sessionId: string, studentId: string, instructorId: string, dateTime: Date) => {
        const updatedSessions = oneToOneSessions.map(s => s.id === sessionId ? {...s, studentId, instructorId, dateTime} : s);
        db.saveOneToOneSessions(updatedSessions);
        setOneToOneSessions(updatedSessions);
    };

    const handleCancelOneToOne = (sessionId: string) => {
        const sessionToCancel = oneToOneSessions.find(s => s.id === sessionId);
        if (!sessionToCancel) return;

        const updatedSessions = oneToOneSessions.map(s => s.id === sessionId ? {...s, status: 'canceled' as const} : s);
        db.saveOneToOneSessions(updatedSessions);
        setOneToOneSessions(updatedSessions);
        
        // Notify other party if the session was already scheduled
        if (sessionToCancel.status === 'scheduled' && currentUser) {
             const student = users.find(u => u.id === sessionToCancel.studentId);
             const instructor = users.find(u => u.id === sessionToCancel.instructorId);
             if (!student || !instructor) return;

             const recipientId = currentUser.id === student.id ? instructor.id : student.id;
             const message = `Your session with ${currentUser.name} for ${sessionToCancel.dateTime.toLocaleString()} has been canceled.`;
             handleSetNotifications(prev => [...prev, {
                id: `notif-${Date.now()}-cancel`, recipientId, message,
                createdAt: new Date(), read: false, type: 'session', link: 'sessions'
            }]);
        }
         setToast({ message: sessionToCancel.status === 'pending' ? 'Session request withdrawn.' : 'Session canceled.', type: 'success' });
    };

    const handleAcceptSession = (sessionId: string) => {
        let session: OneToOneSession | undefined;
        const updatedSessions = oneToOneSessions.map(s => {
            if (s.id === sessionId) {
                session = { ...s, status: 'scheduled' };
                return session;
            }
            return s;
        });
        db.saveOneToOneSessions(updatedSessions);
        setOneToOneSessions(updatedSessions);

        if (session && currentUser) {
            const student = users.find(u => u.id === session!.studentId);
            const instructor = users.find(u => u.id === session!.instructorId);
            const dateString = session.dateTime.toLocaleString();

            const recipientId = session.requestedById;
            const confirmationMessage = `${currentUser.name} has confirmed your session request for ${dateString}.`;
            
            handleSetNotifications(prev => [...prev, {
                id: `notif-${Date.now()}-recipient`, recipientId, message: confirmationMessage,
                createdAt: new Date(), read: false, type: 'session', link: 'sessions'
            }]);

            setToast({ message: 'Session confirmed!', type: 'success' });
        }
    };

    const handleRejectSession = (sessionId: string) => {
        let session: OneToOneSession | undefined;
        const updatedSessions = oneToOneSessions.map(s => {
            if (s.id === sessionId) {
                session = { ...s, status: 'rejected' };
                return session;
            }
            return s;
        });
        db.saveOneToOneSessions(updatedSessions);
        setOneToOneSessions(updatedSessions);

         if (session && currentUser) {
            const recipientId = session.requestedById;
            const rejectionMessage = `${currentUser.name} has rejected your session request for ${session.dateTime.toLocaleString()}.`;
            
            handleSetNotifications(prev => [...prev, {
                id: `notif-${Date.now()}-recipient`, recipientId, message: rejectionMessage,
                createdAt: new Date(), read: false, type: 'session', link: 'sessions'
            }]);

            setToast({ message: 'Session request rejected.', type: 'success' });
        }
    };


    const handleEnrollInCourse = (courseId: string, enrollmentData: { phoneNumber: string; address: string; }) => {
        if (!currentUser) return;

        const updatedUsers = users.map(user => 
            user.id === currentUser.id 
                ? { ...user, ...enrollmentData } 
                : user
        );
        db.saveUsers(updatedUsers);
        setUsers(updatedUsers);

        setCurrentUser(prevUser => prevUser ? { ...prevUser, ...enrollmentData } : null);

        setStudentProgress(prev => {
            const alreadyEnrolled = prev.some(p => p.courseId === courseId && p.studentId === currentUser.id);
            if (alreadyEnrolled) return prev;

            const newProgress: StudentProgress = {
                courseId,
                studentId: currentUser.id,
                completedModules: [],
                quizScore: null,
                assignmentStatus: 'pending',
                completionNotified: false,
                certificateIssued: false,
            };
            const updatedProgress = [...prev, newProgress];
            db.saveStudentProgress(updatedProgress);
            return updatedProgress;
        });
        
        const course = courses.find(c => c.id === courseId);
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            recipientId: currentUser.id,
            message: `You have successfully enrolled in "${course?.title}"!`,
            createdAt: new Date(),
            read: false,
            type: 'course',
            link: 'courses',
        };
        handleSetNotifications(prev => [...prev, newNotification]);
        setToast({ message: newNotification.message, type: 'success' });
    };
    
    const handleNotifyInstructorOfCompletion = (courseId: string) => {
        if (!currentUser) return;
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        setStudentProgress(prev => {
            const updatedProgress = prev.map(p => 
                (p.courseId === courseId && p.studentId === currentUser.id)
                    ? { ...p, completionNotified: true }
                    : p
            );
            db.saveStudentProgress(updatedProgress);
            return updatedProgress;
        });

        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            recipientId: course.instructorId,
            message: `${currentUser.name} has completed the course "${course.title}".`,
            createdAt: new Date(),
            read: false,
            type: 'course',
            link: 'courses',
        };
        handleSetNotifications(prev => [...prev, newNotification]);
    };

    const handleIssueCertificate = (courseId: string, studentId: string) => {
        const course = courses.find(c => c.id === courseId);
        if (!course) return;

        setStudentProgress(prev => {
            const updatedProgress = prev.map(p => 
                (p.courseId === courseId && p.studentId === studentId)
                    ? { ...p, certificateIssued: true }
                    : p
            );
            db.saveStudentProgress(updatedProgress);
            return updatedProgress;
        });

        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            recipientId: studentId,
            message: `Congratulations! Your certificate for "${course.title}" has been issued.`,
            createdAt: new Date(),
            read: false,
            type: 'certificate',
            link: 'courses'
        };
        handleSetNotifications(prev => [...prev, newNotification]);
        if (currentUser?.id === studentId) {
            setToast({ message: newNotification.message, type: 'success' });
        }
    };

    const handleRegisterForWebinar = (sessionId: string) => {
        if (!currentUser) return;
        const session = liveSessions.find(s => s.id === sessionId);
        if (!session) return;
        
        if (session.attendeeIds.includes(currentUser.id)) {
            setToast({ message: "You are already registered for this session.", type: 'error' });
            return;
        }
        
        const updatedSessions = liveSessions.map(s => 
            s.id === sessionId
                ? { ...s, attendeeIds: [...s.attendeeIds, currentUser.id] }
                : s
        );
        db.saveLiveSessions(updatedSessions);
        setLiveSessions(updatedSessions);

        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            recipientId: currentUser.id,
            message: `You have successfully registered for "${session.title}".`,
            createdAt: new Date(),
            read: false,
            type: 'session',
            link: 'live'
        };
        handleSetNotifications(prev => [...prev, newNotification]);
        setToast({ message: newNotification.message, type: 'success' });
    };

    const handleUploadWebinarRecording = async (sessionId: string, file: File) => {
        try {
            const videoId = `webinar-rec-${sessionId}-${Date.now()}`;
            await db.saveVideo(videoId, file);
    
            const recordingUrl = `indexeddb://${videoId}`;
    
            const updatedSessions = liveSessions.map(s =>
                s.id === sessionId
                    ? { ...s, recordingUrl }
                    : s
            );
    
            db.saveLiveSessions(updatedSessions);
            setLiveSessions(updatedSessions);
            setToast({ message: 'Recording uploaded successfully!', type: 'success' });
        } catch (error) {
            console.error("Failed to upload recording:", error);
            setToast({ message: 'Failed to upload recording.', type: 'error' });
            throw error;
        }
    };
    
    const handleOneToOneFeedback = (sessionId: string, rating: number, feedback: string) => {
        const session = oneToOneSessions.find(s => s.id === sessionId);
        if (!session || !currentUser) return;

        const updatedSessions = oneToOneSessions.map(s => 
            s.id === sessionId
                ? { ...s, rating, feedback }
                : s
        );
        db.saveOneToOneSessions(updatedSessions);
        setOneToOneSessions(updatedSessions);

        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            recipientId: session.instructorId,
            message: `${currentUser.name} left ${rating}-star feedback for your 1-on-1 session.`,
            createdAt: new Date(),
            read: false,
            type: 'session',
            link: 'sessions'
        };
        handleSetNotifications(prev => [...prev, newNotification]);
        setToast({ message: 'Thank you for your feedback!', type: 'success' });
    };

    const handleWebinarFeedback = (sessionId: string, rating: number, comment: string) => {
        const session = liveSessions.find(s => s.id === sessionId);
        if (!session || !currentUser) return;

        const newFeedback = {
            studentId: currentUser.id,
            rating,
            comment
        };

        const updatedSessions = liveSessions.map(s => {
            if (s.id === sessionId) {
                const existingFeedback = s.feedback || [];
                return { ...s, feedback: [...existingFeedback, newFeedback] };
            }
            return s;
        });
        db.saveLiveSessions(updatedSessions);
        setLiveSessions(updatedSessions);

         const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            recipientId: session.instructorId,
            message: `${currentUser.name} left ${rating}-star feedback for your webinar "${session.title}".`,
            createdAt: new Date(),
            read: false,
            type: 'session',
            link: 'live'
        };
        handleSetNotifications(prev => [...prev, newNotification]);
        setToast({ message: 'Thank you for your feedback!', type: 'success' });
    };

    const handleLiveSessionQuizComplete = (sessionId: string, score: number) => {
        if (!currentUser) return;

        setLiveSessionProgress(prev => {
            const updatedProgress = JSON.parse(JSON.stringify(prev)); // Deep copy
            const progressIndex = updatedProgress.findIndex((p: LiveSessionProgress) => p.sessionId === sessionId && p.studentId === currentUser.id);

            if (progressIndex > -1) {
                updatedProgress[progressIndex].quizScore = score;
            } else {
                updatedProgress.push({ sessionId, studentId: currentUser.id, quizScore: score });
            }
            
            db.saveLiveSessionProgress(updatedProgress);
            return updatedProgress;
        });

        const session = liveSessions.find(s => s.id === sessionId);
        const message = `You scored ${score}% on the quiz for "${session?.title}"!`;
        const newNotification: Notification = { 
            id: `notif-${Date.now()}`, 
            recipientId: currentUser.id, 
            message,
            createdAt: new Date(), 
            read: false,
            type: 'session',
            link: 'live'
        };
        handleSetNotifications(prev => [...prev, newNotification]);
        setToast({ message, type: 'success' });
    };

    // --- RENDER LOGIC ---
    const renderDashboard = () => {
        if (!currentUser) return null;
        
        const instructors = users.filter(u => u.role === UserRole.Instructor);
        const students = users.filter(u => u.role === UserRole.Student);

        const commonProps = {
            currentUser,
            onLogout: handleLogout,
            notifications,
            setNotifications: handleSetNotifications,
            chatMessages,
            onSendMessage: handleSendMessage,
            allLiveSessions: liveSessions,
            sessions: oneToOneSessions,
            instructors,
            students,
            users,
            whatsAppPosition,
            setWhatsAppPosition,
            onCreateSession: handleCreateOneToOne,
            onUpdateSession: handleUpdateOneToOne,
            onCancelSession: handleCancelOneToOne,
            onAcceptSession: handleAcceptSession,
            onRejectSession: handleRejectSession,
            onRegisterForWebinar: handleRegisterForWebinar,
            liveSessionProgress,
            onLiveSessionQuizComplete: handleLiveSessionQuizComplete,
        };

        switch (currentUser.role) {
            case UserRole.Student:
                return <StudentDashboard
                    {...commonProps}
                    allCourses={courses}
                    // FIX: Pass the allQuizzes state to the dashboard.
                    allQuizzes={quizzes}
                    studentProgress={studentProgress}
                    onModuleComplete={handleModuleComplete}
                    onQuizComplete={handleQuizComplete}
                    onAssignmentSubmit={() => {}} // Placeholder
                    onRateCourse={handleRateCourse}
                    onEnrollInCourse={handleEnrollInCourse}
                    onNotifyInstructorOfCompletion={handleNotifyInstructorOfCompletion}
                    onOneToOneFeedback={handleOneToOneFeedback}
                    onWebinarFeedback={handleWebinarFeedback}
                />;
            case UserRole.Instructor:
                return <InstructorDashboard
                    {...commonProps}
                    allCourses={courses}
                    // FIX: Pass the allQuizzes state to the dashboard.
                    allQuizzes={quizzes}
                    studentProgress={studentProgress}
                    onCreateCourse={handleCreateCourse}
                    onDeleteCourse={handleDeleteCourse}
                    onCreateLiveSession={handleCreateLiveSession}
                    onUpdateLiveSession={handleUpdateLiveSession}
                    onDeleteLiveSession={handleDeleteLiveSession}
                    onIssueCertificate={handleIssueCertificate}
                    onUploadWebinarRecording={handleUploadWebinarRecording}
                />;
            case UserRole.Admin:
                return <AdminDashboard
                    {...commonProps}
                    allCourses={courses}
                    // FIX: Pass the allQuizzes state to the dashboard.
                    allQuizzes={quizzes}
                    studentProgress={studentProgress}
                    onCreateCourse={handleCreateCourse}
                    onDeleteCourse={handleDeleteCourse}
                    onCreateLiveSession={handleCreateLiveSession}
                    onUpdateLiveSession={handleUpdateLiveSession}
                    onDeleteLiveSession={handleDeleteLiveSession}
                    onUpdateUser={handleUpdateUser}
                    onDeleteUser={handleDeleteUser}
                    onIssueCertificate={handleIssueCertificate}
                    onUploadWebinarRecording={handleUploadWebinarRecording}
                />;
            default:
                return <div>Invalid user role.</div>;
        }
    };

    return (
        <>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            {currentUser ? renderDashboard() : <AuthScreen onLogin={handleLogin} onInitiateSignup={handleInitiateSignup} onVerifyOtp={handleVerifyOtpAndSignup} />}
        </>
    );
};

export default App;