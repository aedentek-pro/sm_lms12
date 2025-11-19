import React, { useState, useEffect, useRef } from 'react';
import { Course, Module, User, StudentProgress, Quiz } from '../../types';
import { BookOpenIcon, CheckCircleIcon, VideoCameraIcon, AcademicCapIcon, ArrowLeftIcon, ArrowRightIcon, Bars3Icon, XCircleIcon } from '../icons/Icons';
import { QuizView } from './QuizView';
import { CertificateView } from './CertificateView';
import { Modal } from '../shared/Modal';
import { InstructorProfileCard } from '../shared/InstructorProfileCard';
import { USERS } from '../../constants';
import { StarRating } from '../shared/StarRating';
import { db } from '../../db';
import { VideoPlayer } from '../shared/VideoPlayer';


interface CourseDetailViewProps {
  course: Course;
  student: User;
  progress: StudentProgress | undefined;
  onModuleComplete: (moduleId: string) => void;
  onQuizComplete: (score: number) => void;
  onRateCourse: (rating: number) => void;
  onNotifyInstructorOfCompletion: (courseId: string) => void;
  allQuizzes: Quiz[];
}

type ViewState = 'modules' | 'quiz' | 'assignment';

export const CourseDetailView: React.FC<CourseDetailViewProps> = ({ course, student, progress, onModuleComplete, onQuizComplete, onRateCourse, onNotifyInstructorOfCompletion, allQuizzes }) => {
    const [activeModule, setActiveModule] = useState<Module | null>(course.modules[0] || null);
    const [viewState, setViewState] = useState<ViewState>('modules');
    const [showCertificateModal, setShowCertificateModal] = useState(false);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [contactMessage, setContactMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);


    const viewContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };

        const container = viewContainerRef.current;
        if (container) {
            container.addEventListener('contextmenu', handleContextMenu);
        }

        return () => {
            if (container) {
                container.removeEventListener('contextmenu', handleContextMenu);
            }
        };
    }, []);

    const courseQuiz = allQuizzes.find(q => q.id === course.quizId);
    const completedModules = progress?.completedModules || [];
    const quizScore = progress?.quizScore;
    
    const allModulesCompleted = course.modules.every(m => completedModules.includes(m.id));
    const quizPassed = quizScore !== null && quizScore !== undefined;

    const courseCompleted = allModulesCompleted && quizPassed;
    const canGetCertificate = progress?.certificateIssued || false;

    const activeModuleIndex = course.modules.findIndex(m => m.id === activeModule?.id);

    const watermarkText = `${student.name} | ${student.email}${student.phoneNumber ? ` | ${student.phoneNumber}` : ''}`;

    const handlePreviousModule = () => {
        if (activeModuleIndex > 0) {
            setActiveModule(course.modules[activeModuleIndex - 1]);
        }
    };

    const handleNextModule = () => {
        if (activeModuleIndex < course.modules.length - 1) {
            setActiveModule(course.modules[activeModuleIndex + 1]);
        }
    };

    const handleQuizComplete = (score: number) => {
        onQuizComplete(score);
        setViewState('modules'); // Return to module list after quiz
    };

    const instructor = USERS.find(u => u.id === course.instructorId);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactMessage.trim()) {
            alert('Please enter a message.');
            return;
        }
        setIsSending(true);
        // Simulate API call
        setTimeout(() => {
            console.log(`Sending message to ${instructor?.id}: ${contactMessage}`);
            alert('Message sent successfully!');
            setIsSending(false);
            setIsContactModalOpen(false);
            setContactMessage('');
        }, 1000);
    };
    
    const renderModuleContent = (module: Module) => {
        if (module.type === 'video') {
            // FIX: The VideoPlayer component expects a 'video' prop with type: 'video'.
            // To resolve the type mismatch with the broader 'Module' type, we create a new
            // object that explicitly matches the expected prop shape.
            return (
                <VideoPlayer video={{ title: module.title, content: module.content, type: 'video' }} watermark={watermarkText} />
            );
        }
        return <div className="prose max-w-none p-4 bg-slate-50 rounded-lg border">{module.content}</div>;
    }

    const renderMainContent = () => {
        switch (viewState) {
            case 'quiz':
                if (!courseQuiz) return <p>Quiz not found for this course.</p>;
                return <QuizView quiz={courseQuiz} onComplete={handleQuizComplete} />;
            case 'modules':
            default:
                if (!activeModule) return <p>Select a module to begin.</p>;
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-4">{activeModule.title}</h2>
                        {renderModuleContent(activeModule)}
                        <div className="mt-6 flex justify-between items-center">
                            <button 
                                onClick={handlePreviousModule}
                                disabled={activeModuleIndex <= 0}
                                className="inline-flex items-center px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ArrowLeftIcon className="w-4 h-4 mr-2"/>
                                Previous
                            </button>
                             <div className="flex items-center space-x-4">
                                {!completedModules.includes(activeModule.id) ? (
                                    <button onClick={() => onModuleComplete(activeModule.id)} className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700">
                                        Mark as Complete
                                    </button>
                                 ) : (
                                    <div className="inline-flex items-center text-teal-600 font-semibold">
                                        <CheckCircleIcon className="w-6 h-6 mr-2" />
                                        <span>Completed</span>
                                    </div>
                                 )}
                                 <button 
                                    onClick={handleNextModule}
                                    disabled={activeModuleIndex >= course.modules.length - 1}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                    <ArrowRightIcon className="w-4 h-4 ml-2"/>
                                </button>
                            </div>
                        </div>
                         <p className="text-xs text-slate-400 mt-4 text-center">
                            Note: Course content is protected. Downloading, screen recording, or unauthorized distribution is strictly prohibited.
                        </p>
                    </div>
                )
        }
    };

    return (
        <div ref={viewContainerRef} className="flex flex-col md:flex-row -m-6 max-h-[calc(90vh-100px)] select-none bg-white">
            {/* Mobile Drawer Backdrop */}
            {isDrawerOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsDrawerOpen(false)}
                    aria-hidden="true"
                />
            )}
            <aside 
                className={`w-full max-w-xs md:w-1/3 lg:w-1/4 bg-slate-50 border-r border-slate-200 p-4 flex flex-col justify-between fixed md:relative inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
            >
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex justify-between items-center mb-4 md:hidden">
                        <p className="px-2 text-sm font-semibold text-slate-500 uppercase">Course Menu</p>
                        <button onClick={() => setIsDrawerOpen(false)} className="text-slate-500 hover:text-slate-800">
                            <XCircleIcon className="w-7 h-7" />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        <nav className="space-y-2">
                            <p className="hidden md:block px-2 text-sm font-semibold text-slate-500 uppercase">Course Content</p>
                            {course.modules.map(module => (
                                <button key={module.id} onClick={() => { setActiveModule(module); setViewState('modules'); setIsDrawerOpen(false); }} 
                                    className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${activeModule?.id === module.id && viewState === 'modules' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-slate-200'}`}
                                >
                                    {module.type === 'text' ? <BookOpenIcon className="w-5 h-5 mr-3 flex-shrink-0"/> : <VideoCameraIcon className="w-5 h-5 mr-3 flex-shrink-0"/>}
                                    <span className="flex-1 text-sm">{module.title}</span>
                                    {completedModules.includes(module.id) && <CheckCircleIcon className="w-5 h-5 text-teal-500 flex-shrink-0 ml-2" />}
                                </button>
                            ))}
                            <hr className="my-2"/>
                            <button onClick={() => { setViewState('quiz'); setIsDrawerOpen(false); }}
                                className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${viewState === 'quiz' ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-slate-200'}`}
                                disabled={!allModulesCompleted}
                            >
                                <span className="flex-1 text-sm font-semibold">Final Quiz</span>
                                {quizPassed && <CheckCircleIcon className="w-5 h-5 text-teal-500 flex-shrink-0 ml-2" />}
                            </button>
                            <hr className="my-2"/>
                            {courseCompleted && !progress?.completionNotified && (
                                <button onClick={() => onNotifyInstructorOfCompletion(course.id)} className="w-full text-left flex items-center p-3 rounded-lg font-semibold bg-blue-100 text-blue-800 hover:bg-blue-200">
                                    Notify Instructor
                                </button>
                            )}
                            {progress?.completionNotified && !progress?.certificateIssued && (
                                <p className="p-3 text-sm text-slate-500 bg-slate-100 rounded-lg">Instructor notified. Certificate pending.</p>
                            )}
                            <button onClick={() => setShowCertificateModal(true)} 
                                className="w-full text-left flex items-center p-3 rounded-lg font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                disabled={!canGetCertificate}
                            >
                                <AcademicCapIcon className="w-5 h-5 mr-3" />
                                Get Certificate
                            </button>
                            {canGetCertificate && (
                                <div className="mt-4 p-3 bg-white rounded-lg border text-center">
                                    {progress?.rating ? (
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 mb-2">Your Rating</p>
                                            <StarRating rating={progress.rating} readOnly className="justify-center"/>
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 mb-2">Rate this course</p>
                                            <StarRating rating={0} onRatingChange={onRateCourse} className="justify-center"/>
                                        </div>
                                    )}
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
                {instructor && <div className="mt-4 flex-shrink-0"><InstructorProfileCard instructor={instructor} onContactInstructor={() => setIsContactModalOpen(true)} /></div>}
            </aside>
            <main className="flex-1 p-6 overflow-y-auto">
                 <div className="md:hidden mb-4">
                    <button 
                        onClick={() => setIsDrawerOpen(true)} 
                        className="inline-flex items-center gap-2 p-2 rounded-md bg-slate-100 hover:bg-slate-200 text-sm text-slate-700 font-semibold"
                        aria-label="Open course menu"
                    >
                        <Bars3Icon className="w-6 h-6" />
                        Course Menu
                    </button>
                </div>
                {renderMainContent()}
            </main>
            
            <Modal isOpen={showCertificateModal} onClose={() => setShowCertificateModal(false)} title="Your Certificate" size="2xl">
                <CertificateView course={course} student={student} />
            </Modal>
            
            {instructor && (
                <Modal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} title={`Contact ${instructor.name}`}>
                    <form onSubmit={handleSendMessage} className="space-y-4">
                        <div>
                            <label htmlFor="contact-message" className="block mb-2 text-sm font-medium text-slate-700">Your Message</label>
                            <textarea
                                id="contact-message"
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                rows={6}
                                className="bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                                placeholder={`Ask ${instructor.name.split(' ')[0]} a question...`}
                                required
                            />
                        </div>
                        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                            <button type="button" onClick={() => setIsContactModalOpen(false)} className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 disabled:opacity-50" disabled={isSending}>Cancel</button>
                            <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg disabled:opacity-50 flex items-center" disabled={isSending}>
                                {isSending ? (
                                    <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Sending...</>
                                ) : (
                                    'Send Message'
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

        </div>
    );
};
