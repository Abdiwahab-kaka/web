// --- 1. DATA STATE ---
// Initial Courses with multiple videos
let courses = [
    {
        id: 1,
        title: "Full Stack Web Development",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
        desc: "Learn HTML, CSS, JS, Node.js and React.",
        videos: [
            "https://www.youtube.com/embed/fT4487J0j-k",
            "https://www.youtube.com/embed/hdI2bqOjy3c",
            "https://www.youtube.com/embed/PkZNo7MFNFg"
        ]
    },
    {
        id: 2,
        title: "Graphic Design Masterclass",
        image: "x.jpg",
        desc: "Master Adobe Photoshop, Illustrator, and InDesign.",
        videos: [
            "https://www.youtube.com/embed/YqQx75OPRa0",
            "https://www.youtube.com/embed/IyR_uYsRdPs"
        ]
    }
];

// Enrollments State
let enrollments = [];

// Admin Edit State
let editingCourseId = null;

// Current video method (url or upload)
let currentVideoMethod = 'url';

// Store uploaded files temporarily
let uploadedFiles = {};

// --- 2. VIDEO METHOD SWITCHING ---
function switchVideoMethod(method) {
    currentVideoMethod = method;
    
    const urlMethodDiv = document.getElementById('video-url-method');
    const uploadMethodDiv = document.getElementById('video-upload-method');
    const btnUrl = document.getElementById('btn-url-method');
    const btnUpload = document.getElementById('btn-upload-method');
    const indicator = document.getElementById('current-method-indicator');
    
    if (method === 'url') {
        urlMethodDiv.classList.remove('hidden');
        uploadMethodDiv.classList.add('hidden');
        btnUrl.classList.remove('bg-gray-200', 'text-gray-700');
        btnUrl.classList.add('bg-blue-600', 'text-white');
        btnUpload.classList.remove('bg-blue-600', 'text-white');
        btnUpload.classList.add('bg-gray-200', 'text-gray-700');
        indicator.textContent = "Current method: Adding video URLs";
    } else {
        urlMethodDiv.classList.add('hidden');
        uploadMethodDiv.classList.remove('hidden');
        btnUpload.classList.remove('bg-gray-200', 'text-gray-700');
        btnUpload.classList.add('bg-blue-600', 'text-white');
        btnUrl.classList.remove('bg-blue-600', 'text-white');
        btnUrl.classList.add('bg-gray-200', 'text-gray-700');
        indicator.textContent = "Current method: Uploading video files";
    }
}

// --- 3. URL VIDEO FIELD MANAGEMENT ---
function addVideoField() {
    const container = document.getElementById('video-fields-container');
    const videoCount = container.children.length;
    
    const newField = document.createElement('div');
    newField.className = 'flex gap-2 mb-2';
    newField.innerHTML = `
        <input type="text" class="video-url-input p-2 border rounded text-sm w-full" placeholder="YouTube Embed URL" required>
        ${videoCount > 0 ? `<button type="button" onclick="removeVideoField(this)" class="text-red-500 hover:text-red-700 px-2">
            <i class="fas fa-times"></i>
        </button>` : ''}
    `;
    container.appendChild(newField);
}

function removeVideoField(button) {
    button.parentElement.remove();
}

