const fs = require('fs');
const path = './src/features/adminDashborad/pages/ExportStudentReportsPage.jsx';
let code = fs.readFileSync(path, 'utf8');

// We need to replace the entire desktop filters block
const desktopStart = '<div className="hidden xl:flex flex-wrap gap-4 items-end flex-1 w-full">';
const desktopEnd = '</div>\n\n                                {/* Shared Search & Clear Buttons */}';

if (code.includes(desktopStart) && code.includes(desktopEnd)) {
    const newDesktopFilters = `<div className="hidden xl:flex flex-wrap gap-4 items-end flex-1 w-full">
                                    <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">{t("all_students_filter", "All Students")}</option>
                                            <option value="active">{t("active_students", "Active Students")}</option>
                                            <option value="inactive">{t("inactive_students", "Inactive Students")}</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">GENDER</span>
                                        <select
                                            value={filterGender}
                                            onChange={(e) => setFilterGender(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">All Genders</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">COURSE</span>
                                        <select
                                            value={filterCourse}
                                            onChange={(e) => setFilterCourse(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">All Courses</option>
                                            {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">BATCH</span>
                                        <select
                                            value={filterBatch}
                                            onChange={(e) => setFilterBatch(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">All Batches</option>
                                            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">MODERATOR</span>
                                        <select
                                            value={filterModerator}
                                            onChange={(e) => setFilterModerator(e.target.value)}
                                            className="w-full pl-4 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                        >
                                            <option value="">All Moderators</option>
                                            {moderators.map(m => <option key={m._id} value={m._id}>{m.firstname} {m.lastname}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                        <div className="relative w-full">
                                            <input
                                                type="date"
                                                value={filterFrom}
                                                onChange={(e) => setFilterFrom(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                        <div className="relative w-full">
                                            <input
                                                type="date"
                                                value={filterTo}
                                                onChange={(e) => setFilterTo(e.target.value)}
                                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                            />
                                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                {/* Shared Search & Clear Buttons */}`;

    const regex = new RegExp(desktopStart.replace(/[.*+?^$\\{}()|[\\]\\\\]/g, '\\\\$&') + '([\\\\s\\\\S]*?)' + desktopEnd.replace(/[.*+?^$\\{}()|[\\]\\\\]/g, '\\\\$&'));
    code = code.replace(regex, newDesktopFilters);
    
    // Now Mobile Dropdown Popup
    const mobileStart = '<div className="xl:hidden absolute top-full right-0 mt-2 w-[260px] p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col gap-4">';
    const mobileEnd = '</div>\n                                    </>\n                                )}';
    
    if (code.includes(mobileStart) && code.includes(mobileEnd)) {
        const newMobileFilters = `<div className="xl:hidden absolute top-full right-0 mt-2 w-[300px] max-h-[80vh] overflow-y-auto p-4 bg-white border border-gray-200 rounded-xl shadow-xl z-50 flex flex-col gap-4">
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("status_upper", "STATUS")}</span>
                                                <select
                                                    value={filterStatus}
                                                    onChange={(e) => setFilterStatus(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">{t("all_students_filter", "All Students")}</option>
                                                    <option value="active">{t("active_students", "Active Students")}</option>
                                                    <option value="inactive">{t("inactive_students", "Inactive Students")}</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">GENDER</span>
                                                <select
                                                    value={filterGender}
                                                    onChange={(e) => setFilterGender(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">All Genders</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">COURSE</span>
                                                <select
                                                    value={filterCourse}
                                                    onChange={(e) => setFilterCourse(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">All Courses</option>
                                                    {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">BATCH</span>
                                                <select
                                                    value={filterBatch}
                                                    onChange={(e) => setFilterBatch(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">All Batches</option>
                                                    {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">MODERATOR</span>
                                                <select
                                                    value={filterModerator}
                                                    onChange={(e) => setFilterModerator(e.target.value)}
                                                    className="w-full pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                                                >
                                                    <option value="">All Moderators</option>
                                                    {moderators.map(m => <option key={m._id} value={m._id}>{m.firstname} {m.lastname}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("from_upper", "FROM")}</span>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={filterFrom}
                                                        onChange={(e) => setFilterFrom(e.target.value)}
                                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 w-full">
                                                <span className="text-xs font-bold text-gray-400 uppercase">{t("to_upper", "TO")}</span>
                                                <div className="relative">
                                                    <input
                                                        type="date"
                                                        value={filterTo}
                                                        onChange={(e) => setFilterTo(e.target.value)}
                                                        className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                                                    />
                                                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                }`;
        const mRegex = new RegExp(mobileStart.replace(/[.*+?^$\\{}()|[\\]\\\\]/g, '\\\\$&') + '([\\\\s\\\\S]*?)' + mobileEnd.replace(/[.*+?^$\\{}()|[\\]\\\\]/g, '\\\\$&'));
        code = code.replace(mRegex, newMobileFilters);
    }
    
    fs.writeFileSync(path, code);
    console.log('Reordered Desktop and Mobile Filters Successfully!');
} else {
    console.log('Could not find desktop start/end blocks');
}
