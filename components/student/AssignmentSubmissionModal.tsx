import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { Assignment } from '../../types';

interface AssignmentSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (text: string) => void;
    assignment: Assignment;
}

export const AssignmentSubmissionModal: React.FC<AssignmentSubmissionModalProps> = ({ isOpen, onClose, onSubmit, assignment }) => {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit(text);
            onClose();
        } else {
            alert('Please enter your submission.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={assignment.title}>
            <div className="space-y-4">
                <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-800">Assignment Prompt</label>
                    <p className="text-gray-600 p-3 bg-gray-50 rounded-md border">{assignment.prompt}</p>
                </div>
                <div>
                    <label htmlFor="submission-text" className="block mb-2 text-sm font-medium text-gray-700">Your Submission</label>
                    <textarea 
                        id="submission-text"
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        rows={8} 
                        className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="Type your assignment here..."
                    />
                </div>
                 <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">Submit</button>
                </div>
            </div>
        </Modal>
    );
};