document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.close-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            window.close();
        });
    });
});
