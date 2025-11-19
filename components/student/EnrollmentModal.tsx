import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../shared/Modal';
import { Course, User } from '../../types';
import { CheckCircleIcon, ShareIcon, ArrowDownTrayIcon, AcademicCapIcon, ClipboardDocumentIcon, QuestionMarkCircleIcon, MastercardIcon, VisaIcon, AmexIcon, DiscoverIcon } from '../icons/Icons';

declare global {
    interface Window {
        html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
        jspdf: {
            jsPDF: new (options?: any) => any;
        };
    }
}

interface PaymentReceiptProps {
    course: Course;
    user: User;
    receiptData: {
        phoneNumber: string;
        streetAddress: string;
        city: string;
        state: string;
        zip: string;
        country: string;
        cardNumber: string;
    };
    onClose: () => void;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({ course, user, receiptData, onClose }) => {
    const [isShareCopied, setIsShareCopied] = useState(false);
    const [isDetailsCopied, setIsDetailsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const receiptRef = useRef<HTMLDivElement>(null);
    const transactionId = `RCPT-${Date.now()}`;
    const receiptDate = new Date();
    const lastFourDigits = receiptData.cardNumber.replace(/\s/g, '').slice(-4);
    const coursePriceINR = course.price?.toLocaleString('en-IN') || '0';

    const receiptText = `
PAYMENT RECEIPT

Receipt #: ${transactionId}
Date: ${receiptDate.toLocaleDateString()}

Client:
${user.name}
${receiptData.streetAddress}
${receiptData.city}, ${receiptData.state}, ${receiptData.zip}
${receiptData.country}

Course: ${course.title}

Description: Enrollment in ${course.title}
Quantity: 1
Rate: ₹${coursePriceINR}
Amount: ₹${coursePriceINR}

TOTAL: ₹${coursePriceINR}

Payment Method: Credit Card ending in ${lastFourDigits}

Thank you for your business!
Purple LMS
    `.trim();

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Course Enrollment Receipt',
                    text: receiptText,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(receiptText).then(() => {
                setIsShareCopied(true);
                setTimeout(() => setIsShareCopied(false), 2000);
            });
        }
    };

    const handleCopyDetails = () => {
        navigator.clipboard.writeText(receiptText).then(() => {
            setIsDetailsCopied(true);
            setTimeout(() => setIsDetailsCopied(false), 2000);
        });
    };

