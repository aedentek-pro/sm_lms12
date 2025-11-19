import React, { useState, useEffect } from 'react';
// FIX: Import Quiz type to use in props.
import { User, UserRole, NewLiveSession, LiveSession, Quiz } from '../../types';

interface LiveSessionCreationFormProps {
    sessionToEdit?: LiveSession | null;
    currentUser: User;
    instructors: User[];
    onSubmit: (sessionData: NewLiveSession) => void;
    onCancel: () => void;
    // FIX: Add allQuizzes to props to allow selecting a quiz.
    allQuizzes: Quiz[];
}

export const WebinarCreationForm: React.FC<LiveSessionCreationFormProps> = ({ sessionToEdit, currentUser, instructors, onSubmit, onCancel, allQuizzes }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [instructorId, setInstructorId] = useState(currentUser.role === UserRole.Instructor ? currentUser.id : '');
    const [price, setPrice] = useState<number | string>('');
    const [quizId, setQuizId] = useState<string>('');
    
    const isEditMode = !!sessionToEdit;

    useEffect(() => {
        if (isEditMode && sessionToEdit) {
            setTitle(sessionToEdit.title);
            setDescription(sessionToEdit.description);
            
            const d = new Date(sessionToEdit.dateTime);
            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
            setDateTime(d.toISOString().slice(0, 16));

            if (sessionToEdit.endTime) {
                const e = new Date(sessionToEdit.endTime);
                e.setMinutes(e.getMinutes() - e.getTimezoneOffset());
                setEndTime(e.toISOString().slice(0, 16));
            }

            setInstructorId(sessionToEdit.instructorId);
            setPrice(sessionToEdit.price || '');
            setQuizId(sessionToEdit.quizId || '');
        } else {
            setTitle('');
            setDescription('');
            setDateTime('');
            setEndTime('');
            setInstructorId(currentUser.role === UserRole.Instructor ? currentUser.id : '');
            setPrice('');
            setQuizId('');
        }
    }, [sessionToEdit, isEditMode, currentUser]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !dateTime || !endTime || !instructorId) {
            alert('Please fill out all fields.');
            return;
        }
        if (new Date(endTime) <= new Date(dateTime)) {
            alert('End time must be after the start time.');
            return;
        }
        onSubmit({ id: sessionToEdit?.id, title, description, dateTime, endTime, instructorId, price: Number(price) || undefined, quizId: quizId || undefined });
    };

    const inputStyles = "w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="webinar-title" className="block mb-2 text-sm font-medium text-slate-700">Live Session Title</label>
                <input 
                    id="webinar-title" 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className={inputStyles} 
                    required 
                />
            </div>
             <div>
                <label htmlFor="webinar-description" className="block mb-2 text-sm font-medium text-slate-700">Description</label>
                <textarea 
                    id="webinar-description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={3} 
                    className={inputStyles} 
                    required 
                />
            </div>
             <div>
                <label htmlFor="webinar-datetime" className="block mb-2 text-sm font-medium text-slate-700">Start Time</label>
                <input 
                    id="webinar-datetime"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className={inputStyles} 
                    required
                />
            </div>
             <div>
                <label htmlFor="webinar-endtime" className="block mb-2 text-sm font-medium text-slate-700">End Time</label>
                <input 
                    id="webinar-endtime"
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={inputStyles} 
                    required
                />
            </div>
             <div>
                <label htmlFor="webinar-price" className="block mb-2 text-sm font-medium text-slate-700">Price (₹) - leave empty for free</label>
                <input
                    id="webinar-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputStyles}
                    placeholder="e.g., 999"
                    step="1"
                    min="0"
                />
            </div>
            {currentUser.role === UserRole.Admin && (
                <div>
                    <label htmlFor="instructor-select" className="block mb-2 text-sm font-medium text-slate-700">Instructor</label>
                    <select 
                        id="instructor-select" 
                        value={instructorId} 
                        onChange={e => setInstructorId(e.target.value)} 
                        required 
                        className={inputStyles}
                    >
                        <option value="" disabled>Select an instructor</option>
                        {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                    </select>
                </div>
            )}
            <div>
                <label htmlFor="webinar-quiz" className="block mb-2 text-sm font-medium text-slate-700">Associated Quiz (Optional)</label>
                <select 
                    id="webinar-quiz" 
                    value={quizId} 
                    onChange={e => setQuizId(e.target.value)} 
                    className={inputStyles}
                >
                    <option value="">No Quiz</option>
                    {allQuizzes.map(quiz => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}
                </select>
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg">{isEditMode ? 'Update Session' : 'Schedule Session'}</button>
            </div>
        </form>
    );
};