// --- 4. UPLOAD VIDEO FIELD MANAGEMENT ---
function addUploadField() {
    const container = document.getElementById('upload-fields-container');
    const fieldCount = container.children.length / 2; // Each field has upload area + file info
    
    const fieldId = fieldCount;
    
    // Upload Area
    const uploadArea = document.createElement('div');
    uploadArea.className = 'upload-area p-6 text-center mb-4 cursor-pointer';
    uploadArea.setAttribute('onclick', `document.getElementById('video-file-${fieldId}').click()`);
    uploadArea.setAttribute('ondrop', `handleDrop(event, ${fieldId})`);
    uploadArea.setAttribute('ondragover', `handleDragOver(event)`);
    uploadArea.setAttribute('ondragleave', `handleDragLeave(event)`);
    uploadArea.innerHTML = `
        <input type="file" id="video-file-${fieldId}" class="hidden" accept="video/*" onchange="handleFileSelect(event, ${fieldId})">
        <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
        <p class="text-sm text-gray-600 mb-1">Click to browse or drag & drop video file</p>
        <p class="text-xs text-gray-500">Supported: MP4, WebM, OGG (Max: 100MB)</p>
    `;
    
    // File Info (hidden initially)
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info hidden';
    fileInfo.id = `file-info-${fieldId}`;
    fileInfo.innerHTML = `
        <div class="bg-green-50 border border-green-200 rounded p-3 flex justify-between items-center">
            <div class="flex items-center">
                <i class="fas fa-file-video text-green-500 mr-2"></i>
                <div>
                    <p class="text-sm font-medium text-gray-800" id="file-name-${fieldId}"></p>
                    <p class="text-xs text-gray-500" id="file-size-${fieldId}"></p>
                </div>
            </div>
            <button type="button" onclick="removeUploadedFile(${fieldId})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.appendChild(uploadArea);
    container.appendChild(fileInfo);
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e, fieldId) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('video/')) {
            handleFileUpload(file, fieldId);
        } else {
            showCustomMessage('Please upload only video files');
        }
    }
}

function handleFileSelect(e, fieldId) {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file, fieldId);
    }
}

function handleFileUpload(file, fieldId) {
    // Check file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
        showCustomMessage('File is too large. Maximum size is 100MB.');
        return;
    }
    
    // Check file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (!validTypes.includes(file.type)) {
        showCustomMessage('Please upload only MP4, WebM, or OGG video files');
        return;
    }
    
    // Store file reference
    uploadedFiles[fieldId] = file;
    
    // Update UI
    const fileName = document.getElementById(`file-name-${fieldId}`);
    const fileSize = document.getElementById(`file-size-${fieldId}`);
    const fileInfo = document.getElementById(`file-info-${fieldId}`);
    
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.classList.remove('hidden');
    
    showCustomMessage(`Video "${file.name}" uploaded successfully (not saved to server yet)`);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeUploadedFile(fieldId) {
    delete uploadedFiles[fieldId];
    
    const fileInfo = document.getElementById(`file-info-${fieldId}`);
    const fileInput = document.getElementById(`video-file-${fieldId}`);
    
    if (fileInfo) fileInfo.classList.add('hidden');
    if (fileInput) fileInput.value = '';
}

// --- 5. CORE FUNCTIONS ---

// Render Courses on Home Page
function renderCourses() {
    const courseGrid = document.getElementById('course-grid');
    const courseSelect = document.getElementById('course-select');
    
    // Clear existing
    courseGrid.innerHTML = '';
    courseSelect.innerHTML = '';

    courses.forEach(course => {
        // Populate Dropdown
        const option = document.createElement('option');
        option.value = course.title;
        option.textContent = course.title;
        courseSelect.appendChild(option);

        // Populate Grid
        const card = document.createElement('div');
        card.className = 'course-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full';
        card.innerHTML = `
            <div class="relative h-48 bg-gray-200">
                <img src="${course.image}" alt="${course.title}" class="w-full h-full object-cover transition duration-300" id="img-${course.id}">
                <div id="video-container-${course.id}" class="hidden absolute top-0 left-0 w-full h-full">
                    <div class="relative w-full h-full">
                        <iframe class="w-full h-full" src="${course.videos[0]}" title="Course Preview" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        ${course.videos.length > 1 ? `
                        <div class="absolute bottom-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                            ${course.videos.length} Videos
                        </div>
                        ` : ''}
                    </div>
                </div>
                <button onclick="toggleVideo(${course.id})" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-30 transition group">
                    <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                        <i id="icon-${course.id}" class="fas fa-play text-blue-600 pl-1"></i>
                    </div>
                </button>
            </div>
            <div class="p-6 flex flex-col flex-grow">
                <h3 class="text-xl font-bold text-gray-800 mb-2">${course.title}</h3>
                <p class="text-gray-600 mb-4 flex-grow text-sm">${course.desc}</p>
                <div class="flex justify-between items-center mt-auto">
                    <span class="text-blue-600 font-bold">$49.99</span>
                    <a href="#enroll" onclick="selectCourseInForm('${course.title}')" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm">Enroll Now</a>
                </div>
            </div>
        `;
        courseGrid.appendChild(card);
    });

    // Update Admin List as well
    renderAdminCourseList();
}

function toggleVideo(id) {
    const img = document.getElementById(`img-${id}`);
    const videoContainer = document.getElementById(`video-container-${id}`);
    const icon = document.getElementById(`icon-${id}`);
    
    if (videoContainer.classList.contains('hidden')) {
        videoContainer.classList.remove('hidden');
        img.classList.add('hidden');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-times', 'text-red-500');
        icon.classList.remove('text-blue-600');
    } else {
        videoContainer.classList.add('hidden');
        img.classList.remove('hidden');
        icon.classList.remove('fa-times', 'text-red-500');
        icon.classList.add('fa-play', 'text-blue-600');
        // Stop all videos in the container
        const iframe = videoContainer.querySelector('iframe');
        iframe.src = iframe.src; // Reset to stop playback
    }
}

function selectCourseInForm(title) {
    document.getElementById('course-select').value = title;
}

// --- 6. ENROLLMENT LOGIC ---
document.addEventListener('DOMContentLoaded', function() {
    const enrollmentForm = document.getElementById('enrollment-form');
    if (enrollmentForm) {
        enrollmentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value.toLowerCase(); // Normalized
            const course = document.getElementById('course-select').value;
            
            // Add to enrollments array
            const enrollment = {
                id: Date.now(),
                name: name,
                email: email,
                course: course,
                status: 'Pending'
            };
            
            enrollments.push(enrollment);
            renderAdminEnrollments(); // Update admin view instantly
            
            // Replaced alert with custom function
            showCustomMessage(`Thank you, ${name}! Your request for "${course}" has been submitted for review. Once approved, you can login with your email.`);
            this.reset();
        });
    }
});

// --- 7. ADMIN & LOGIN LOGIC ---

function openLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('admin-user').value;
    const pass = document.getElementById('admin-pass').value;
    const errorMsg = document.getElementById('login-error');

    // Hardcoded Credentials (used for demo functionality)
    if (user === 'hanad' && pass === '5566') {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('main-content').classList.add('hidden'); // Hide main site
        closeLoginModal();
        errorMsg.classList.add('hidden');
    } else {
        errorMsg.classList.remove('hidden');
    }
}

function logoutAdmin() {
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
    // Clear uploaded files on logout
    uploadedFiles = {};
}

function closeAdminPanel() {
    // Simply hides dashboard, shows site, doesn't clear session
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
}

// --- 8. ADMIN DASHBOARD FUNCTIONS ---

// Render Admin Course List
function renderAdminCourseList() {
    const list = document.getElementById('admin-course-list');
    list.innerHTML = '';
    courses.forEach(c => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="p-2 text-sm text-gray-800">${c.title} <span class="text-xs text-gray-500">(${c.videos.length} videos)</span></td>
            <td class="p-2 text-right flex justify-end gap-2">
                <button onclick="editCourse(${c.id})" class="text-blue-500 hover:text-blue-700 text-sm font-medium">Edit</button>
                <button onclick="deleteCourse(${c.id})" class="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
            </td>
        `;
        list.appendChild(tr);
    });
}

