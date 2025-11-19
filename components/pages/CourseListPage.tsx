import React, { useState, useEffect, useMemo } from 'react';
import { Course, User, UserRole, StudentProgress, NewCourse, CourseDifficulty, Quiz } from '../../types';
import { CourseCard } from '../shared/CourseCard';
import { Modal } from '../shared/Modal';
import { CourseCreationForm } from '../forms/CourseCreationForm';
import { CourseDetailView } from '../student/CourseDetailView';
import { ConfirmationModal } from '../shared/ConfirmationModal';
import { StudentProgressView } from '../instructor/StudentProgressView';
import { EnrollmentModal } from '../student/EnrollmentModal';

interface CourseListPageProps {
    currentUser: User;
    allCourses: Course[];
    allQuizzes: Quiz[];
    instructors: User[];
    students: User[];
    studentProgress: StudentProgress[];
    onCreateCourse: (courseData: NewCourse) => void;
    onDeleteCourse: (courseId: string) => void;
    onModuleComplete: (courseId: string, moduleId: string) => void;
    onQuizComplete: (courseId: string, score: number) => void;
    onAssignmentSubmit: (courseId: string, submission: string) => void;
    onRateCourse: (courseId: string, rating: number) => void;
    onEnrollInCourse: (courseId: string, enrollmentData: { phoneNumber: string, address: string }) => void;
    onNotifyInstructorOfCompletion: (courseId: string) => void;
    onIssueCertificate: (courseId: string, studentId: string) => void;
    searchTerm?: string;
}

