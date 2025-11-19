import React, { useState, useEffect } from 'react';
import { User, UserRole, NewCourse, NewModule, NewQuestion, Course, Module, CourseDifficulty, Quiz } from '../../types';
import { PlusCircleIcon, TrashIcon, XCircleIcon } from '../icons/Icons';
import { GoogleGenAI, Type } from "@google/genai";
import { db } from '../../db';

interface CourseCreationFormProps {
    courseToEdit?: Course | null;
    currentUser: User;
    instructors: User[];
    onSubmit: (courseData: NewCourse) => void;
    onCancel: () => void;
    // FIX: Add allQuizzes to props to look up quiz data for editing.
    allQuizzes: Quiz[];
}

type FormModule = Omit<Module, 'id'> & { id?: string };


export const CourseCreationForm: React.FC<CourseCreationFormProps> = ({ courseToEdit, currentUser, instructors, onSubmit, onCancel, allQuizzes }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | string>('');
    const [instructorId, setInstructorId] = useState(currentUser.role === UserRole.Instructor ? currentUser.id : '');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState<CourseDifficulty>(CourseDifficulty.Beginner);
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [modules, setModules] = useState<FormModule[]>([{ title: '', type: 'text', content: '', durationMinutes: 10 }]);
    const [questions, setQuestions] = useState<NewQuestion[]>([{ text: '', options: ['', ''], correctAnswerIndex: 0 }]);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const isEditMode = !!courseToEdit;

    useEffect(() => {
        if (isEditMode && courseToEdit) {
            setTitle(courseToEdit.title);
            setDescription(courseToEdit.description);
            setInstructorId(courseToEdit.instructorId);
            setPrice(courseToEdit.price || '');
            setCategory(courseToEdit.category);
            setDifficulty(courseToEdit.difficulty);
            setThumbnailUrl(courseToEdit.thumbnailUrl);
            setModules(courseToEdit.modules);
            // FIX: Find the quiz by quizId from allQuizzes prop instead of accessing courseToEdit.quiz.
            const quiz = allQuizzes.find(q => q.id === courseToEdit.quizId);
            setQuestions(quiz ? quiz.questions : [{ text: '', options: ['', ''], correctAnswerIndex: 0 }]);
        } else {
            setTitle('');
            setDescription('');
            setInstructorId(currentUser.role === UserRole.Instructor ? currentUser.id : '');
            setPrice('');
            setCategory('');
            setDifficulty(CourseDifficulty.Beginner);
            setThumbnailUrl('');
            setModules([{ title: '', type: 'text', content: '', durationMinutes: 10 }]);
            setQuestions([{ text: '', options: ['', ''], correctAnswerIndex: 0 }]);
        }
    }, [courseToEdit, isEditMode, currentUser, allQuizzes]);

    const handleGenerateOutline = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Based on the course title "${title}" and description "${description}", generate a course outline with 3 to 5 module titles. For each module, suggest if it should be a text or video lesson and estimate its duration in minutes. The content for each module should be a single, short, descriptive paragraph summarizing what the module will cover.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['text', 'video'] },
                                durationMinutes: { type: Type.INTEGER },
                                content: { type: Type.STRING }
                            },
                            required: ['title', 'type', 'durationMinutes', 'content']
                        }
                    }
                }
            });

            const generatedModules = JSON.parse(response.text);
            if (generatedModules && Array.isArray(generatedModules)) {
                setModules(generatedModules);
            }

        } catch (error) {
            console.error("Error generating course outline:", error);
            alert("Sorry, there was an error generating the course outline. Please check the console for details and try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateThumbnail = () => {
        const randomSeed = title || 'course' + Date.now();
        const url = `https://picsum.photos/seed/${encodeURIComponent(randomSeed)}/400/225`;
        setThumbnailUrl(url);
    };

    const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('File size exceeds 2MB. Please choose a smaller image.');
                return;
            }
    
            const reader = new FileReader();
            reader.onload = () => {
                setThumbnailUrl(reader.result as string);
            };
            reader.onerror = () => {
                alert('Error reading file.');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveThumbnail = () => {
        setThumbnailUrl('');
        const fileInput = document.getElementById('course-thumbnail-upload') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const handleAddModule = () => {
        setModules([...modules, { title: '', type: 'text', content: '', durationMinutes: 10 }]);
    };
    
    const handleRemoveModule = async (index: number) => {
        const moduleToRemove = modules[index];
        if (moduleToRemove.type === 'video' && moduleToRemove.content.startsWith('indexeddb://')) {
            const videoId = moduleToRemove.content.replace('indexeddb://', '');
            try {
                await db.deleteVideo(videoId);
            } catch (error) {
                console.error("Failed to delete video on module removal:", error);
            }
        }
        setModules(modules.filter((_, i) => i !== index));
    };
    
    const handleModuleChange = (index: number, field: keyof FormModule, value: any) => {
        const newModules = [...modules];
        (newModules[index] as any)[field] = value;
        setModules(newModules);
    };

    const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const oldContent = modules[index].content;
            if (oldContent.startsWith('indexeddb://')) {
                const oldVideoId = oldContent.replace('indexeddb://', '');
                try {
                    await db.deleteVideo(oldVideoId);
                } catch (error) {
                    console.error("Failed to delete old video:", error);
                }
            }

            const videoId = `video-${Date.now()}-${Math.random()}`;
            try {
                await db.saveVideo(videoId, file);
                handleModuleChange(index, 'content', `indexeddb://${videoId}`);
            } catch (error) {
                alert('Failed to save the video. Please try again.');
                console.error(error);
            }
        }
    };

    const handleRemoveUploadedVideo = async (index: number) => {
        const content = modules[index].content;
        if (content.startsWith('indexeddb://')) {
            const videoId = content.replace('indexeddb://', '');
            try {
                await db.deleteVideo(videoId);
                handleModuleChange(index, 'content', '');
            } catch (error) {
                alert('Failed to remove the video. Please try again.');
                console.error(error);
            }
        }
    };


    const handleAddQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', ''], correctAnswerIndex: 0 }]);
    };

    const handleRemoveQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleQuestionChange = (qIndex: number, field: keyof NewQuestion, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[qIndex] as any)[field] = value;
        setQuestions(newQuestions);
    };
    
    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };
    
    const handleAddOption = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push('');
        setQuestions(newQuestions);
    };

    const handleRemoveOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.splice(oIndex, 1);
        if (newQuestions[qIndex].correctAnswerIndex >= newQuestions[qIndex].options.length) {
            newQuestions[qIndex].correctAnswerIndex = Math.max(0, newQuestions[qIndex].options.length - 1);
        }
        setQuestions(newQuestions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !instructorId || !category || !thumbnailUrl || modules.length === 0 || questions.length === 0) {
            alert('Please fill out all required course details.');
            return;
        }
        const courseData: NewCourse = {
            id: courseToEdit?.id,
            title,
            description,
            instructorId,
            thumbnailUrl,
            price: Number(price) || undefined,
            category,
            difficulty,
            modules,
            quiz: {
                // FIX: Use courseToEdit.quizId to get the quiz ID.
                id: courseToEdit?.quizId,
                title: `${title} Quiz`,
                questions,
            },
        };
        onSubmit(courseData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="border p-4 rounded-lg">
                <legend className="text-lg font-semibold px-2 text-slate-700">{isEditMode ? 'Edit Course Details' : 'Course Details'}</legend>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="course-title" className="block mb-2 text-sm font-medium text-slate-700">Course Title</label>
                        <input id="course-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-md" required/>
                    </div>
                    <div>
                        <label htmlFor="course-description" className="block mb-2 text-sm font-medium text-slate-700">Description</label>
                        <textarea id="course-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded-md" required/>
                    </div>
                    <div>
                        <label htmlFor="course-thumbnail" className="block mb-2 text-sm font-medium text-slate-700">Thumbnail Image</label>
                        <div className="flex items-center space-x-2">
                            <input
                                id="course-thumbnail"
                                type="url"
                                value={thumbnailUrl.startsWith('data:') ? 'Uploaded Image' : thumbnailUrl}
                                onChange={(e) => setThumbnailUrl(e.target.value)}
                                className="flex-grow w-full p-2 border rounded-md disabled:bg-slate-100"
                                placeholder="Enter image URL or upload"
                                disabled={thumbnailUrl.startsWith('data:')}
                            />
                            <label htmlFor="course-thumbnail-upload" className="cursor-pointer px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors whitespace-nowrap">
                                Upload
                            </label>
                            <input
                                id="course-thumbnail-upload"
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleThumbnailFileChange}
                            />
                            <button
                                type="button"
                                onClick={handleGenerateThumbnail}
                                className="px-3 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors whitespace-nowrap"
                            >
                                ✨ Generate
                            </button>
                        </div>
                        {thumbnailUrl && (
                            <div className="mt-4 relative">
                                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-auto max-h-48 object-contain rounded-md border" />
                                <button
                                    type="button"
                                    onClick={handleRemoveThumbnail}
                                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/80"
                                    aria-label="Remove thumbnail"
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                        <input type="hidden" value={thumbnailUrl} required name="thumbnail-validator" />
                    </div>
                    <div>
                        <label htmlFor="course-category" className="block mb-2 text-sm font-medium text-slate-700">Category</label>
                        <input id="course-category" type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-2 border rounded-md" required placeholder="e.g. Trading Fundamentals"/>
                    </div>
                    <div>
                        <label htmlFor="course-difficulty" className="block mb-2 text-sm font-medium text-slate-700">Difficulty</label>
                        <select id="course-difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value as CourseDifficulty)} className="w-full p-2 border rounded-md" required>
                            {Object.values(CourseDifficulty).map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="course-price" className="block mb-2 text-sm font-medium text-slate-700">Price (₹) - leave empty for free</label>
                        <input
                            id="course-price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            placeholder="e.g., 4999"
                            step="1"
                            min="0"
                        />
                    </div>
                    {currentUser.role === UserRole.Admin && (
                        <div>
                            <label htmlFor="instructor-select" className="block mb-2 text-sm font-medium text-slate-700">Instructor</label>
                            <select id="instructor-select" value={instructorId} onChange={e => setInstructorId(e.target.value)} required className="w-full p-2 border rounded-md">
                                <option value="" disabled>Select an instructor</option>
                                {instructors.map(inst => <option key={inst.id} value={inst.id}>{inst.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <legend className="text-lg font-semibold px-2 text-slate-700">Modules</legend>
                    <button 
                        type="button" 
                        onClick={handleGenerateOutline} 
                        disabled={!title || isGenerating}
                        className="flex items-center text-sm font-semibold px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isGenerating ? (
                            <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Generating...</>
                        ) : (
                            '✨ Generate Outline with AI'
                        )}
                    </button>
                </div>
                <div className="space-y-4">
                    {modules.map((module, index) => {
                        const isVideoUploaded = module.type === 'video' && module.content.startsWith('indexeddb://');
                        return (
                            <div key={index} className="p-3 bg-slate-50 rounded-md border relative">
                                <button type="button" onClick={() => handleRemoveModule(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><XCircleIcon className="w-5 h-5"/></button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="text" placeholder="Module Title" value={module.title} onChange={e => handleModuleChange(index, 'title', e.target.value)} className="w-full p-2 border rounded-md" required />
                                <input type="number" placeholder="Duration (mins)" value={module.durationMinutes} onChange={e => handleModuleChange(index, 'durationMinutes', parseInt(e.target.value, 10))} className="w-full p-2 border rounded-md" required/>
                                <select value={module.type} onChange={e => handleModuleChange(index, 'type', e.target.value as 'text' | 'video')} className="w-full p-2 border rounded-md md:col-span-2">
                                    <option value="text">Text Content</option>
                                    <option value="video">Video Content</option>
                                </select>
                                {module.type === 'text' ? (
                                        <textarea placeholder="Content (Markdown allowed)" value={module.content} onChange={e => handleModuleChange(index, 'content', e.target.value)} className="w-full p-2 border rounded-md md:col-span-2" rows={4} required/>
                                ) : (
                                        <div className="md:col-span-2 space-y-3">
                                            <input 
                                                type="text" 
                                                placeholder="Enter video URL (e.g., YouTube embed)" 
                                                value={isVideoUploaded ? '' : module.content} 
                                                onChange={e => handleModuleChange(index, 'content', e.target.value)} 
                                                className="w-full p-2 border rounded-md disabled:bg-slate-200" 
                                                disabled={isVideoUploaded}
                                            />
                                            <div className="flex items-center">
                                                <div className="flex-grow border-t border-slate-300"></div>
                                                <span className="flex-shrink mx-4 text-sm text-slate-500">OR</span>
                                                <div className="flex-grow border-t border-slate-300"></div>
                                            </div>
                                            <div>
                                                <label htmlFor={`video-upload-${index}`} className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                                                    {isVideoUploaded ? 'Change Video File' : 'Upload a Video File (any size)'}
                                                </label>
                                                <input id={`video-upload-${index}`} type="file" accept="video/*" onChange={e => handleFileChange(index, e)} className="hidden" />
                                                {isVideoUploaded && (
                                                    <div className="mt-2">
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-xs text-green-600">Video stored successfully.</p>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveUploadedVideo(index)}
                                                                className="text-xs text-red-500 hover:text-red-700 font-semibold"
                                                            >
                                                                Remove Video
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                )}
                            </div>
                            </div>
                        );
                    })}
                    <button type="button" onClick={handleAddModule} className="flex items-center text-sm text-indigo-600 font-semibold hover:text-indigo-800"><PlusCircleIcon className="w-5 h-5 mr-1"/> Add Module</button>
                </div>
            </fieldset>

            <fieldset className="border p-4 rounded-lg">
                <legend className="text-lg font-semibold px-2 text-slate-700">Quiz</legend>
                 <div className="space-y-4">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="p-3 bg-slate-50 rounded-md border relative">
                             <button type="button" onClick={() => handleRemoveQuestion(qIndex)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><XCircleIcon className="w-5 h-5"/></button>
                             <input type="text" placeholder="Question Text" value={q.text} onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} className="w-full p-2 border rounded-md mb-2" required/>
                             <div className="space-y-2">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-2">
                                        <input type="radio" name={`correct-answer-${qIndex}`} checked={q.correctAnswerIndex === oIndex} onChange={() => handleQuestionChange(qIndex, 'correctAnswerIndex', oIndex)} />
                                        <input type="text" placeholder={`Option ${oIndex + 1}`} value={opt} onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)} className="flex-1 p-2 border rounded-md" required/>
                                        <button type="button" onClick={() => handleRemoveOption(qIndex, oIndex)} className="text-slate-400 hover:text-red-500" disabled={q.options.length <= 2}><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                ))}
                             </div>
                             <button type="button" onClick={() => handleAddOption(qIndex)} className="text-xs text-indigo-600 mt-2 hover:underline">Add Option</button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddQuestion} className="flex items-center text-sm text-indigo-600 font-semibold hover:text-indigo-800"><PlusCircleIcon className="w-5 h-5 mr-1"/> Add Question</button>
                </div>
            </fieldset>

            <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
                <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300">Cancel</button>
                <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg">{isEditMode ? 'Update Course' : 'Create Course'}</button>
            </div>
        </form>
    );
};