// Add OR Edit Course Logic
document.addEventListener('DOMContentLoaded', function() {
    const courseForm = document.getElementById('course-form');
    if (courseForm) {
        courseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('course-title').value;
            const image = document.getElementById('course-image').value;
            const desc = document.getElementById('course-desc').value;
            
            let videos = [];
            
            if (currentVideoMethod === 'url') {
                // Get URL videos
                const videoInputs = document.querySelectorAll('.video-url-input');
                videos = Array.from(videoInputs).map(input => input.value).filter(v => v.trim() !== '');
            } else {
                // Get uploaded files (for demo, we'll create blob URLs)
                const fileKeys = Object.keys(uploadedFiles);
                if (fileKeys.length === 0) {
                    showCustomMessage("Please upload at least one video file");
                    return;
                }
                
                // In a real application, you would upload files to a server
                // For this demo, we'll create object URLs
                fileKeys.forEach(key => {
                    const file = uploadedFiles[key];
                    if (file) {
                        // Create a blob URL for the file
                        const blobUrl = URL.createObjectURL(file);
                        videos.push(blobUrl);
                        
                        // Note: In production, you would upload to server and get actual URLs
                        // For now, we're just using blob URLs which work in the current session
                    }
                });
            }

            if (videos.length === 0) {
                showCustomMessage("Please add at least one video");
                return;
            }

            if (editingCourseId) {
                // Update Existing Course
                const index = courses.findIndex(c => c.id === editingCourseId);
                if (index !== -1) {
                    courses[index] = { id: editingCourseId, title, image, desc, videos };
                    showCustomMessage("Course updated successfully!");
                }
                cancelEditMode();
            } else {
                // Add New Course
                const newCourse = {
                    id: Date.now(),
                    title, image, desc, videos
                };
                courses.push(newCourse);
                showCustomMessage("New course added successfully!");
                this.reset();
                // Reset video fields
                resetVideoFields();
            }

            // Clear uploaded files after adding course
            uploadedFiles = {};
            
            renderCourses(); // Updates both Main Site and Admin List
        });
    }
});