const CourseListPage: React.FC<CourseListPageProps> = (props) => {
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
    const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
    const [enrollingCourse, setEnrollingCourse] = useState<Course | null>(null);
    const [viewingProgressForCourse, setViewingProgressForCourse] = useState<Course | null>(null);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPrice, setSelectedPrice] = useState<string>('All');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

    const { searchTerm = '' } = props;

    const canCreate = props.currentUser.role === UserRole.Admin || props.currentUser.role === UserRole.Instructor;
    
    const categories = useMemo(() => {
        const allCategories = props.allCourses.map(c => c.category);
        return ['All', ...Array.from(new Set(allCategories)).sort()];
    }, [props.allCourses]);

    const filteredCourses = useMemo(() => {
        return props.allCourses.filter(course => {
            const matchesSearch = searchTerm.trim() === '' ||
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;

            const matchesPrice = selectedPrice === 'All' ||
                (selectedPrice === 'Free' && (!course.price || course.price === 0)) ||
                (selectedPrice === 'Paid' && course.price && course.price > 0);

            const matchesDifficulty = selectedDifficulty === 'All' || course.difficulty === selectedDifficulty;

            return matchesSearch && matchesCategory && matchesPrice && matchesDifficulty;
        });
    }, [props.allCourses, searchTerm, selectedCategory, selectedPrice, selectedDifficulty]);


    const handleFormSubmit = (courseData: NewCourse) => {
        props.onCreateCourse(courseData); // This will handle both create and update
        setIsCreationModalOpen(false);
        setEditingCourse(null);
    };

    const getInstructorForCourse = (instructorId: string) => {
        return props.instructors.find(i => i.id === instructorId);
    };

    const getProgressForCourse = (courseId: string) => {
        return props.studentProgress.find(p => p.courseId === courseId && p.studentId === props.currentUser.id);
    };
    
    const handleDeleteConfirm = () => {
        if (deletingCourse) {
            props.onDeleteCourse(deletingCourse.id);
            setDeletingCourse(null);
        }
    };
    
    const handleEditClick = (course: Course) => {
        setEditingCourse(course);
        setIsCreationModalOpen(true);
    };
    
    const handleCourseClick = (course: Course) => {
        if (props.currentUser.role === UserRole.Student) {
            const progress = getProgressForCourse(course.id);
            if (progress) {
                setViewingCourse(course);
            } else {
                setEnrollingCourse(course);
            }
        } else {
             // For instructors/admins, clicking the card could be a view action, buttons are for management
             // For now, let's make it edit
             handleEditClick(course);
        }
    };

    const handleEnrollmentSubmit = (enrollmentData: { phoneNumber: string, address: string }) => {
        if (enrollingCourse) {
            props.onEnrollInCourse(enrollingCourse.id, enrollmentData);
            // For paid courses, the modal transitions to a receipt view.
            // It should NOT be closed from here. The user will close it from the receipt.
            if (!enrollingCourse.price || enrollingCourse.price <= 0) {
                setEnrollingCourse(null);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">{props.currentUser.role === UserRole.Student ? 'Available Courses' : 'Manage Courses'}</h1>
                {canCreate && (
                    <button
                        onClick={() => { setEditingCourse(null); setIsCreationModalOpen(true); }}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-violet-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                        + Create Course
                    </button>
                )}
            </div>
            
            {/* Filter Bar */}
            <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                    <label htmlFor="category-filter" className="sr-only">Category</label>
                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>)}
                    </select>
                </div>
                <div className="flex-1 w-full md:w-auto">
                    <label htmlFor="price-filter" className="sr-only">Price</label>
                    <select
                        id="price-filter"
                        value={selectedPrice}
                        onChange={(e) => setSelectedPrice(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="All">All Prices</option>
                        <option value="Free">Free</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>
                <div className="flex-1 w-full md:w-auto">
                    <label htmlFor="difficulty-filter" className="sr-only">Difficulty</label>
                    <select
                        id="difficulty-filter"
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="All">All Levels</option>
                        <option value={CourseDifficulty.Beginner}>{CourseDifficulty.Beginner}</option>
                        <option value={CourseDifficulty.Intermediate}>{CourseDifficulty.Intermediate}</option>
                        <option value={CourseDifficulty.Advanced}>{CourseDifficulty.Advanced}</option>
                    </select>
                </div>
                <button
                    onClick={() => {
                        setSelectedCategory('All');
                        setSelectedPrice('All');
                        setSelectedDifficulty('All');
                    }}
                    className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors w-full md:w-auto flex-shrink-0"
                >
                    Clear Filters
                </button>
            </div>

            {filteredCourses.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            instructor={getInstructorForCourse(course.instructorId)}
                            progress={getProgressForCourse(course.id)}
                            onClick={handleCourseClick}
                            onEdit={canCreate ? handleEditClick : undefined}
                            onDelete={canCreate ? (courseId) => setDeletingCourse(props.allCourses.find(c => c.id === courseId) || null) : undefined}
                            onManageStudents={canCreate ? setViewingProgressForCourse : undefined}
                            userRole={props.currentUser.role}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                    <p className="text-slate-500">
                         {searchTerm ? `No courses found matching your criteria.` : 'No courses available for the selected filters.'}
                    </p>
                </div>
            )}
            
            <Modal isOpen={isCreationModalOpen} onClose={() => { setIsCreationModalOpen(false); setEditingCourse(null); }} title={editingCourse ? 'Edit Course' : 'Create a New Course'} size="3xl">
                <CourseCreationForm
                    courseToEdit={editingCourse}
                    currentUser={props.currentUser}
                    instructors={props.instructors}
                    onSubmit={handleFormSubmit}
                    onCancel={() => { setIsCreationModalOpen(false); setEditingCourse(null); }}
                    // FIX: Pass allQuizzes to the creation form so it can find the quiz for the course being edited.
                    allQuizzes={props.allQuizzes}
                />
            </Modal>
            
            <Modal isOpen={!!viewingCourse} onClose={() => setViewingCourse(null)} title={viewingCourse?.title || 'Course Details'} size="4xl">
                {viewingCourse && (
                    <CourseDetailView
                        course={viewingCourse}
                        student={props.currentUser}
                        progress={getProgressForCourse(viewingCourse.id)}
                        onModuleComplete={(moduleId) => props.onModuleComplete(viewingCourse.id, moduleId)}
                        onQuizComplete={(score) => props.onQuizComplete(viewingCourse.id, score)}
                        onRateCourse={(rating) => props.onRateCourse(viewingCourse.id, rating)}
                        onNotifyInstructorOfCompletion={() => props.onNotifyInstructorOfCompletion(viewingCourse.id)}
                        allQuizzes={props.allQuizzes}
                    />
                )}
            </Modal>

            <Modal isOpen={!!viewingProgressForCourse} onClose={() => setViewingProgressForCourse(null)} title={`Student Progress: ${viewingProgressForCourse?.title}`} size="3xl">
                {viewingProgressForCourse && (
                    <StudentProgressView
                        course={viewingProgressForCourse}
                        students={props.students}
                        allProgress={props.studentProgress}
                        onIssueCertificate={props.onIssueCertificate}
                    />
                )}
            </Modal>
            
            <ConfirmationModal 
                isOpen={!!deletingCourse}
                onClose={() => setDeletingCourse(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Course"
                message={`Are you sure you want to delete the course "${deletingCourse?.title}"? This action cannot be undone.`}
            />

            <EnrollmentModal
                isOpen={!!enrollingCourse}
                onClose={() => setEnrollingCourse(null)}
                onSubmit={handleEnrollmentSubmit}
                course={enrollingCourse}
                user={props.currentUser}
            />
        </div>
    );
};

export default CourseListPage;
