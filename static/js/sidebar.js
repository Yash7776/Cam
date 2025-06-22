document.addEventListener('DOMContentLoaded', function () {
    // Submenu hover behavior
    const menuItems = document.querySelectorAll('.menu-item');
    const sidebar = document.querySelector('.sidebar');

    menuItems.forEach(item => {
        const submenu = item.querySelector('.submenu');
        if (submenu) {
            item.addEventListener('mouseenter', () => {
                // Hide all other submenus
                document.querySelectorAll('.submenu').forEach(menu => {
                    menu.style.display = 'none';
                });

                // Position the submenu to align with the top of the menu item
                const itemRect = item.getBoundingClientRect();
                const sidebarRect = sidebar.getBoundingClientRect();
                const topPosition = itemRect.top - sidebarRect.top + sidebar.scrollTop;
                submenu.style.top = `${topPosition}px`;

                // Show the submenu
                submenu.style.display = 'block';
                item.classList.add('active');
            });

            item.addEventListener('mouseleave', () => {
                submenu.style.display = 'none';
                item.classList.remove('active');
            });
        }
    });
});