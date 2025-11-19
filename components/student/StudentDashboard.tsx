import React, { useState, useCallback, useEffect } from 'react';
import { User, Course, StudentProgress, Notification, ChatMessage, LiveSession, OneToOneSession, Banner, UserRole, Quiz, LiveSessionProgress } from '../../types';
import { BottomNavBar } from '../shared/BottomNavBar';
import { NotificationBell } from '../shared/NotificationBell';
import { UserCircleIcon, Cog6ToothIcon, AcademicCapIcon, MagnifyingGlassIcon, UsersIcon, ArrowLeftIcon, ArrowRightIcon } from '../icons/Icons';
import CourseListPage from '../pages/CourseListPage';
import WebinarListPage from '../pages/WebinarListPage';
import CommunityPage from '../pages/CommunityPage';
import OneToOnePage from '../pages/OneToOnePage';
import { AppSettingsMenu } from '../shared/AppSettingsMenu';
import { UserProfileMenu } from '../shared/UserProfileMenu';
import { Modal } from '../shared/Modal';
import { CourseDetailView } from './CourseDetailView';
import { EnrollmentModal } from './EnrollmentModal';
import { CourseCard } from '../shared/CourseCard';
import { WebinarCard } from '../shared/WebinarCard';
import { WebinarSession } from '../shared/WebinarSession';
import { BANNERS } from '../../constants';
import { SideNavBar } from '../shared/SideNavBar';
import { BannerCarousel } from '../shared/BannerCarousel';
import { FeedbackModal } from './FeedbackModal';

// --- End of BannerCarousel ---

interface DashboardProps {
    currentUser: User;
    onLogout: () => void;
    allCourses: Course[];
    allQuizzes: Quiz[];
    instructors: User[];
    studentProgress: StudentProgress[];
    onModuleComplete: (courseId: string, moduleId: string) => void;
    onQuizComplete: (courseId: string, score: number) => void;
    onAssignmentSubmit: (courseId: string, submission: string) => void;
    onRateCourse: (courseId: string, rating: number) => void;
    onEnrollInCourse: (courseId: string, enrollmentData: { phoneNumber: string, address: string }) => void;
    onNotifyInstructorOfCompletion: (courseId: string) => void;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    chatMessages: ChatMessage[];
    onSendMessage: (text: string) => void;
    allLiveSessions: LiveSession[];
    sessions: OneToOneSession[];
    users: User[];
    students: User[];
    whatsAppPosition: string;
    setWhatsAppPosition: (position: string) => void;
    onCreateSession: (studentId: string, instructorId: string, dateTime: Date) => void;
    onUpdateSession: (sessionId: string, studentId: string, instructorId: string, dateTime: Date) => void;
    onCancelSession: (sessionId: string) => void;
    onAcceptSession: (sessionId: string) => void;
    onRejectSession: (sessionId: string) => void;
    onRegisterForWebinar: (sessionId: string) => void;
    onOneToOneFeedback: (sessionId: string, rating: number, feedback: string) => void;
    onWebinarFeedback: (sessionId: string, rating: number, comment: string) => void;
    liveSessionProgress: LiveSessionProgress[];
    onLiveSessionQuizComplete: (sessionId: string, score: number) => void;
}

