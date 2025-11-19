import React, { useState } from 'react';
import { User, Course, StudentProgress, Notification, ChatMessage, LiveSession, NewCourse, NewLiveSession, OneToOneSession, UserRole, Quiz, LiveSessionProgress } from '../../types';
import { BottomNavBar } from '../shared/BottomNavBar';
import { NotificationBell } from '../shared/NotificationBell';
import { UserCircleIcon, Cog6ToothIcon, AcademicCapIcon, MagnifyingGlassIcon, UsersIcon, StarIcon, ClockIcon, PlusCircleIcon, VideoCameraIcon, ChatBubbleLeftRightIcon } from '../icons/Icons';
import CourseListPage from '../pages/CourseListPage';
import WebinarListPage from '../pages/WebinarListPage';
import CommunityPage from '../pages/CommunityPage';
import OneToOnePage from '../pages/OneToOnePage';
import { AppSettingsMenu } from '../shared/AppSettingsMenu';
import { UserProfileMenu } from '../shared/UserProfileMenu';
import { SideNavBar } from '../shared/SideNavBar';
import { BannerCarousel } from '../shared/BannerCarousel';
import { BANNERS } from '../../constants';
import { Card } from '../shared/Card';
import { CourseCard } from '../shared/CourseCard';

interface DashboardProps {
    currentUser: User;
    onLogout: () => void;
    allCourses: Course[];
    allQuizzes: Quiz[];
    instructors: User[];
    studentProgress: StudentProgress[];
    onCreateCourse: (courseData: NewCourse) => void;
    onDeleteCourse: (courseId: string) => void;
    onIssueCertificate: (courseId: string, studentId: string) => void;
    notifications: Notification[];
    setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
    chatMessages: ChatMessage[];
    onSendMessage: (text: string) => void;
    allLiveSessions: LiveSession[];
    onCreateLiveSession: (sessionData: NewLiveSession) => void;
    onUpdateLiveSession: (sessionData: NewLiveSession) => void;
    onDeleteLiveSession: (sessionId: string) => void;
    sessions: OneToOneSession[];
    users: User[];
    students: User[];
    onCreateSession: (studentId: string, instructorId: string, dateTime: Date) => void;
    onUpdateSession: (sessionId: string, studentId: string, instructorId: string, dateTime: Date) => void;
    onCancelSession: (sessionId: string) => void;
    whatsAppPosition: string;
    setWhatsAppPosition: (position: string) => void;
    onAcceptSession: (sessionId: string) => void;
    onRejectSession: (sessionId: string) => void;
    onRegisterForWebinar: (sessionId: string) => void;
    onUploadWebinarRecording: (sessionId: string, file: File) => Promise<void>;
    liveSessionProgress: LiveSessionProgress[];
    onLiveSessionQuizComplete: (sessionId: string, score: number) => void;
}

