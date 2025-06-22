console.log("Camera Is Working")

$(document).ready(function () {
    // Simulated camera data
    let cameras = [
        { name: "Main Door Cam", area: "Front Entrance Cameras", url: "https://via.placeholder.com/300x200?text=Main+Door+Cam", status: "online" },
        { name: "Loading Dock View", area: "Warehouse 1 Feeds", url: "https://via.placeholder.com/300x200?text=Loading+Dock+View", status: "offline" }
    ];

    let deleteMode = false;
    let cameraToDelete = null;

    // DOM elements
    const $addIpBtn = $('#add-ip-btn');
    const $removeIpBtn = $('#remove-ip-btn');
    const $doneBtn = $('#done-btn');
    const $cameraGrid = $('#camera-grid');
    const addIpModal = new bootstrap.Modal('#addIpModal');
    const $addIpForm = $('#add-ip-form');
    const deleteConfirmModal = new bootstrap.Modal('#deleteConfirmModal');
    const $deleteConfirmMessage = $('#delete-confirm-message');
    const $cancelDeleteBtn = $('#cancel-delete-btn');
    const $confirmDeleteBtn = $('#confirm-delete-btn');
    const noDataModal = new bootstrap.Modal('#noDataModal');

    // Render camera grid

    // Toggle delete mode
    function toggleDeleteMode() {
        deleteMode = !deleteMode;
        $cameraGrid.toggleClass('delete-mode', deleteMode);
        $('.delete-icon').toggleClass('d-none', !deleteMode);
        $removeIpBtn.toggleClass('d-none', deleteMode);
        $doneBtn.toggleClass('d-none', !deleteMode);
    }

    // Handle add IP button
    $addIpBtn.on('click', () => {
        addIpModal.show();
    });

    // Handle add IP form submission
    $addIpForm.on('submit', (e) => {
        e.preventDefault();
        const cameraName = $('#camera-name').val();
        const areaName = $('#area-name').val();
        const ipAddress = $('#ip-address').val();
        const username = $('#username').val();
        const password = $('#password').val();

        // Simulate IP validation (replace with actual stream validation)
        if (ipAddress) {
            cameras.push({
                name: cameraName,
                area: areaName,
                url: ipAddress, // Use placeholder for demo
                status: Math.random() > 0.5 ? 'online' : 'offline'
            });
            addIpModal.hide();
            $addIpForm[0].reset();
        } else {
            $('#noDataMessage').text('Could not connect to camera. Please check the IP address.');
            noDataModal.show();
        }
    });

    // Handle remove IP button
    $removeIpBtn.on('click', toggleDeleteMode);
    $doneBtn.on('click', toggleDeleteMode);

    // Handle delete confirmation
    $cancelDeleteBtn.on('click', () => {
        deleteConfirmModal.hide();
        cameraToDelete = null;
    });

    $confirmDeleteBtn.on('click', () => {
        if (cameraToDelete) {
            cameras = cameras.filter(cam => cam !== cameraToDelete);
            deleteConfirmModal.hide();
            cameraToDelete = null;
            toggleDeleteMode();
        }
    });

    // Initial render
});