const StudentDashboard: React.FC<DashboardProps> = (props) => {
    const [currentPage, setCurrentPage] = useState('home');
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for modals triggered from home page
    const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
    const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
    const [joiningLiveSession, setJoiningLiveSession] = useState<LiveSession | null>(null);
    const [feedbackSession, setFeedbackSession] = useState<{ type: '1-on-1' | 'webinar', session: OneToOneSession | LiveSession } | null>(null);
    
    const myCourses = props.allCourses.filter(c => props.studentProgress.some(p => p.studentId === props.currentUser.id && p.courseId === c.id));
    const myProgress = props.studentProgress.filter(p => p.studentId === props.currentUser.id);

    const showSearchBar = ['home', 'courses'].includes(currentPage);
    
    const handleCourseClick = (course: Course) => {
        const progress = myProgress.find(p => p.courseId === course.id);
        if (progress) {
            setViewingCourse(course);
        } else {
            setEnrollingCourse(course);
        }
    };

    const handleBannerClick = (link: string) => {
        // Check if the link is a course ID
        const courseExists = props.allCourses.some(c => c.id === link);
        if (courseExists) {
            const course = props.allCourses.find(c => c.id === link)!;
            handleCourseClick(course);
        } else {
            // Assume it's a page link
            setCurrentPage(link);
        }
    };

    const handleEnrollmentSubmit = (enrollmentData: { phoneNumber: string, address: string }) => {
        if (enrollingCourse) {
            props.onEnrollInCourse(enrollingCourse.id, enrollmentData);
            // For paid courses, the modal transitions to a receipt view.
            // It should NOT be closed from here. The user will close it from the receipt.
            if (!enrollingCourse.price || enrollingCourse.price <= 0) {
                setEnrollingCourse(null);
            }
        }
    };
    
    const handleShareWebinar = (session: LiveSession) => {
        const message = `Check out this upcoming webinar on Purple LMS!\n\n*${session.title}*\n*Date:* ${session.dateTime.toLocaleString()}\n\nJoin here: ${window.location.href}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };
    
    const openFeedbackModal = (session: OneToOneSession | LiveSession, type: '1-on-1' | 'webinar') => {
        setFeedbackSession({ session, type });
    };

    const handleFeedbackSubmit = (rating: number, comment: string) => {
        if (feedbackSession) {
            if (feedbackSession.type === '1-on-1') {
                props.onOneToOneFeedback(feedbackSession.session.id, rating, comment);
            } else {
                props.onWebinarFeedback(feedbackSession.session.id, rating, comment);
            }
            setFeedbackSession(null);
        }
    };


    const renderContent = () => {
        const courseListProps = {
            currentUser: props.currentUser,
            instructors: props.instructors,
            studentProgress: myProgress,
            onModuleComplete: props.onModuleComplete,
            onQuizComplete: props.onQuizComplete,
            onAssignmentSubmit: props.onAssignmentSubmit,
            onRateCourse: props.onRateCourse,
            onEnrollInCourse: props.onEnrollInCourse,
            onNotifyInstructorOfCompletion: props.onNotifyInstructorOfCompletion,
            students: props.students,
            allQuizzes: props.allQuizzes,
            // Dummy/unused props for student view
            onCreateCourse: () => {},
            onDeleteCourse: () => {},
            onIssueCertificate: () => {},
            searchTerm,
        };

        switch (currentPage) {
            case 'courses':
                return <CourseListPage 
                    {...courseListProps}
                    allCourses={props.allCourses} // Show all available courses
                />;
            case 'live':
                 return <WebinarListPage
                    currentUser={props.currentUser}
                    allLiveSessions={props.allLiveSessions}
                    instructors={props.instructors}
                    onCreateLiveSession={() => {}}
                    // FIX: Add missing onUpdateLiveSession prop with a dummy function.
                    onUpdateLiveSession={() => {}}
                    onDeleteLiveSession={() => {}}
                    onRegisterForWebinar={props.onRegisterForWebinar}
                    onUploadWebinarRecording={async () => {}}
                    onLeaveFeedback={(session) => openFeedbackModal(session, 'webinar')}
                    users={props.users}
                    allQuizzes={props.allQuizzes}
                    liveSessionProgress={props.liveSessionProgress}
                    onLiveSessionQuizComplete={props.onLiveSessionQuizComplete}
                />;
            case 'community':
                return <CommunityPage currentUser={props.currentUser} messages={props.chatMessages} onSendMessage={props.onSendMessage}/>;
            case 'sessions':
                 return <OneToOnePage 
                    currentUser={props.currentUser}
                    instructors={props.instructors}
                    students={props.students}
                    users={props.users}
                    sessions={props.sessions}
                    onCreateSession={props.onCreateSession}
                    onUpdateSession={props.onUpdateSession}
                    onCancelSession={props.onCancelSession}
                    onAcceptSession={props.onAcceptSession}
                    onRejectSession={props.onRejectSession}
                    onLeaveFeedback={(session) => openFeedbackModal(session, '1-on-1')}
                 />;
            case 'home':
            default:
                const upcomingWebinars = props.allLiveSessions
                    .filter(session => new Date(session.dateTime) > new Date())
                    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                    .slice(0, 5);
                
                const coursesToShow = (myCourses.length > 0 ? myCourses : props.allCourses).slice(0, 5);
                const studentBanners = BANNERS.filter(b => !b.roles || b.roles.includes(UserRole.Student));

                return (
                    <div className="space-y-12 animate-fade-in">
                        {/* Welcome Banner */}
                        <BannerCarousel banners={studentBanners} currentUser={props.currentUser} onCtaClick={handleBannerClick} />

                        {/* My Learning Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Continue Your Learning</h2>
                                <button onClick={() => setCurrentPage('courses')} className="text-sm font-medium text-indigo-600 hover:underline">
                                    View All &rarr;
                                </button>
                            </div>
                             {coursesToShow.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {coursesToShow.map(course => (
                                        <CourseCard
                                            key={course.id}
                                            course={course}
                                            instructor={props.instructors.find(i => i.id === course.instructorId)}
                                            progress={myProgress.find(p => p.courseId === course.id)}
                                            onClick={handleCourseClick}
                                            userRole={props.currentUser.role}
                                        />
                                    ))}
                                </div>
                             ) : (
                                 <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                                    <p className="text-slate-500">No courses available. Explore the 'Courses' tab to get started!</p>
                                </div>
                             )}
                        </div>

                         {/* Upcoming Live Sessions Section */}
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-slate-800">Upcoming Live Sessions</h2>
                                <button onClick={() => setCurrentPage('live')} className="text-sm font-medium text-indigo-600 hover:underline">
                                    View All &rarr;
                                </button>
                            </div>
                            {upcomingWebinars.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {upcomingWebinars.map(session => (
                                       <WebinarCard
                                            key={session.id}
                                            session={session}
                                            instructor={props.instructors.find(i => i.id === session.instructorId)}
                                            onJoin={() => setJoiningLiveSession(session)}
                                            onRegister={() => {}} // Simplified for homepage view
                                            onShare={handleShareWebinar}
                                            isRegistered={session.attendeeIds.includes(props.currentUser.id)}
                                            currentUserRole={props.currentUser.role}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                                    <p className="text-slate-500">No upcoming live sessions. Check back soon!</p>
                                </div>
                            )}
                        </div>
                        
                        {/* 1-on-1 Sessions Section */}
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-4">Personalized Coaching</h2>
                            <div 
                                onClick={() => setCurrentPage('sessions')}
                                className="group bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="flex items-center gap-6 text-white">
                                    <div className="hidden sm:block p-4 bg-white/20 rounded-full">
                                        <UsersIcon className="w-10 h-10"/>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-2xl font-bold">Book a 1-on-1 Session</h3>
                                        <p className="text-purple-100 mt-1 max-w-lg">Get dedicated time with an instructor to clarify doubts, discuss strategies, and accelerate your learning.</p>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 px-8 py-3 bg-white text-indigo-700 font-bold rounded-lg group-hover:bg-purple-100 transition-colors duration-300 flex-shrink-0 text-base pointer-events-none">
                                    Book Now &rarr;
                                </div>
                            </div>
                        </div>

                    </div>
                );
        }
    };

    return (
         <div className="flex min-h-screen bg-slate-50">
            <SideNavBar 
                user={props.currentUser} 
                currentPage={currentPage} 
                setCurrentPage={setCurrentPage} 
                onLogout={props.onLogout} 
            />
            <div className="flex-1 flex flex-col w-full overflow-hidden">
                <header className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md sticky top-0 z-30">
                    <div className="flex items-center flex-shrink-0 md:hidden">
                        <AcademicCapIcon className="h-8 w-8"/>
                        <span className="text-lg font-bold ml-2 hidden sm:block">Purple LMS</span>
                    </div>

                    <div className="flex-1 min-w-0">
                        {showSearchBar && (
                            <div className="relative w-full max-w-lg mx-auto">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search for courses..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full bg-indigo-400/50 border-transparent rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-indigo-100 focus:ring-white focus:bg-indigo-400/80"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                        <NotificationBell currentUser={props.currentUser} notifications={props.notifications} setNotifications={props.setNotifications} setCurrentPage={setCurrentPage} />
                        <div className="relative">
                            <button onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)} className="p-1 rounded-full hover:bg-white/20">
                                <Cog6ToothIcon className="w-6 h-6"/>
                            </button>
                            {isSettingsMenuOpen && <AppSettingsMenu onPositionChange={props.setWhatsAppPosition} currentPosition={props.whatsAppPosition} onClose={() => setIsSettingsMenuOpen(false)}/>}
                        </div>
                         <div className="relative">
                             <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="rounded-full hover:bg-white/20">
                                 <UserCircleIcon className="w-8 h-8"/>
                             </button>
                             {isProfileMenuOpen && <UserProfileMenu user={props.currentUser} onLogout={props.onLogout} onClose={() => setIsProfileMenuOpen(false)} />}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
                    {renderContent()}
                </main>
                <div className="md:hidden">
                    <BottomNavBar user={props.currentUser} currentPage={currentPage} setCurrentPage={setCurrentPage} />
                </div>
            </div>
            
            <Modal isOpen={!!viewingCourse} onClose={() => setViewingCourse(null)} title={viewingCourse?.title || 'Course Details'} size="4xl">
                {viewingCourse && (
                    <CourseDetailView
                        course={viewingCourse}
                        student={props.currentUser}
                        progress={myProgress.find(p => p.courseId === viewingCourse.id)}
                        onModuleComplete={(moduleId) => props.onModuleComplete(viewingCourse.id, moduleId)}
                        onQuizComplete={(score) => props.onQuizComplete(viewingCourse.id, score)}
                        onRateCourse={(rating) => props.onRateCourse(viewingCourse.id, rating)}
                        onNotifyInstructorOfCompletion={() => props.onNotifyInstructorOfCompletion(viewingCourse.id)}
                        allQuizzes={props.allQuizzes}
                    />
                )}
            </Modal>
            
            <EnrollmentModal
                isOpen={!!enrollingCourse}
                onClose={() => setEnrollingCourse(null)}
                onSubmit={handleEnrollmentSubmit}
                course={enrollingCourse}
                user={props.currentUser}
            />

            <Modal isOpen={!!joiningLiveSession} onClose={() => setJoiningLiveSession(null)} title={joiningLiveSession?.title || 'Live Session'} size="4xl">
                {joiningLiveSession && <WebinarSession 
                    session={joiningLiveSession} 
                    onClose={() => setJoiningLiveSession(null)} 
                    currentUser={props.currentUser} 
                    users={props.users} 
                    onLeaveFeedback={(session) => openFeedbackModal(session, 'webinar')}
                />}
            </Modal>

            <FeedbackModal 
                isOpen={!!feedbackSession}
                onClose={() => setFeedbackSession(null)}
                onSubmit={handleFeedbackSubmit}
            />
        </div>
    );
};

export default StudentDashboard;