const InstructorDashboard: React.FC<DashboardProps> = (props) => {
    const [currentPage, setCurrentPage] = useState('home');
    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const showSearchBar = ['home', 'courses'].includes(currentPage);
    
    const handleBannerClick = (link: string) => {
        const courseExists = props.allCourses.some(c => c.id === link);
        if (courseExists) {
            // This might need a modal, but for now, let's navigate to the courses page.
            setCurrentPage('courses');
        } else {
            setCurrentPage(link);
        }
    };

    const renderContent = () => {
        const courseListProps = {
             currentUser: props.currentUser,
            instructors: props.instructors,
            studentProgress: props.studentProgress,
            onCreateCourse: props.onCreateCourse,
            onDeleteCourse: props.onDeleteCourse,
            onIssueCertificate: props.onIssueCertificate,
            students: props.students,
            allQuizzes: props.allQuizzes,
            // Dummy/unused props for instructor view
            onModuleComplete: () => {},
            onQuizComplete: () => {},
            onAssignmentSubmit: () => {},
            onRateCourse: () => {},
            onEnrollInCourse: () => {},
            onNotifyInstructorOfCompletion: () => {},
            searchTerm,
        };

        switch (currentPage) {
            case 'courses':
                return <CourseListPage 
                    {...courseListProps}
                    allCourses={props.allCourses}
                />;
            case 'live':
                 return <WebinarListPage
                    currentUser={props.currentUser}
                    allLiveSessions={props.allLiveSessions}
                    instructors={props.instructors}
                    onCreateLiveSession={props.onCreateLiveSession}
                    onUpdateLiveSession={props.onUpdateLiveSession}
                    onDeleteLiveSession={props.onDeleteLiveSession}
                    onRegisterForWebinar={props.onRegisterForWebinar}
                    onUploadWebinarRecording={props.onUploadWebinarRecording}
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
                    // FIX: Add missing onLeaveFeedback prop with a dummy function.
                    onLeaveFeedback={() => {}}
                 />;
            case 'home':
            default:
                const myCourses = props.allCourses.filter(c => c.instructorId === props.currentUser.id);
                const instructorBanners = BANNERS.filter(b => !b.roles || b.roles.includes(UserRole.Instructor));
                
                const myCourseIds = myCourses.map(c => c.id);
                const myStudentsCount = new Set(props.studentProgress.filter(p => myCourseIds.includes(p.courseId)).map(p => p.studentId)).size;

                const myRatedCourses = myCourses.filter(c => c.rating && c.totalRatings && c.totalRatings > 0);
                const myAverageRating = myRatedCourses.length > 0
                    ? myRatedCourses.reduce((acc, c) => acc + (c.rating || 0), 0) / myRatedCourses.length
                    : 0;

                const pendingRequests = props.sessions.filter(s => s.instructorId === props.currentUser.id && s.status === 'pending');

                return (
                    <div className="space-y-8">
                        <BannerCarousel banners={instructorBanners} currentUser={props.currentUser} onCtaClick={handleBannerClick} />

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="p-5 flex items-center space-x-4"><div className="p-3 bg-violet-100 rounded-full"><UsersIcon className="w-6 h-6 text-violet-600"/></div><div><h3 className="text-slate-500">Total Students</h3><p className="text-2xl font-bold text-slate-800">{myStudentsCount}</p></div></Card>
                            <Card className="p-5 flex items-center space-x-4"><div className="p-3 bg-violet-100 rounded-full"><AcademicCapIcon className="w-6 h-6 text-violet-600"/></div><div><h3 className="text-slate-500">Courses Published</h3><p className="text-2xl font-bold text-slate-800">{myCourses.length}</p></div></Card>
                            <Card className="p-5 flex items-center space-x-4"><div className="p-3 bg-violet-100 rounded-full"><StarIcon className="w-6 h-6 text-violet-600"/></div><div><h3 className="text-slate-500">Average Rating</h3><p className="text-2xl font-bold text-slate-800">{myAverageRating.toFixed(1)}</p></div></Card>
                            <Card className="p-5 flex items-center space-x-4"><div className="p-3 bg-violet-100 rounded-full"><ClockIcon className="w-6 h-6 text-violet-600"/></div><div><h3 className="text-slate-500">Pending Requests</h3><p className="text-2xl font-bold text-slate-800">{pendingRequests.length}</p></div></Card>
                        </div>
                        
                        {/* My Courses & Pending Requests */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-2xl font-bold text-slate-800">My Courses</h2>
                                    <button onClick={() => setCurrentPage('courses')} className="text-sm font-medium text-indigo-600 hover:underline">
                                        Manage All &rarr;
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {myCourses.slice(0, 4).map(course => (
                                        <CourseCard 
                                            key={course.id}
                                            course={course}
                                            instructor={props.currentUser}
                                            userRole={props.currentUser.role}
                                            onClick={() => setCurrentPage('courses')}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-6">
                                {pendingRequests.length > 0 && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800 mb-4">Pending 1-on-1s</h2>
                                        <Card className="p-4 space-y-3">
                                        {pendingRequests.slice(0, 3).map(req => (
                                            <div key={req.id} className="text-sm">
                                                <p><span className="font-semibold">{props.students.find(s => s.id === req.studentId)?.name || '...'}</span> requested a session.</p>
                                                <p className="text-slate-500 text-xs">{req.dateTime.toLocaleString()}</p>
                                            </div>
                                        ))}
                                        <button onClick={() => setCurrentPage('sessions')} className="text-sm font-bold text-indigo-600 hover:underline mt-2">View All Requests</button>
                                        </Card>
                                    </div>
                                )}
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
        </div>
    );
};

export default InstructorDashboard;