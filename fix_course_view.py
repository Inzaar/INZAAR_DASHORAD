import re

with open('/home/muzamil-hussain/Desktop/inzaar Zb/INZAAR_DASHORAD/src/features/courses/pages/CourseView.jsx', 'r') as f:
    content = f.read()

# 1. Fix the top buttons (mb-1)
old_top = """                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                                                                        {(!isSelectionMode && !isSenderStudent) && (
                                                                            <>
                                                                                <div className="relative z-50">
                                                                                    <button onClick={() => setActiveReactionPopup(activeReactionPopup === comment._id ? null : comment._id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                        <Smile size={14} />
                                                                                    </button>
                                                                                    {activeReactionPopup === comment._id && (
                                                                                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-full px-2 py-1 flex items-center gap-1 z-10">
                                                                                            {EMOJIS.map(emoji => (
                                                                                                <button key={emoji} onClick={() => handleReactToComment(comment._id, emoji)} className="text-lg hover:scale-125 transition-transform px-1">
                                                                                                    {emoji}
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {isMe && (
                                                                                    <button onClick={() => { setEditingCommentId(comment._id); setEditingCommentText(comment.content); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                        <Edit2 size={14} />
                                                                                    </button>
                                                                                )}
                                                                                <button onClick={() => handleDeleteComment(comment._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>"""

new_top = """                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        {(!isSelectionMode && !isSenderStudent) && (
                                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <div className="relative z-50">
                                                                                    <button onClick={() => setActiveReactionPopup(activeReactionPopup === comment._id ? null : comment._id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                        <Smile size={14} />
                                                                                    </button>
                                                                                    {activeReactionPopup === comment._id && (
                                                                                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-full px-2 py-1 flex items-center gap-1 z-10">
                                                                                            {EMOJIS.map(emoji => (
                                                                                                <button key={emoji} onClick={() => handleReactToComment(comment._id, emoji)} className="text-lg hover:scale-125 transition-transform px-1">
                                                                                                    {emoji}
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {isMe && (
                                                                                    <button onClick={() => { setEditingCommentId(comment._id); setEditingCommentText(comment.content); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                        <Edit2 size={14} />
                                                                                    </button>
                                                                                )}
                                                                                <button onClick={() => handleDeleteComment(comment._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>"""
content = content.replace(old_top, new_top)

# 2. Fix the bottom buttons (mt-1) and correctly close the flex-col max-w-[90%]
old_bottom = """                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                                                                        {(!isSelectionMode && isSenderStudent) && (
                                                                            <>
                                                                                <div className="relative z-50">
                                                                                    <button onClick={() => setActiveReactionPopup(activeReactionPopup === comment._id ? null : comment._id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                        <Smile size={14} />
                                                                                    </button>
                                                                                    {activeReactionPopup === comment._id && (
                                                                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-full px-2 py-1 flex items-center gap-1 z-10">
                                                                                            {EMOJIS.map(emoji => (
                                                                                                <button key={emoji} onClick={() => handleReactToComment(comment._id, emoji)} className="text-lg hover:scale-125 transition-transform px-1">
                                                                                                    {emoji}
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {isMe && (
                                                                                    <button onClick={() => { setEditingCommentId(comment._id); setEditingCommentText(comment.content); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                        <Edit2 size={14} />
                                                                                    </button>
                                                                                )}
                                                                                <button onClick={() => handleDeleteComment(comment._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {isSelectionMode && !isSenderStudent && (
                                                                    <button onClick={() => handleToggleCommentSelection(comment._id)} className="text-gray-400 hover:text-blue-600 transition-colors shrink-0">
                                                                        {isSelected ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );"""

new_bottom = """                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        {(!isSelectionMode && isSenderStudent) && (
                                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                <div className="relative z-50">
                                                                                    <button onClick={() => setActiveReactionPopup(activeReactionPopup === comment._id ? null : comment._id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                        <Smile size={14} />
                                                                                    </button>
                                                                                    {activeReactionPopup === comment._id && (
                                                                                        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-100 shadow-xl rounded-full px-2 py-1 flex items-center gap-1 z-10">
                                                                                            {EMOJIS.map(emoji => (
                                                                                                <button key={emoji} onClick={() => handleReactToComment(comment._id, emoji)} className="text-lg hover:scale-125 transition-transform px-1">
                                                                                                    {emoji}
                                                                                                </button>
                                                                                            ))}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                {isMe && (
                                                                                    <button onClick={() => { setEditingCommentId(comment._id); setEditingCommentText(comment.content); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                        <Edit2 size={14} />
                                                                                    </button>
                                                                                )}
                                                                                <button onClick={() => handleDeleteComment(comment._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors">
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {isSelectionMode && !isSenderStudent && (
                                                                    <button onClick={() => handleToggleCommentSelection(comment._id)} className="text-gray-400 hover:text-blue-600 transition-colors shrink-0">
                                                                        {isSelected ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );"""
content = content.replace(old_bottom, new_bottom)

with open('/home/muzamil-hussain/Desktop/inzaar Zb/INZAAR_DASHORAD/src/features/courses/pages/CourseView.jsx', 'w') as f:
    f.write(content)
print("Done")
