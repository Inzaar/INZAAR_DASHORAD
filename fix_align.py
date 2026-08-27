import os
import re

files = [
    "src/components/shared/SharedStudentTable.jsx",
    "src/components/ui/statusTable/StatusTable.jsx",
    "src/features/courses/pages/Courses.jsx",
    "src/features/adminDashborad/pages/StudentProfilesPage.jsx",
    "src/features/adminDashborad/pages/ModeratorsPage.jsx",
    "src/features/courses/components/AdminLectureList.jsx",
    "src/features/StudentDashboard/pages/Certificates.jsx",
    "src/features/adminDashborad/pages/AdminCoursesPage.jsx",
    "src/features/adminDashborad/pages/CourseReportsPage.jsx",
    "src/features/adminDashborad/components/student/StudentCertificates.jsx",
    "src/features/adminDashborad/components/moderator/ModeratorBatchesComponent.jsx",
    "src/features/adminDashborad/pages/ModeratorReportsPage.jsx",
    "src/features/adminDashborad/components/moderator/BatchList.jsx"
]

def process_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Replace justify-center with justify-end specifically on lines wrapping CustomPagination
        lines = content.split('\n')
        for i in range(len(lines)):
            if 'CustomPagination' in lines[i]:
                # check the lines above for justify-center and replace it
                for j in range(max(0, i-3), i+1):
                    if 'justify-center' in lines[j] and 'flex' in lines[j] and '<div' in lines[j]:
                        lines[j] = lines[j].replace('justify-center', 'justify-end')
        
        content = '\n'.join(lines)
        with open(filepath, 'w') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Failed {filepath}: {e}")

for f in files:
    process_file(f)

