import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Eye, EyeOff } from 'lucide-react';
import { adminCreateModerator } from '@/api/user';
import { checkUsername, checkEmail } from '@/api/auth';
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
    const [passwordError, setPasswordError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        if (!isOpen) return;
        if (!newModerator.username || newModerator.username.trim().length === 0) {
            setUsernameError('');
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await checkUsername(newModerator.username.trim());
                if (!res.data?.data?.available) {
                    setUsernameError('this username is already exist');
                } else {
                    setUsernameError('');
                }
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [newModerator.username, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (!newModerator.email || newModerator.email.trim().length === 0) {
            setEmailError('');
            return;
        }
        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await checkEmail(newModerator.email.trim());
                if (!res.data?.data?.available) {
                    setEmailError('this email is already exist');
                } else {
                    setEmailError('');
                }
            } catch (err) {
                console.error(err);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [newModerator.email, isOpen]);

    const handleStep1Submit = async (e) => {
        e.preventDefault();
        setFormError('');
        setPasswordError('');

        if (newModerator.username && newModerator.username.includes(' ')) {
            setUsernameError('Username cannot contain spaces.');
            return;
        }

        if (!newModerator.phone) {
            setFormError('Phone number is required.');
            return;
        }

        if (newModerator.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newModerator.email)) {
            setEmailError('Please enter a valid email address.');
            return;
        }

        if (newModerator.password.length < 8) {
            setPasswordError('Password must be at least 8 characters long.');
            return;
        }
        if (!/[A-Z]/.test(newModerator.password)) {
            setPasswordError('Password must contain at least one uppercase letter.');
            return;
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newModerator.password)) {
            setPasswordError('Password must contain at least one special symbol.');
            return;
        }

        let hasError = false;

        // Perform instant API check on Submit
        try {
            if (newModerator.username) {
                const uRes = await checkUsername(newModerator.username.trim());
                if (!uRes.data?.data?.available) {
                    setUsernameError('this username is already exist');
                    hasError = true;
                } else {
                    setUsernameError('');
                }
            }
            if (newModerator.email) {
                const eRes = await checkEmail(newModerator.email.trim());
                if (!eRes.data?.data?.available) {
                    setEmailError('this email is already exist');
                    hasError = true;
                } else {
                    setEmailError('');
                }
            }
        } catch (err) {
            console.error(err);
        }

        if (hasError || usernameError || emailError) {
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
            setUsernameError('');
            setEmailError('');
            setStep(1);
            onSuccess(); // triggers refetch
            onClose();
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Failed to add moderator';
            const lowerMsg = errorMsg.toLowerCase();
            if (lowerMsg.includes('username')) {
                setUsernameError('this username is already exist');
                setFormError('');
                setStep(1);
            } else if (lowerMsg.includes('email')) {
                setEmailError('this email is already exist');
                setFormError('');
                setStep(1);
            } else {
                setFormError(errorMsg);
                setStep(1);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setFormError('');
        setPasswordError('');
        setUsernameError('');
        setEmailError('');
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
                    <div className="bg-white rounded-[24px] w-full max-w-[550px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
                        <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Add New Moderator</h3>
                                <p className="text-xs sm:text-sm text-gray-500">Step 1: Basic Information</p>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleStep1Submit} className="flex flex-col flex-1 overflow-hidden min-h-0">
                            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                                {formError && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                                        <X size={16} className="bg-red-500 text-white rounded-full p-0.5" />
                                        {formError}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter First Name"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            value={newModerator.firstname}
                                            onChange={(e) => setNewModerator({ ...newModerator, firstname: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                                        <input
                                            type="text"
                                            placeholder="Enter Last Name"
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                            value={newModerator.lastname}
                                            onChange={(e) => setNewModerator({ ...newModerator, lastname: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter Username"
                                        className={`w-full px-4 py-2.5 bg-gray-50 border ${usernameError ? 'border-red-500 text-red-600' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`}
                                        value={newModerator.username}
                                        onChange={(e) => {
                                            setUsernameError('');
                                            setNewModerator({ ...newModerator, username: e.target.value.toLowerCase().replace(/\s+/g, '') });
                                        }}
                                    />
                                    {usernameError && (
                                        <p className="text-red-500 text-[13px] mt-1 text-left">{usernameError}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="Enter Email Address"
                                        className={`w-full px-4 py-2.5 bg-gray-50 border ${emailError ? 'border-red-500 text-red-600' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm`}
                                        value={newModerator.email}
                                        onChange={(e) => {
                                            setEmailError('');
                                            setNewModerator({ ...newModerator, email: e.target.value });
                                        }}
                                    />
                                    {emailError && (
                                        <p className="text-red-500 text-[13px] mt-1 text-left">{emailError}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                    <PhoneInput
                                        name="phone"
                                        value={newModerator.phone}
                                        onChange={(e) => setNewModerator({ ...newModerator, phone: e.target.value })}
                                        label={null}
                                        containerClassName="w-full relative"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <input
                                            required
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter Password"
                                            className={`w-full px-4 py-2.5 bg-gray-50 border ${passwordError ? 'border-red-500 text-red-600' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all pr-12 text-sm`}
                                            value={newModerator.password}
                                            onChange={(e) => {
                                                setPasswordError('');
                                                setNewModerator({ ...newModerator, password: e.target.value });
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    {passwordError && (
                                        <p className="text-red-500 text-[13px] mt-1 text-left">{passwordError}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">Gender</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={newModerator.gender}
                                            onChange={(e) => setNewModerator({ ...newModerator, gender: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer text-sm"
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
                            </div>

                            <div className="p-4 sm:p-6 border-t border-gray-100 flex gap-3 shrink-0 bg-white">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 py-2.5 sm:py-3 px-4 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm sm:text-base"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={Boolean(usernameError || emailError)}
                                    className="flex-[2] py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#4E60FF] to-[#A269FF] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
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
