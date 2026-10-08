import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/api/department';
import toast from 'react-hot-toast';

const DepartmentsModal = ({ isOpen, onClose }) => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newName, setNewName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [departmentToDelete, setDepartmentToDelete] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchDepartments();
        } else {
            // Reset state when closed
            setNewName('');
            setEditingId(null);
            setEditName('');
            setDepartmentToDelete(null);
        }
    }, [isOpen]);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await getAllDepartments();
            setDepartments(res.data || []);
        } catch (error) {
            toast.error("Failed to fetch departments");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        
        try {
            await createDepartment(newName.trim());
            toast.success("Department added successfully");
            setNewName('');
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add department");
        }
    };

    const handleUpdate = async (id) => {
        if (!editName.trim()) return;

        try {
            await updateDepartment(id, editName.trim());
            toast.success("Department updated");
            setEditingId(null);
            fetchDepartments();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update department");
        }
    };

    const handleDelete = async () => {
        if (!departmentToDelete) return;

        try {
            await deleteDepartment(departmentToDelete.id);
            toast.success("Department deleted");
            setDepartmentToDelete(null);
            fetchDepartments();
        } catch (error) {
            toast.error("Failed to delete department");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Departments</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="New Department Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        />
                        <button
                            type="submit"
                            disabled={!newName.trim()}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>

                <div className="p-5 flex-1 overflow-y-auto max-h-[260px]">

                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                    ) : departments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No departments found.
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {departments.map(dept => (
                                <li key={dept._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                    {editingId === dept._id ? (
                                        <div className="flex flex-1 gap-2 mr-2">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-purple-500"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleUpdate(dept._id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                            <button 
                                                onClick={() => handleUpdate(dept._id)}
                                                className="px-3 py-1 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded"
                                            >
                                                Save
                                            </button>
                                            <button 
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-medium text-gray-700 truncate pr-4">
                                                {dept.name}
                                            </span>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => {
                                                        setEditingId(dept._id);
                                                        setEditName(dept.name);
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDepartmentToDelete({ id: dept._id, name: dept.name })}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {departmentToDelete && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 rounded-2xl">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all p-5">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete Department</h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete <span className="font-semibold text-gray-700">"{departmentToDelete.name}"</span>? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 w-full">
                            <button
                                onClick={() => setDepartmentToDelete(null)}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentsModal;
