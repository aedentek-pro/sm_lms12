import React, { useState } from 'react';
import { WebinarView } from '../student/WebinarView';
import { LiveSession as LiveSessionType, User, UserRole } from '../../types';
import { StarRating } from './StarRating';

const ParticipantsTable: React.FC<{ session: LiveSessionType; users: User[] }> = ({ session, users }) => {
    const instructor = users.find(u => u.id === session.instructorId);
    let participants = users.filter(user => session.attendeeIds.includes(user.id));

    if (instructor && !participants.some(p => p.id === instructor.id)) {
        participants.push(instructor);
    }
    
    participants.sort((a, b) => {
        if (a.id === instructor?.id) return -1;
        if (b.id === instructor?.id) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Session Participants ({participants.length})</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {participants.map((participant) => (
                            <tr key={participant.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{participant.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{participant.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{participant.email}</td>
                            </tr>
                        ))}
                    </tbody>
                 {participants.length === 0 && (
                    <p className="text-center py-8 text-slate-500">There were no participants in this session.</p>
                )}
            </div>
        </div>
    );
};

interface WebinarSessionProps {
    session: LiveSessionType;
    onClose: () => void;
    currentUser: User;
    users: User[];
    onUploadRecording?: (sessionId: string, file: File) => Promise<void>;
    onLeaveFeedback?: (session: LiveSessionType) => void;
}

export const WebinarSession: React.FC<WebinarSessionProps> = ({ session, onClose, currentUser, users, onUploadRecording, onLeaveFeedback }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const isSessionOver = new Date() > session.endTime;
    const canUpload = (currentUser.role === UserRole.Admin || currentUser.role === UserRole.Instructor) && onUploadRecording;
    
    const userFeedback = session.feedback?.find(f => f.studentId === currentUser.id);
    const canLeaveFeedback = onLeaveFeedback && currentUser.role === UserRole.Student && !userFeedback;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !canUpload) return;
        
        setIsUploading(true);
        setUploadError(null);
        try {
            await onUploadRecording(session.id, selectedFile);
            onClose();
        } catch (error) {
            console.error(error);
            setUploadError("Failed to upload recording. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const renderUploadSection = () => {
        if (!canUpload || !isSessionOver || session.recordingUrl) return null;

        return (
            <div className="mt-6 p-4 border-t border-slate-200">
                <h3 className="text-lg font-semibold text-slate-800">Upload Session Recording</h3>
                <p className="text-sm text-slate-500 mb-4">Upload a recording for students who missed the live session.</p>
                <div className="flex items-center space-x-4">
                     <input
                        id="recording-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="recording-upload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                       {selectedFile ? 'Change File' : 'Choose File'}
                    </label>
                    {selectedFile && <span className="text-sm text-slate-600 truncate">{selectedFile.name}</span>}
                </div>
                {uploadError && <p className="text-sm text-red-500 mt-2">{uploadError}</p>}
                 <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isUploading ? 'Uploading...' : 'Upload Recording'}
                </button>
            </div>
        );
    };
    
    if (!isSessionOver) {
        return <WebinarView onClose={onClose} currentUser={currentUser} session={session} />;
    }

    return (
        <div className="bg-white text-slate-800">
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-2">This session has ended.</h2>
                {!session.recordingUrl && <p className="text-slate-500">A recording may be available soon.</p>}
            </div>
            
            {(canLeaveFeedback || userFeedback) && (
                <div className="px-8 pb-4">
                    <div className="p-4 bg-slate-50 rounded-lg text-center">
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">Your Feedback</h3>
                        {canLeaveFeedback && (
                            <button
                                onClick={() => onLeaveFeedback?.(session)}
                                className="px-6 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
                            >
                                Leave Feedback
                            </button>
                        )}
                        {userFeedback && (
                            <div>
                                <StarRating rating={userFeedback.rating} readOnly className="justify-center"/>
                                <p className="text-sm text-slate-600 mt-2 italic">"{userFeedback.comment}"</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="px-8 pb-8">
                <ParticipantsTable session={session} users={users} />
            </div>
             {renderUploadSection()}
        </div>
    );
};