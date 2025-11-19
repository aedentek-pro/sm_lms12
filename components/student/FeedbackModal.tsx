import React, { useState } from 'react';
import { Modal } from '../shared/Modal';
import { StarRating } from '../shared/StarRating';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (rating === 0) {
            alert('Please select a rating.');
            return;
        }
        onSubmit(rating, comment);
        // Reset state for next time
        setRating(0);
        setComment('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Leave Your Feedback" size="lg">
            <div className="space-y-6">
                <div className="text-center">
                    <p className="text-lg font-medium text-slate-700 mb-3">How would you rate this session?</p>
                    <StarRating rating={rating} onRatingChange={setRating} className="justify-center"/>
                </div>
                <div>
                    <label htmlFor="feedback-comment" className="block mb-2 text-sm font-medium text-slate-700">
                        Comments (optional)
                    </label>
                    <textarea 
                        id="feedback-comment"
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)} 
                        rows={5} 
                        className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="What did you like? What could be improved?"
                    />
                </div>
                 <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                    <button onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300">Cancel</button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">Submit Feedback</button>
                </div>
            </div>
        </Modal>
    );
};