    const handleDownloadPdf = async () => {
        const receiptElement = receiptRef.current;
        if (!receiptElement || !window.jspdf || !window.html2canvas) {
            alert('PDF generation library is not available.');
            return;
        }

        setIsDownloading(true);
        
        try {
            const { jsPDF } = window.jspdf;
            const canvas = await window.html2canvas(receiptElement, {
                scale: 2,
                useCORS: true,
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = Math.min((pdfWidth * 0.9) / imgProps.width, (pdfHeight * 0.9) / imgProps.height);
            const finalImgWidth = imgProps.width * ratio;
            const finalImgHeight = imgProps.height * ratio;
            const xOffset = (pdfWidth - finalImgWidth) / 2;
            const yOffset = (pdfHeight - finalImgHeight) / 2;
            
            pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalImgWidth, finalImgHeight);
            pdf.save(`receipt-${course.title.replace(/\s+/g, '-')}-${transactionId}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Sorry, there was an error generating the PDF. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="p-2 bg-slate-100 rounded-lg">
                <div ref={receiptRef} className="max-w-2xl mx-auto bg-white rounded-sm border border-slate-300 overflow-hidden font-serif p-8 text-sm text-slate-800">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">Purple LMS</h2>
                            <p className="text-slate-500">123 Learning Lane</p>
                            <p className="text-slate-500">Education City, EC 54321, USA</p>
                            <p className="text-slate-500">Phone: (555) 123-4567</p>
                            <p className="text-slate-500">E-mail: contact@purplelms.com</p>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 tracking-tight">PAYMENT RECEIPT</h1>
                    </div>

                    {/* Receipt # & Date */}
                    <div className="flex justify-between items-center bg-slate-200 p-2 rounded-md mb-8 text-slate-700">
                        <p><span className="font-semibold">Receipt #</span> {transactionId}</p>
                        <p><span className="font-semibold">Date:</span> {receiptDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    {/* Client & Course Info */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-slate-700 border-b border-slate-300 pb-1 mb-2">CLIENT INFORMATION</h3>
                            <p className="font-bold">{user.name}</p>
                            <p>{receiptData.streetAddress}</p>
                            <p>{receiptData.city}, {receiptData.state}, {receiptData.country}</p>
                            <p>ZIP Code: {receiptData.zip}</p>
                            <p>Phone: {receiptData.phoneNumber}</p>
                            <p>E-mail: {user.email}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-700 border-b border-slate-300 pb-1 mb-2">COURSE INFORMATION</h3>
                            <p><span className="font-semibold">Course Name:</span> {course.title}</p>
                            <p><span className="font-semibold">Enrollment Date:</span> {receiptDate.toLocaleDateString()}</p>
                        </div>
                    </div>
                    
                    {/* Table */}
                    <table className="w-full mb-8 text-left">
                        <thead className="bg-slate-200 text-slate-700">
                            <tr>
                                <th className="font-bold p-2">DESCRIPTION</th>
                                <th className="text-right font-bold p-2 w-24">QUANTITY</th>
                                <th className="text-right font-bold p-2 w-24">RATE (₹)</th>
                                <th className="text-right font-bold p-2 w-24">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-slate-200">
                                <td className="p-2">{course.title}</td>
                                <td className="text-right p-2">1</td>
                                <td className="text-right p-2">{coursePriceINR}</td>
                                <td className="text-right p-2">{coursePriceINR}</td>
                            </tr>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <tr key={i} className="border-b border-slate-200"><td className="p-2 h-8" colSpan={4}></td></tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-8">
                        <div className="w-full sm:w-1/2 md:w-2/5 space-y-2">
                            <div className="flex justify-between bg-slate-100 p-2 rounded-sm"><span className="text-slate-600">Subtotal</span><span>₹{coursePriceINR}</span></div>
                            <div className="flex justify-between p-2"><span className="text-slate-600">Discount</span><span>₹0</span></div>
                            <div className="flex justify-between p-2"><span className="text-slate-600">Tax / VAT</span><span>₹0</span></div>
                            <div className="flex justify-between font-bold text-lg border-t-2 border-slate-800 pt-2 mt-2 bg-slate-200 p-2 rounded-sm"><span className="text-slate-800">TOTAL</span><span className="text-slate-800">₹{coursePriceINR}</span></div>
                        </div>
                    </div>
                    
                    {/* Payment method */}
                    <div className="mb-8 p-4 border border-slate-200 rounded-md">
                        <p className="mb-2">The total amount of ₹{coursePriceINR} was paid by {user.name} on {receiptDate.toLocaleDateString()}.</p>
                        <p className="font-semibold">Payment Method:</p>
                        <div className="flex items-center mt-1">
                            <input type="checkbox" checked readOnly className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-0" />
                            <label className="ml-2 text-sm text-slate-900">Credit card No. **** **** **** {lastFourDigits}</label>
                        </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="border-t-2 border-slate-300 pt-8 mt-8">
                        <div className="mb-8">
                            <p className="font-semibold mb-1">Customer's Authorized Signature</p>
                            <div className="h-12 border-b border-slate-400"></div>
                        </div>
                        <p className="text-center font-semibold text-slate-600">Thank you for your business!</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 max-w-2xl mx-auto flex flex-col gap-3">
                <button 
                    onClick={handleDownloadPdf}
                    disabled={isDownloading}
                    className="w-full flex-1 flex items-center justify-center px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    {isDownloading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2"/>
                    )}
                    {isDownloading ? 'Downloading...' : 'Download as PDF'}
                </button>
                <div className="flex gap-3">
                    <button 
                        onClick={handleCopyDetails}
                        className="w-full flex-1 flex items-center justify-center px-5 py-3 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ClipboardDocumentIcon className="w-5 h-5 mr-2"/>
                        {isDetailsCopied ? 'Copied!' : 'Copy Details'}
                    </button>
                    <button 
                        onClick={handleShare}
                        className="w-full flex-1 flex items-center justify-center px-5 py-3 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <ShareIcon className="w-5 h-5 mr-2"/>
                        {isShareCopied ? 'Copied!' : 'Share'}
                    </button>
                </div>
            </div>
             <div className="mt-4 text-center">
                <button onClick={onClose} className="px-6 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:underline">
                    Close
                </button>
            </div>
        </div>
    );
};


const FormField: React.FC<{ label: string; children: React.ReactNode; htmlFor: string; className?: string }> = ({ label, children, htmlFor, className = '' }) => (
    <div className={className}>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        {children}
    </div>
);

const countries = ["United States", "Canada", "Mexico", "United Kingdom", "Germany", "France", "Australia", "Japan"];
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());

interface EnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (enrollmentData: { phoneNumber: string; address: string; }) => void;
    course: Course | null;
    user: User | null;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({ isOpen, onClose, onSubmit, course, user }) => {
    // Contact & Address
    const [phoneNumber, setPhoneNumber] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [country, setCountry] = useState('United States');
    // Card Details
    const [nameOnCard, setNameOnCard] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expMonth, setExpMonth] = useState(months[0]);
    const [expYear, setExpYear] = useState(years[0]);
    const [csc, setCsc] = useState('');

    const [isProcessing, setIsProcessing] = useState(false);
    const [formError, setFormError] = useState('');
    const [view, setView] = useState<'summary' | 'form' | 'receipt'>('summary');
    
    const isPaidCourse = course?.price != null && course.price > 0;

    useEffect(() => {
        if (isOpen) { 
            if (user) {
                setPhoneNumber(user.phoneNumber || '');
                setStreetAddress(user.address || ''); // Pre-fill only street address as user.address is a single string
            }
            // Reset state on modal open
            setIsProcessing(false);
            setFormError('');

            if (isPaidCourse) {
                setView('summary');
            } else {
                setView('form'); // For free courses, go straight to contact form
            }

            // Reset other fields
            setNameOnCard('');
            setCardNumber('');
            setExpMonth(months[0]);
            setExpYear(years[0]);
            setCsc('');
            setCity('');
            setState('');
            setZip('');
            setCountry('United States');
        }
    }, [user, isOpen, isPaidCourse]);

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        const formattedValue = (value.match(/.{1,4}/g) || []).join(' ');
        if (formattedValue.length <= 19) {
            setCardNumber(formattedValue);
        }
    };

    if (!course || !user) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        // Basic validation
        const requiredAddressFields = [country, streetAddress, city, state, zip, phoneNumber];
        if (requiredAddressFields.some(field => !field.trim())) {
            setFormError('Please fill out all billing address and contact information fields.');
            return;
        }

        if (isPaidCourse) {
            const requiredCardFields = [nameOnCard, cardNumber, expMonth, expYear, csc];
            if (requiredCardFields.some(field => !field.trim())) {
                setFormError('Please fill out all credit card details.');
                return;
            }
            if (cardNumber.replace(/\s/g, '').length < 15) { // Common card lengths are 15-16
                setFormError('Please enter a valid card number.');
                return;
            }
        }
        
        const fullAddress = `${streetAddress}, ${city}, ${state} ${zip}, ${country}`;

        // If the course is free, just submit and the parent will close the modal.
        if (!isPaidCourse) {
            onSubmit({ phoneNumber, address: fullAddress });
            return;
        }

        // Simulate payment processing for paid courses
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            // After successful "payment", enroll the user and show receipt
            onSubmit({ phoneNumber, address: fullAddress });
            setView('receipt');
        }, 2000);
    };

    const modalTitle = view === 'receipt' 
        ? 'Payment Receipt' 
        : view === 'summary' 
        ? `Enroll in: ${course.title}`
        : `Payment for: ${course.title}`;

    const inputStyles = "w-full p-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm";

    const renderContent = () => {
        if (view === 'receipt') {
            const receiptData = { phoneNumber, streetAddress, city, state, zip, country, cardNumber };
            return <PaymentReceipt course={course} user={user} receiptData={receiptData} onClose={onClose} />;
        }
        if (view === 'summary' && isPaidCourse) {
            return (
                <div className="text-center p-4 animate-fade-in">
                    <h2 className="text-2xl font-bold text-slate-800">{course.title}</h2>
                    <p className="text-slate-500 mt-2 max-w-prose mx-auto">{course.description}</p>
                    <div className="my-8 p-6 bg-slate-100 rounded-lg">
                        <p className="text-lg text-slate-600">Total Amount Due</p>
                        <p className="text-5xl font-bold text-indigo-600 mt-2">₹{course.price.toLocaleString('en-IN')}</p>
                    </div>
                    <button
                        onClick={() => setView('form')}
                        className="w-full px-6 py-3 text-base font-semibold text-white rounded-lg transition-colors bg-slate-900 hover:bg-slate-800"
                    >
                        Proceed to Payment
                    </button>
                </div>
            )
        }
        // 'form' view
        return (
            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                {isPaidCourse && (
                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                            <label className="text-sm font-medium text-slate-700">Payment Method</label>
                            <div className="flex items-center space-x-4 mt-2">
                                <MastercardIcon />
                                <VisaIcon />
                                <AmexIcon />
                                <DiscoverIcon />
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-slate-800 pt-4">Credit Card Details</h3>
                        <div className="space-y-4">
                            <FormField label="Name on card" htmlFor="nameOnCard">
                                <input id="nameOnCard" type="text" placeholder="Meet Patel" value={nameOnCard} onChange={e => setNameOnCard(e.target.value)} className={inputStyles} required={isPaidCourse} />
                            </FormField>
                            <FormField label="Card number" htmlFor="cardNumber">
                                <input id="cardNumber" type="text" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={handleCardNumberChange} className={inputStyles} required={isPaidCourse} />
                            </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Card expiration" htmlFor="expMonth">
                                    <div className="flex gap-2">
                                        <select id="expMonth" value={expMonth} onChange={e => setExpMonth(e.target.value)} className={inputStyles} required={isPaidCourse}>
                                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                        <select id="expYear" value={expYear} onChange={e => setExpYear(e.target.value)} className={inputStyles} required={isPaidCourse}>
                                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                </FormField>
                                <FormField label="Card Security Code" htmlFor="csc">
                                    <div className="relative">
                                        <input id="csc" type="text" placeholder="Code" value={csc} onChange={e => setCsc(e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} className={`${inputStyles} pr-10`} required={isPaidCourse} />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" title="3-4 digit code on the back of your card.">
                                            <QuestionMarkCircleIcon className="w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>
                                </FormField>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Billing address</h3>
                        <div className="space-y-4">
                        <FormField label="Country" htmlFor="country">
                            <select id="country" value={country} onChange={e => setCountry(e.target.value)} className={inputStyles} required>
                                {countries.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Address" htmlFor="streetAddress">
                            <input id="streetAddress" type="text" placeholder="Address" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} className={inputStyles} required />
                        </FormField>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="City" htmlFor="city">
                                <input id="city" type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} className={inputStyles} required />
                            </FormField>
                            <FormField label="State" htmlFor="state">
                                <input id="state" type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} className={inputStyles} required />
                            </FormField>
                            </div>
                            <FormField label="ZIP CODE" htmlFor="zip">
                            <input id="zip" type="text" placeholder="ZIP CODE" value={zip} onChange={e => setZip(e.target.value)} className={inputStyles} required />
                        </FormField>
                        </div>
                </div>
                    <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">Contact information</h3>
                    <div className="space-y-4">
                        <FormField label="Email" htmlFor="email">
                            <input id="email" type="email" value={user.email} className={`${inputStyles} bg-slate-100 cursor-not-allowed`} disabled />
                        </FormField>
                        <FormField label="Phone" htmlFor="phone">
                            <input id="phone" type="tel" placeholder="Phone" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className={inputStyles} required />
                        </FormField>
                    </div>
                </div>

                {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}

                <div className="flex justify-end items-center space-x-4 pt-4">
                    <button
                        type="submit"
                        className="w-full px-6 py-3 text-base font-semibold text-white rounded-lg transition-colors bg-slate-900 hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processing...</>
                        ) : isPaidCourse ? (
                                `Pay ₹${course.price.toLocaleString('en-IN')}`
                        ) : (
                            'Confirm Enrollment'
                        )}
                    </button>
                </div>
            </form>
        );
    }


    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="2xl">
            {renderContent()}
        </Modal>
    );
};