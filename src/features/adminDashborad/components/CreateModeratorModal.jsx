import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Eye, EyeOff } from 'lucide-react';
import { adminCreateModerator } from '@/api/user';
import PhoneInput from '@/components/ui/inputs/PhoneInput';
import AssignModeratorModal from './student/AssignModeratorModal';

const CreateModeratorModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [newModerator, setNewModerator] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        gender: '',
        role: 'moderator',
        assignedFeatures: []
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    const handleStep1Submit = (e) => {
        e.preventDefault();
        setFormError('');

        if (newModerator.username && newModerator.username.includes(' ')) {
            setFormError('Username cannot contain spaces.');
            return;
        }

        if (!newModerator.phone) {
            setFormError('Phone number is required.');
            return;
        }

        if (newModerator.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newModerator.email)) {
            setFormError('Please enter a valid email address.');
            return;
        }

        if (newModerator.password.length < 8) {
            setFormError('Password must be at least 8 characters long.');
            return;
        }
        if (!/[A-Z]/.test(newModerator.password)) {
            setFormError('Password must contain at least one uppercase letter.');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newModerator.password)) {
            setFormError('Password must contain at least one special symbol.');
            return;
        }

        setStep(2);
    };

    const handleFinalCreate = async (data) => {
        setIsSubmitting(true);
        setFormError('');
        try {
            const moderatorData = {
                ...newModerator,
                role: data.selectedRole || 'moderator',
                assignedFeatures: data.features
            };
            await adminCreateModerator(moderatorData);
            toast.success("Moderator created successfully!");
            
            // Reset state
            setNewModerator({
                firstname: '',
                lastname: '',
                username: '',
                email: '',
                phone: '',
                password: '',
                gender: '',
                role: 'moderator',
                assignedFeatures: []
            });
            setStep(1);
            onSuccess(); // triggers refetch
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to add moderator';
            setFormError(errorMsg);
            toast.error(errorMsg);
            setStep(1); // Go back to step 1 to show error
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setFormError('');
        setNewModerator({
            firstname: '',
            lastname: '',
            username: '',
            email: '',
            phone: '',
            password: '',
            gender: '',
            role: 'moderator',
            assignedFeatures: []
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {step === 1 && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] w-full max-w-[550px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Add New Moderator</h3>
                                <p className="text-sm text-gray-500">Step 1: Basic Information</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleStep1Submit} className="p-6 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                    <X size={16} className="bg-red-500 text-white rounded-full p-0.5" />
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter First Name"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={newModerator.firstname}
                                        onChange={(e) => setNewModerator({ ...newModerator, firstname: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Last Name"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        value={newModerator.lastname}
                                        onChange={(e) => setNewModerator({ ...newModerator, lastname: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter Username"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={newModerator.username}
                                    onChange={(e) => setNewModerator({ ...newModerator, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="Enter Email Address"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={newModerator.email}
                                    onChange={(e) => setNewModerator({ ...newModerator, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                <PhoneInput
                                    name="phone"
                                    value={newModerator.phone}
                                    onChange={(e) => setNewModerator({ ...newModerator, phone: e.target.value })}
                                    label={null}
                                    containerClassName="w-full relative"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <input
                                        required
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter Password"
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12"
                                        value={newModerator.password}
                                        onChange={(e) => setNewModerator({ ...newModerator, password: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gender</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={newModerator.gender}
                                        onChange={(e) => setNewModerator({ ...newModerator, gender: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-3 px-4 bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                >
                                    Next
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <AssignModeratorModal
                isOpen={step === 2}
                onClose={() => setStep(1)}
                onSave={handleFinalCreate}
            />
        </>
    );
};

export default CreateModeratorModal;
