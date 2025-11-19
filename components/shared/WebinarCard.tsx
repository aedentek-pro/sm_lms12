import React, { useMemo } from 'react';
// FIX: Import Quiz and LiveSessionProgress types to use in props.
import { LiveSession, User, UserRole, Quiz, LiveSessionProgress } from '../../types';
import { Card } from './Card';
import { VideoCameraIcon, UsersIcon, WhatsAppIcon, PencilIcon } from '../icons/Icons';
import { StarRating } from './StarRating';

interface LiveSessionCardProps {
    session: LiveSession;
    instructor: User | undefined;
    onEdit?: (session: LiveSession) => void;
    onJoin: (session: LiveSession) => void;
    onRegister: (session: LiveSession) => void;
    onViewAttendees?: (session: LiveSession) => void;
    onViewRecording?: (session: LiveSession) => void;
    onShare?: (session: LiveSession) => void;
    isRegistered: boolean;
    currentUserRole: UserRole;
    // FIX: Add props for quiz functionality.
    quiz?: Quiz;
    sessionProgress?: LiveSessionProgress;
    onTakeQuiz?: (session: LiveSession) => void;
}

export const WebinarCard: React.FC<LiveSessionCardProps> = ({ session, instructor, onEdit, onJoin, onRegister, onViewAttendees, onViewRecording, onShare, isRegistered, currentUserRole, quiz, sessionProgress, onTakeQuiz }) => {
    const isPaid = session.price && session.price > 0;
    const canManage = currentUserRole === UserRole.Admin || currentUserRole === UserRole.Instructor;
    
    const isPast = new Date() > session.endTime;
    const canJoin = new Date() >= new Date(session.dateTime.getTime() - 15 * 60 * 1000) && !isPast;

    const averageRating = useMemo(() => {
        if (!session.feedback || session.feedback.length === 0) {
            return 0;
        }
        const total = session.feedback.reduce((sum, f) => sum + f.rating, 0);
        return total / session.feedback.length;
    }, [session.feedback]);

    const dateString = useMemo(() => {
        const start = session.dateTime;
        const end = session.endTime;

        if (!end) { // Fallback for old data
            return start.toLocaleString();
        }

        const areOnSameDay = start.getFullYear() === end.getFullYear() &&
          start.getMonth() === end.getMonth() &&
          start.getDate() === end.getDate();

        if (areOnSameDay) {
          return `${start.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})} - ${end.toLocaleString([], {timeStyle: 'short'})}`;
        } else {
          return `${start.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})} - ${end.toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}`;
        }
    }, [session.dateTime, session.endTime]);


    const renderPriceBadge = () => {
        if (isPast && averageRating > 0) {
            return (
                <div className="absolute top-4 right-4 flex items-center bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold">
                    <StarRating rating={averageRating} readOnly />
                    <span className="ml-1 text-slate-600">({session.feedback?.length})</span>
                </div>
            )
        }
        
        const text = isPaid ? `₹${session.price!.toLocaleString('en-IN')}` : 'Free';
        const colorClasses = isPaid 
            ? 'bg-indigo-100 text-indigo-800 border-indigo-200' 
            : 'bg-green-100 text-green-800 border-green-200';

        return (
            <div className={`absolute top-4 right-4 px-3 py-1 text-sm font-bold rounded-full border ${colorClasses}`}>
                {text}
            </div>
        );
    };
    
    const renderActionButtons = () => {
        if (isPast && session.recordingUrl && (isRegistered || canManage) && onViewRecording) {
            return (
                <button
                    onClick={() => onViewRecording(session)}
                    className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-slate-600 rounded-md hover:bg-slate-700 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    <VideoCameraIcon className="w-4 h-4 mr-2"/>
                    View Recording
                </button>
            );
        }

        if (isPast && quiz && isRegistered && onTakeQuiz && (!sessionProgress || sessionProgress.quizScore === null)) {
            return (
                <button
                    onClick={() => onTakeQuiz(session)}
                    className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-md hover:bg-amber-600 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                    Take Quiz
                </button>
            );
        }

        if (sessionProgress?.quizScore !== null && sessionProgress?.quizScore !== undefined) {
            return <p className="text-sm text-slate-500 font-medium">Quiz Score: {sessionProgress.quizScore}%</p>;
        }

        if (isRegistered) {
            if (canJoin) {
                return (
                     <button
                        onClick={() => onJoin(session)}
                        className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                        <VideoCameraIcon className="w-4 h-4 mr-2"/>
                        Join Session
                    </button>
                );
            }
             return (
                 <button
                    disabled
                    className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-slate-400 rounded-md cursor-not-allowed"
                >
                    Registered
                </button>
            );
        }

        if (isPast) {
             return <p className="text-sm text-slate-500 font-medium">Session Ended</p>;
        }
        
        return (
            <button
                onClick={() => onRegister(session)}
                className="flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition-all duration-300 shadow-sm hover:shadow-md"
            >
                {isPaid ? `Register for ₹${session.price!.toLocaleString('en-IN')}` : 'Register for Free'}
            </button>
        );
    }

    return (
        <Card className="flex flex-col justify-between h-full">
            <div className="p-5 flex-grow relative">
                {renderPriceBadge()}
                <h3 className="text-xl font-bold text-slate-800 mb-2 pr-20">{session.title}</h3>
                <p className="text-slate-600 text-sm mb-4 flex-grow">{session.description}</p>
                <p className="text-sm text-slate-500">
                    Host: <span className="font-medium text-indigo-600">{instructor?.name || 'Unknown'}</span>
                </p>
                <p className="text-sm text-slate-500 mt-1">
                    Date: <span className="font-medium text-slate-700">{dateString}</span>
                </p>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    {canManage && onEdit && (
                         <button
                            onClick={(e) => { e.stopPropagation(); onEdit(session); }}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                            title="Edit Session"
                        >
                            <PencilIcon className="w-5 h-5" />
                        </button>
                    )}
                    {canManage && onViewAttendees && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onViewAttendees(session); }}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            title="View Attendees"
                        >
                            <UsersIcon className="w-5 h-5" />
                        </button>
                    )}
                    {onShare && (
                         <button
                            onClick={(e) => { e.stopPropagation(); onShare(session); }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                            title="Share on WhatsApp"
                        >
                            <WhatsAppIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {renderActionButtons()}
                </div>
            </div>
        </Card>
    );
};