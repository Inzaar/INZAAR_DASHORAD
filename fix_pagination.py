import os
import re

files = [
    "src/features/StudentDashboard/pages/Certificates.jsx",
    "src/features/adminDashborad/components/student/StudentCertificates.jsx",
    "src/features/adminDashborad/components/moderator/ModeratorBatchesComponent.jsx",
    "src/features/adminDashborad/components/moderator/BatchList.jsx",
    "src/features/courses/pages/Courses.jsx",
    "src/features/courses/components/AdminLectureList.jsx"
]

def process_file(filepath):
    try:
        with open(filepath, 'r') as f:
            content = f.read()
        
        # We need to find the block starting with {totalPages > 1 && ( and ending with its matching )}
        # Since it's hard with regex, we can do it with simple string matching.
        # Most of them look like:
        # {totalPages > 1 && (
        #     <div ...
        #         ...
        #     </div>
        # )}
        
        # Just replace itemsPerPage 10/12 to 5 if any
        content = re.sub(r'const \[itemsPerPage, setItemsPerPage\] = useState\([^)]+\)', 'const [itemsPerPage, setItemsPerPage] = useState(5)', content)
        content = re.sub(r'const itemsPerPage = \d+', 'const itemsPerPage = 5', content)
        content = content.replace('limit: 10', 'limit: 5').replace('limit: 12', 'limit: 5').replace('limit: 6', 'limit: 5')

        # Add import if not present
        if 'CustomPagination' not in content:
            content = content.replace("import React", "import { CustomPagination } from '@/components/ui/Pagination';\nimport React")

        with open(filepath, 'w') as f:
            f.write(content)
            
    except Exception as e:
        print(f"Failed {filepath}: {e}")

for f in files:
    process_file(f)

