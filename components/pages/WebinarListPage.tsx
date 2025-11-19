import React, { useState } from 'react';
import { LiveSession, User, UserRole, NewLiveSession, Quiz, LiveSessionProgress } from '../../types';
import { WebinarCard } from '../shared/WebinarCard';
import { Modal } from '../shared/Modal';
import { WebinarCreationForm } from '../forms/WebinarCreationForm';
import { WebinarSession } from '../shared/WebinarSession';
import { WebinarRegistrationModal } from '../student/WebinarRegistrationModal';
import { WebinarAttendeesModal } from '../shared/WebinarAttendeesModal';
import { VideoPlayer } from '../shared/VideoPlayer';
import { QuizView } from '../student/QuizView';

interface LiveSessionListPageProps {
    currentUser: User;
    allLiveSessions: LiveSession[];
    allQuizzes: Quiz[];
    liveSessionProgress: LiveSessionProgress[];
    instructors: User[];
    users: User[];
    onCreateLiveSession: (sessionData: NewLiveSession) => void;
    onUpdateLiveSession: (sessionData: NewLiveSession) => void;
    onDeleteLiveSession: (sessionId: string) => void;
    onRegisterForWebinar: (sessionId: string) => void;
    onUploadWebinarRecording: (sessionId: string, file: File) => Promise<void>;
    onLeaveFeedback?: (session: LiveSession) => void;
    onLiveSessionQuizComplete: (sessionId: string, score: number) => void;
}

const WebinarListPage: React.FC<LiveSessionListPageProps> = ({ currentUser, allLiveSessions, instructors, users, onCreateLiveSession, onUpdateLiveSession, onDeleteLiveSession, onRegisterForWebinar, onUploadWebinarRecording, onLeaveFeedback, allQuizzes, liveSessionProgress, onLiveSessionQuizComplete }) => {
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
    const [joiningLiveSession, setJoiningLiveSession] = useState<LiveSession | null>(null);
    const [registeringSession, setRegisteringSession] = useState<LiveSession | null>(null);
    const [viewingAttendeesSession, setViewingAttendeesSession] = useState<LiveSession | null>(null);
    const [viewingRecordingSession, setViewingRecordingSession] = useState<LiveSession | null>(null);
    const [takingQuizSession, setTakingQuizSession] = useState<LiveSession | null>(null);

    const canCreate = currentUser.role === UserRole.Admin || currentUser.role === UserRole.Instructor;

    const handleFormSubmit = (sessionData: NewLiveSession) => {
        if (sessionData.id) {
            onUpdateLiveSession(sessionData);
        } else {
            onCreateLiveSession(sessionData);
        }
        setIsCreationModalOpen(false);
        setEditingSession(null);
    };

    const handleEditClick = (session: LiveSession) => {
        setEditingSession(session);
        setIsCreationModalOpen(true);
    };

    const getInstructorForLiveSession = (instructorId: string) => {
        return instructors.find(i => i.id === instructorId);
    };

    const handleRegistrationSubmit = () => {
        if (registeringSession) {
            onRegisterForWebinar(registeringSession.id);
            setRegisteringSession(null);
        }
    };

    const handleShare = (session: LiveSession) => {
        const message = `Check out this upcoming webinar on Purple LMS!\n\n*${session.title}*\n*Date:* ${session.dateTime.toLocaleString()}\n\nJoin here: ${window.location.href}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    const handleQuizComplete = (score: number) => {
        if (takingQuizSession) {
            onLiveSessionQuizComplete(takingQuizSession.id, score);
            setTakingQuizSession(null);
        }
    };

    const quizForTakingSession = takingQuizSession?.quizId ? allQuizzes.find(q => q.id === takingQuizSession.quizId) : null;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Upcoming Live Sessions</h1>
                {canCreate && (
                    <button
                        onClick={() => { setEditingSession(null); setIsCreationModalOpen(true); }}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        + Schedule Live Session
                    </button>
                )}
            </div>

            {allLiveSessions.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {allLiveSessions.map(session => {
                        const quiz = session.quizId ? allQuizzes.find(q => q.id === session.quizId) : undefined;
                        const sessionProgress = liveSessionProgress.find(p => p.sessionId === session.id && p.studentId === currentUser.id);

                        return (
                            <WebinarCard
                                key={session.id}
                                session={session}
                                instructor={getInstructorForLiveSession(session.instructorId)}
                                onJoin={setJoiningLiveSession}
                                onRegister={setRegisteringSession}
                                onEdit={canCreate ? handleEditClick : undefined}
                                onViewAttendees={setViewingAttendeesSession}
                                onViewRecording={setViewingRecordingSession}
                                onShare={handleShare}
                                isRegistered={session.attendeeIds.includes(currentUser.id)}
                                currentUserRole={currentUser.role}
                                quiz={quiz}
                                sessionProgress={sessionProgress}
                                onTakeQuiz={setTakingQuizSession}
                            />
                        );
                    })}
                </div>
            ) : (
                 <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <p className="text-slate-500">No upcoming live sessions scheduled.</p>
                </div>
            )}
            
            <Modal isOpen={isCreationModalOpen} onClose={() => { setIsCreationModalOpen(false); setEditingSession(null); }} title={editingSession ? 'Edit Live Session' : 'Schedule a New Live Session'}>
                <WebinarCreationForm
                    sessionToEdit={editingSession}
                    currentUser={currentUser}
                    instructors={instructors}
                    onSubmit={handleFormSubmit}
                    onCancel={() => { setIsCreationModalOpen(false); setEditingSession(null); }}
                    // FIX: Pass allQuizzes prop to the creation form.
                    allQuizzes={allQuizzes}
                />
            </Modal>
            
            <Modal isOpen={!!joiningLiveSession} onClose={() => setJoiningLiveSession(null)} title={joiningLiveSession?.title || 'Live Session'} size="4xl">
                {joiningLiveSession && <WebinarSession session={joiningLiveSession} onClose={() => setJoiningLiveSession(null)} currentUser={currentUser} onUploadRecording={onUploadWebinarRecording} users={users} onLeaveFeedback={onLeaveFeedback} />}
            </Modal>

            <WebinarRegistrationModal
                isOpen={!!registeringSession}
                onClose={() => setRegisteringSession(null)}
                onSubmit={handleRegistrationSubmit}
                session={registeringSession}
            />

            <WebinarAttendeesModal
                isOpen={!!viewingAttendeesSession}
                onClose={() => setViewingAttendeesSession(null)}
                session={viewingAttendeesSession}
                users={users}
            />

            <Modal isOpen={!!viewingRecordingSession} onClose={() => setViewingRecordingSession(null)} title={`Recording: ${viewingRecordingSession?.title}`} size="4xl">
                {viewingRecordingSession && viewingRecordingSession.recordingUrl && (
                    <VideoPlayer
                        video={{ title: viewingRecordingSession.title, content: viewingRecordingSession.recordingUrl, type: 'video' }}
                        watermark={`${currentUser.name} | ${currentUser.email}`}
                    />
                )}
            </Modal>

            <Modal isOpen={!!takingQuizSession} onClose={() => setTakingQuizSession(null)} title={quizForTakingSession?.title || 'Session Quiz'}>
                {quizForTakingSession ? (
                    <QuizView quiz={quizForTakingSession} onComplete={handleQuizComplete} />
                ) : (
                    <p className="text-center text-slate-500">Quiz could not be loaded.</p>
                )}
            </Modal>
        </div>
    );
};

export default WebinarListPage;
