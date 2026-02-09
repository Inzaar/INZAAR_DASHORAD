const dummyUserCourses = {
    success: true,
    stats: {
        totalEnrolled: 18,
        completed: 0,
        inProgress: 18,
        overallProgress: 2,
        improvement: 2.7
    },
    data: [
        {
            _id: "698380f03b708f683e724545",
            title: "Full Stack Web Development 2026",
            releaseDate: "2026-03-01T00:00:00.000Z",
            instructor: "Hassan Ali",
            batchStrength: 50,
            thumbnail: "https://placehold.co/600x400",
            totalLectures: 3,
            completedLecturesCount: 0,
            lectures: [
                {
                    _id: "lecture_1",
                    name: "Introduction to Web Tech",
                    lectureNo: 1,
                    video: "MaBfIgpzG6c",
                    audio: "https://res.cloudinary.com/demo/video/upload/dog.mp3",
                    lectureProgress: "89%",
                    isLocked: false,
                    isCompleted: false,
                    lastWatchedTime: 80,
                    resources: ['https://res.cloudinary.com/demo/image/upload/long_multi_page_pdf'],
                    studentNote: "N/A",
                    videoTimestamp: "00:00"
                },
                {
                    _id: "lecture_2",
                    name: 'HTML & CSS Deep Dive',
                    lectureNo: 2,
                    video: 's2OccJMWwkM',
                    audio: 'https://res.cloudinary.com/demo/video/upload/dog.mp3',
                    lectureProgress: "45%",
                    isLocked: true,
                    isCompleted: false,
                    resources: [],
                },
                {
                    _id: "lecture_3",
                    name: 'JavaScript Fundamentals',
                    lectureNo: 3,
                    video: 'KrLj6nc516A',
                    audio: 'https://res.cloudinary.com/demo/video/upload/dog.mp3',
                    lectureProgress: "0%",
                    isLocked: true,
                    isCompleted: false,
                    resources: [],
                }
            ],
            createdAt: "2026-02-04T17:25:04.449Z",
            enrolledAt: "2026-02-04T17:35:34.222Z",
            enrollmentId: "698383663b708f683e72455a",
            duration: "60 Days"
        },
        {
            _id: "698384ba3b708f683e724564",
            title: 'Full Stack Web Development 2027',
            releaseDate: '2026-03-01T00:00:00.000Z',
            instructor: 'Hassan Ali',
            batchStrength: 50,
            lectures: [
                {
                    _id: "lecture_1_2027",
                    name: "Intro 2027",
                    lectureNo: 1,
                    lectureProgress: "10%",
                    isLocked: false
                }
            ],
            createdAt: "2026-02-04T17:25:04.449Z",
        },
        // Adding more mock items to verify pagination and list
        {
            _id: "69846e73f9bf5a7d66a4fb8c",
            title: 'New course of mer stack',
            lectures: [{ _id: "l1", name: "Setup", lectureNo: 1, lectureProgress: "0%", isLocked: false }],
            createdAt: "2026-02-04T17:25:04.449Z"
        },
        {
            _id: "69846daff9bf5a7d66a4fb85",
            title: 'New course',
            lectures: [{ _id: "l2", name: "Welcome", lectureNo: 1, lectureProgress: "100%", isLocked: false }],
            createdAt: "2026-02-04T17:25:04.449Z"
        },
        {
            _id: "697b82098f1007b801e1be4b",
            title: 'Full Stack Mastery: Node & Express Expert',
            lectures: [{ _id: "l3", name: "Node Basics", lectureNo: 1, lectureProgress: "50%", isLocked: false }],
            createdAt: "2026-02-04T17:25:04.449Z"
        }
    ]
};


export default dummyUserCourses;