function resetVideoFields() {
    // Reset URL method
    const urlContainer = document.getElementById('video-fields-container');
    urlContainer.innerHTML = `
        <div class="flex gap-2 mb-2">
            <input type="text" class="video-url-input p-2 border rounded text-sm w-full" placeholder="YouTube Embed URL" required>
        </div>
    `;
    
    // Reset Upload method
    const uploadContainer = document.getElementById('upload-fields-container');
    uploadContainer.innerHTML = `
        <div class="upload-area p-6 text-center mb-4 cursor-pointer" onclick="document.getElementById('video-file-0').click()" ondrop="handleDrop(event, 0)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)">
            <input type="file" id="video-file-0" class="hidden" accept="video/*" onchange="handleFileSelect(event, 0)">
            <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
            <p class="text-sm text-gray-600 mb-1">Click to browse or drag & drop video file</p>
            <p class="text-xs text-gray-500">Supported: MP4, WebM, OGG (Max: 100MB)</p>
        </div>
        <div class="file-info hidden" id="file-info-0">
            <div class="bg-green-50 border border-green-200 rounded p-3 flex justify-between items-center">
                <div class="flex items-center">
                    <i class="fas fa-file-video text-green-500 mr-2"></i>
                    <div>
                        <p class="text-sm font-medium text-gray-800" id="file-name-0"></p>
                        <p class="text-xs text-gray-500" id="file-size-0"></p>
                    </div>
                </div>
                <button type="button" onclick="removeUploadedFile(0)" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // Reset to URL method by default
    switchVideoMethod('url');
}

// Edit Course Function
function editCourse(id) {
    const course = courses.find(c => c.id === id);
    if (course) {
        editingCourseId = id;
        
        // Populate Form
        document.getElementById('course-title').value = course.title;
        document.getElementById('course-image').value = course.image;
        document.getElementById('course-desc').value = course.desc;

        // Check if course uses URLs (YouTube) or uploaded files
        const isYouTubeURL = course.videos.length > 0 && 
            (course.videos[0].includes('youtube.com') || course.videos[0].includes('youtu.be'));
        
        if (isYouTubeURL) {
            // Use URL method
            switchVideoMethod('url');
            const container = document.getElementById('video-fields-container');
            container.innerHTML = '';
            
            course.videos.forEach((video, index) => {
                const newField = document.createElement('div');
                newField.className = 'flex gap-2 mb-2';
                newField.innerHTML = `
                    <input type="text" class="video-url-input p-2 border rounded text-sm w-full" placeholder="YouTube Embed URL" required value="${video}">
                    ${index > 0 ? `<button type="button" onclick="removeVideoField(this)" class="text-red-500 hover:text-red-700 px-2">
                        <i class="fas fa-times"></i>
                    </button>` : ''}
                `;
                container.appendChild(newField);
            });
        } else {
            // For demo purposes, we can't re-display uploaded files
            // So we'll show URL method with placeholder
            switchVideoMethod('url');
            showCustomMessage("Note: Previously uploaded videos cannot be edited. Please add new video URLs.");
            const container = document.getElementById('video-fields-container');
            container.innerHTML = `
                <div class="flex gap-2 mb-2">
                    <input type="text" class="video-url-input p-2 border rounded text-sm w-full" placeholder="Add new video URLs here" required>
                </div>
            `;
        }

        // Change Form Appearance
        document.getElementById('form-title').textContent = "Edit Course Details";
        const submitBtn = document.getElementById('form-submit-btn');
        submitBtn.textContent = "Update Course";
        submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        submitBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        
        // Show Cancel Button
        document.getElementById('cancel-edit-btn').classList.remove('hidden');
        
        // Scroll to top of form
        document.querySelector('#course-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// Cancel Edit Mode
function cancelEditMode() {
    editingCourseId = null;
    document.getElementById('course-form').reset();
    
    // Reset video fields
    resetVideoFields();
    
    // Reset Form Appearance
    document.getElementById('form-title').textContent = "Add New Course";
    const submitBtn = document.getElementById('form-submit-btn');
    submitBtn.textContent = "Add Course";
    submitBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
    submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
    
    // Hide Cancel Button
    document.getElementById('cancel-edit-btn').classList.add('hidden');
    
    // Clear uploaded files
    uploadedFiles = {};
}

// Delete Course
function deleteCourse(id) {
    if(window.confirm('Are you sure you want to delete this course?')) {
        // If we are editing this course, cancel edit mode
        if (editingCourseId === id) {
            cancelEditMode();
        }
        courses = courses.filter(c => c.id !== id);
        renderCourses();
    }
}

// Render Enrollments
function renderAdminEnrollments() {
    const list = document.getElementById('admin-enrollment-list');
    const noMsg = document.getElementById('no-enrollments-msg');
    list.innerHTML = '';

    if (enrollments.length === 0) {
        noMsg.classList.remove('hidden');
        return;
    } else {
        noMsg.classList.add('hidden');
    }

    enrollments.forEach(e => {
        let statusColor = 'text-yellow-600';
        if (e.status === 'Accepted') statusColor = 'text-green-600 font-bold';
        if (e.status === 'Rejected') statusColor = 'text-red-600';

        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50";
        tr.innerHTML = `
            <td class="p-2 text-sm font-medium">${e.name}</td>
            <td class="p-2 text-sm text-gray-600">${e.course}</td>
            <td class="p-2 text-sm ${statusColor}">${e.status}</td>
            <td class="p-2 text-right space-x-2">
                ${e.status === 'Pending' ? `
                <button onclick="updateStatus(${e.id}, 'Accepted')" class="text-green-500 hover:text-green-700" title="Accept"><i class="fas fa-check"></i></button>
                <button onclick="updateStatus(${e.id}, 'Rejected')" class="text-red-500 hover:text-red-700" title="Reject"><i class="fas fa-times"></i></button>
                ` : '<span class="text-gray-400 text-xs">Done</span>'}
            </td>
        `;
        list.appendChild(tr);
    });
}

function updateStatus(id, newStatus) {
    const enrollment = enrollments.find(e => e.id === id);
    if (enrollment) {
        enrollment.status = newStatus;
        renderAdminEnrollments();
    }
}

// --- 9. UTILITY FOR CUSTOM MESSAGES (Replacing alert()) ---
function showCustomMessage(message) {
    const msgBox = document.createElement('div');
    msgBox.className = 'fixed bottom-5 right-5 bg-green-500 text-white p-4 rounded-lg shadow-xl z-[200] transition transform translate-y-full opacity-0';
    msgBox.textContent = message;
    document.body.appendChild(msgBox);

    // Show animation
    setTimeout(() => {
        msgBox.classList.remove('translate-y-full', 'opacity-0');
    }, 10);

    // Hide animation and removal
    setTimeout(() => {
        msgBox.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => msgBox.remove(), 500);
    }, 3000);
}

// --- 10. STUDENT PORTAL LOGIC ---

function openStudentLoginModal() {
    document.getElementById('student-login-modal').classList.remove('hidden');
}

function closeStudentLoginModal() {
    document.getElementById('student-login-modal').classList.add('hidden');
    document.getElementById('student-login-error').classList.add('hidden');
}

function handleStudentLogin(e) {
    e.preventDefault();
    const email = document.getElementById('student-email-login').value.toLowerCase();
    const errorMsg = document.getElementById('student-login-error');

    // Find accepted enrollments for this email
    const myEnrollments = enrollments.filter(e => e.email === email && e.status === 'Accepted');

    if (myEnrollments.length > 0) {
        // Success
        closeStudentLoginModal();
        document.getElementById('main-content').classList.add('hidden');
        document.getElementById('student-dashboard').classList.remove('hidden');
        
        // Set Name from first enrollment
        document.getElementById('student-name-display').textContent = myEnrollments[0].name;
        
        // Render content
        renderStudentDashboard(myEnrollments);
    } else {
        // Determine specific error
        const pending = enrollments.find(e => e.email === email && e.status === 'Pending');
        if (pending) {
            errorMsg.textContent = "Your application is still pending approval.";
        } else if (enrollments.find(e => e.email === email)) {
             errorMsg.textContent = "Your application was not accepted.";
        } else {
            errorMsg.textContent = "No enrollment found for this email.";
        }
        errorMsg.classList.remove('hidden');
    }
}

function renderStudentDashboard(myEnrollments) {
    const list = document.getElementById('student-course-list');
    const noAccessMsg = document.getElementById('no-access-msg');
    list.innerHTML = '';

    if (myEnrollments.length === 0) {
        noAccessMsg.classList.remove('hidden');
        return;
    } else {
        noAccessMsg.classList.add('hidden');
    }

    myEnrollments.forEach((enrollment, index) => {
        // Find full course details
        const courseData = courses.find(c => c.title === enrollment.course);
        
        if(courseData) {
            const courseDiv = document.createElement('div');
            courseDiv.className = "bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200";
            
            // Create video tabs if multiple videos
            let videoTabs = '';
            let videoContents = '';
            
            if (courseData.videos.length > 1) {
                videoTabs = `
                    <div class="flex space-x-2 p-4 bg-gray-50 border-b">
                        ${courseData.videos.map((video, i) => `
                            <button onclick="switchStudentVideo(${index}, ${i})" 
                                    class="tab-${index}-${i} px-4 py-2 rounded ${i === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                                Video ${i + 1}
                            </button>
                        `).join('')}
                    </div>
                `;
                
                videoContents = courseData.videos.map((video, i) => `
                    <div class="video-${index}-${i} ${i === 0 ? '' : 'hidden'}">
                        <div class="aspect-w-16 aspect-h-9 bg-black">
                            ${video.includes('blob:') ? 
                                `<video controls class="w-full h-96">
                                    <source src="${video}" type="video/mp4">
                                    Your browser does not support the video tag.
                                </video>` :
                                `<iframe class="w-full h-96" src="${video}" title="${courseData.title} - Video ${i+1}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                            }
                        </div>
                    </div>
                `).join('');
            } else {
                videoContents = `
                    <div class="aspect-w-16 aspect-h-9 bg-black">
                        ${courseData.videos[0].includes('blob:') ? 
                            `<video controls class="w-full h-96">
                                <source src="${courseData.videos[0]}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>` :
                            `<iframe class="w-full h-96" src="${courseData.videos[0]}" title="${courseData.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
                        }
                    </div>
                `;
            }
            
            courseDiv.innerHTML = `
                ${videoTabs}
                ${videoContents}
                <div class="p-6">
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">${courseData.title}</h3>
                    <p class="text-gray-600 mb-4">${courseData.desc}</p>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center text-green-600 font-semibold gap-2">
                            <i class="fas fa-check-circle"></i> Enrolled & Active
                        </div>
                        <div class="text-sm text-gray-500">
                            <i class="fas fa-video mr-1"></i> ${courseData.videos.length} video${courseData.videos.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
            `;
            list.appendChild(courseDiv);
        }
    });
}

function switchStudentVideo(courseIndex, videoIndex) {
    // Hide all videos for this course
    const allVideos = document.querySelectorAll(`[class*="video-${courseIndex}-"]`);
    allVideos.forEach(video => video.classList.add('hidden'));
    
    // Show selected video
    const selectedVideo = document.querySelector(`.video-${courseIndex}-${videoIndex}`);
    if (selectedVideo) selectedVideo.classList.remove('hidden');
    
    // Update tabs
    const allTabs = document.querySelectorAll(`[class*="tab-${courseIndex}-"]`);
    allTabs.forEach(tab => {
        tab.classList.remove('bg-blue-600', 'text-white');
        tab.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const selectedTab = document.querySelector(`.tab-${courseIndex}-${videoIndex}`);
    if (selectedTab) {
        selectedTab.classList.remove('bg-gray-200', 'text-gray-700');
        selectedTab.classList.add('bg-blue-600', 'text-white');
    }
}

function logoutStudent() {
    document.getElementById('student-dashboard').classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
}

// --- 11. INITIALIZATION ---
// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    renderCourses();
    renderAdminEnrollments();

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu) {
                mobileMenu.classList.toggle('hidden');
            }
        });
    }
    
    // Initialize video method
    switchVideoMethod('url');
});