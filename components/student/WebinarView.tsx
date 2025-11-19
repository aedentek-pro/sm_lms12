import React, { useState, useEffect, useRef } from 'react';
import { User, UserRole, ChatMessage, LiveSession } from '../../types';
import { USERS } from '../../constants';
import { 
    MicrophoneIcon, 
    MicrophoneSlashIcon, 
    VideoCameraIcon, 
    VideoCameraSlashIcon, 
    PhoneXMarkIcon, 
    ChatBubbleBottomCenterTextIcon, 
    XCircleIcon, 
    UserCircleIcon,
    ComputerDesktopIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
    UsersIcon,
    ClipboardDocumentIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon
} from '../icons/Icons';

interface WebinarViewProps {
    onClose: () => void;
    currentUser: User;
    session: LiveSession;
}

const ParticipantsList: React.FC<{ participants: User[], currentUser: User, session: LiveSession }> = ({ participants, currentUser, session }) => {
    const [isCopied, setIsCopied] = useState(false);
    const canManage = currentUser.role === UserRole.Admin || currentUser.role === UserRole.Instructor;

    const handleCopyToClipboard = () => {
        const header = "Name\tRole\tEmail\n";
        const tableBody = participants.map(p => `${p.name}\t${p.role}\t${p.email}`).join('\n');
        navigator.clipboard.writeText(header + tableBody).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleDownloadCsv = () => {
        const header = "Name,Role,Email\n";
        const csvBody = participants.map(p => `"${p.name.replace(/"/g, '""')}","${p.role}","${p.email}"`).join('\n');
        const csvContent = header + csvBody;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `participants-${session.title.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

     return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-slate-700">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-white">Participants ({participants.length})</h3>
                    {canManage && (
                        <div className="flex items-center space-x-2">
                             <button onClick={handleCopyToClipboard} title="Copy as table" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                                {isCopied ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardDocumentIcon className="w-5 h-5" />}
                            </button>
                            <button onClick={handleDownloadCsv} title="Download as CSV" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors">
                                <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex-1 p-2 space-y-1 overflow-y-auto">
                {participants.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-700">
                        <div className="flex items-center space-x-3">
                            <UserCircleIcon className="w-8 h-8 text-slate-500" />
                            <div>
                                <p className="text-sm font-medium text-slate-200">{p.name} {p.id === currentUser.id ? '(You)' : ''}</p>
                                <p className="text-xs text-slate-400">{p.role}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const ChatPanel: React.FC<{
    messages: ChatMessage[];
    currentUser: User;
    onSendMessage: (text: string) => void;
}> = ({ messages, currentUser, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-slate-700">
                <h3 className="font-semibold text-white">Live Chat</h3>
            </div>
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.user.id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`order-2 ${msg.user.id === currentUser.id ? 'items-end' : 'items-start'} flex flex-col max-w-[85%]`}>
                                {msg.user.id !== currentUser.id && (
                                    <p className="text-xs text-slate-400 mb-1 px-1">{msg.user.name}</p>
                                )}
                                <div className={`px-3 py-2 rounded-lg inline-block break-words ${ msg.user.id === currentUser.id ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-100 rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-3 border-t border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2 text-sm text-white placeholder-slate-400"
                            autoComplete="off"
                        />
                        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                            Send
                        </button>
                    </form>
                </div>
        </div>
    );
}


export const WebinarView: React.FC<WebinarViewProps> = ({ onClose, currentUser, session }) => {
    const [permissionStatus, setPermissionStatus] = useState<'idle' | 'pending' | 'granted' | 'denied'>('idle');
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [isMicMuted, setIsMicMuted] = useState(true);
    const [isCameraOff, setIsCameraOff] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [sidebarView, setSidebarView] = useState<'closed' | 'chat' | 'participants'>('chat');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const userVideoRef = useRef<HTMLVideoElement>(null);
    const screenVideoRef = useRef<HTMLVideoElement>(null);
    const mainContainerRef = useRef<HTMLDivElement>(null);
    
    // Effect for cleanup and initial message
    useEffect(() => {
        const welcomeMessage: ChatMessage = {
            id: 'msg-system-1',
            user: { id: 'system', name: 'System', role: UserRole.Admin, email: '' },
            timestamp: new Date(),
            text: `Welcome to "${session.title}"!`,
        };
        setMessages([welcomeMessage]);
    }, [session.title]);
    
    // Effect to request media permissions on mount
    useEffect(() => {
        let stream: MediaStream | null = null;
        
        const requestMediaPermissions = async () => {
            setPermissionStatus('pending');
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                stream = mediaStream;
                
                // Start with tracks disabled for privacy
                stream.getAudioTracks().forEach(track => track.enabled = false);
                stream.getVideoTracks().forEach(track => track.enabled = false);

                setCameraStream(stream);
                setPermissionStatus('granted');
                setError(null);
            } catch (err) {
                setPermissionStatus('denied');
                if (err instanceof Error) {
                    let errorMessage = `Error accessing media devices: ${err.message}.`;
                    if (err.name === 'NotAllowedError') {
                        errorMessage = 'Camera and microphone permissions were denied. Please allow them in your browser settings to use these features.';
                    } else if (err.name === 'NotFoundError') {
                        errorMessage = 'No camera or microphone found. Please connect a device.';
                    }
                    setError(errorMessage);
                } else {
                    setError('An unknown error occurred while accessing media devices.');
                }
            }
        };

        requestMediaPermissions();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Effect to attach camera stream to video element
    useEffect(() => {
        if (cameraStream && userVideoRef.current) {
            userVideoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream, isCameraOff]);

    // Effect to attach screen share stream to video element
    useEffect(() => {
        if (screenStream && screenVideoRef.current) {
            screenVideoRef.current.srcObject = screenStream;
        }
    }, [screenStream, isScreenSharing]);

    // Effect for screen stream cleanup on unmount or when stream changes
    useEffect(() => {
        return () => {
            screenStream?.getTracks().forEach(track => track.stop());
        };
    }, [screenStream]);
    
    // Fullscreen change listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleSendMessage = (text: string) => {
        const message: ChatMessage = {
            id: `msg-${Date.now()}`,
            user: currentUser,
            timestamp: new Date(),
            text: text,
        };
        setMessages(prev => [...prev, message]);
    };

    const toggleMic = () => {
        if (cameraStream) {
            const newMutedState = !isMicMuted;
            cameraStream.getAudioTracks().forEach(track => track.enabled = !newMutedState);
            setIsMicMuted(newMutedState);
        }
    };

    const toggleCamera = () => {
        if (cameraStream) {
            const newCameraState = !isCameraOff;
            cameraStream.getVideoTracks().forEach(track => track.enabled = !newCameraState);
            setIsCameraOff(newCameraState);
        }
    };
    
    const stopScreenShare = () => {
        screenStream?.getTracks().forEach(track => track.stop());
        setScreenStream(null);
        setIsScreenSharing(false);
    }
    
    const handleToggleScreenShare = async () => {
        if (isScreenSharing) {
            stopScreenShare();
        } else {
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const track = stream.getVideoTracks()[0];
                track.onended = () => stopScreenShare(); // Stop when user clicks the browser's "Stop sharing" button
                setScreenStream(stream);
                setIsScreenSharing(true);
            } catch (err) {
                console.error("Screen share error:", err);
            }
        }
    }
    
    const handleToggleSidebar = (view: 'chat' | 'participants') => {
        if (sidebarView === view) {
            setSidebarView('closed');
        } else {
            setSidebarView(view);
        }
    };
    
    const handleToggleFullscreen = () => {
        if (!mainContainerRef.current) return;
        if (!document.fullscreenElement) {
            mainContainerRef.current.requestFullscreen().catch(err => {
                console.error(`Fullscreen error: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const instructor = USERS.find(u => u.id === session.instructorId);
    const participants = session.attendeeIds.map(id => USERS.find(u => u.id === id)).filter(Boolean) as User[];
    if (instructor && !participants.some(p => p.id === instructor.id)) {
        participants.push(instructor);
    }
    if (!participants.some(p => p.id === currentUser.id)) {
         participants.push(currentUser);
    }

    const renderMainContent = () => {
        if (isScreenSharing && screenStream) {
            return <video ref={screenVideoRef} autoPlay className="w-full h-full object-contain" />;
        }
        
        switch (permissionStatus) {
            case 'pending':
                return <p>Requesting camera and microphone access...</p>;
            case 'denied':
                return (
                    <div className="text-center p-4">
                        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <p className="text-red-400 max-w-md">{error}</p>
                    </div>
                );
            case 'granted':
                return (
                    isCameraOff || !cameraStream ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800">
                            <UserCircleIcon className="w-24 h-24 text-slate-600"/>
                            <p className="mt-4 text-slate-400">Your camera is off</p>
                        </div>
                    ) : (
                        <video ref={userVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                    )
                );
            default:
                return null;
        }
    };


    return (
        <div 
            ref={mainContainerRef} 
            className="flex w-full h-full bg-slate-900 text-white font-sans overflow-hidden select-none"
            onContextMenu={(e) => e.preventDefault()}
        >
            <main className="flex-1 flex flex-col relative">
                <header className="absolute top-0 left-0 p-4 z-20">
                    <h2 className="text-lg font-bold">{session.title}</h2>
                </header>
                
                <div className="flex-1 flex items-center justify-center p-4 pt-16 pb-24">
                    <div className="w-full h-full bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                        {renderMainContent()}
                         {!isScreenSharing && permissionStatus === 'granted' && (
                            <span className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg text-sm font-semibold">{currentUser.name} (You)</span>
                         )}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center h-24 z-20">
                    <div className="flex items-center space-x-2 sm:space-x-4 bg-slate-800/80 backdrop-blur-sm p-3 rounded-full shadow-lg">
                         <button onClick={toggleMic} className={`p-3 rounded-full transition-colors ${isMicMuted ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`} title={isMicMuted ? 'Unmute' : 'Mute'} disabled={permissionStatus !== 'granted'}>
                            {isMicMuted ? <MicrophoneSlashIcon className="w-6 h-6"/> : <MicrophoneIcon className="w-6 h-6"/>}
                        </button>
                         <button onClick={toggleCamera} className={`p-3 rounded-full transition-colors ${isCameraOff ? 'bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`} title={isCameraOff ? 'Turn camera on' : 'Turn camera off'} disabled={permissionStatus !== 'granted'}>
                            {isCameraOff ? <VideoCameraSlashIcon className="w-6 h-6"/> : <VideoCameraIcon className="w-6 h-6"/>}
                        </button>
                        <button onClick={handleToggleScreenShare} className={`p-3 rounded-full transition-colors ${isScreenSharing ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'}`} title={isScreenSharing ? 'Stop sharing' : 'Share screen'} disabled={permissionStatus !== 'granted'}>
                            <ComputerDesktopIcon className="w-6 h-6"/>
                        </button>
                        
                        <div className="h-6 w-px bg-slate-600"></div>

                        <button onClick={() => handleToggleSidebar('participants')} className={`p-3 rounded-full transition-colors ${sidebarView === 'participants' ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'}`} title="Participants">
                            <UsersIcon className="w-6 h-6"/>
                        </button>
                        <button onClick={() => handleToggleSidebar('chat')} className={`p-3 rounded-full transition-colors ${sidebarView === 'chat' ? 'bg-indigo-600' : 'bg-slate-700 hover:bg-slate-600'}`} title="Chat">
                            <ChatBubbleBottomCenterTextIcon className="w-6 h-6"/>
                        </button>
                         <button onClick={handleToggleFullscreen} className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors" title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                            {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6"/> : <ArrowsPointingOutIcon className="w-6 h-6"/>}
                        </button>

                        <div className="h-6 w-px bg-slate-600"></div>

                        <button onClick={onClose} className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors" title="Leave session">
                            <PhoneXMarkIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </div>
            </main>

            <aside className={`w-80 bg-slate-800 border-l border-slate-700 flex flex-col transition-all duration-300 ${sidebarView !== 'closed' ? 'ml-0' : 'ml-[-320px] max-w-0 border-l-0'}`}>
                 <div className="p-1 border-b border-slate-700 flex justify-end">
                    <button onClick={() => setSidebarView('closed')} className="text-slate-400 hover:text-white p-1">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                 {sidebarView === 'chat' && (
                    <ChatPanel messages={messages} currentUser={currentUser} onSendMessage={handleSendMessage} />
                )}
                 {sidebarView === 'participants' && (
                    <ParticipantsList participants={participants} currentUser={currentUser} session={session} />
                )}
            </aside>
        </div>
    );
};
