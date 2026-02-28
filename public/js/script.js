// Toast notification system
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

// Show alerts from server-side as toasts
document.addEventListener('DOMContentLoaded', function() {
    // Check for error messages in data attributes
    const errorElement = document.querySelector('[data-error]');
    if (errorElement) {
        showToast(errorElement.dataset.error, 'error');
    }
    
    // Check for success messages in data attributes
    const messageElement = document.querySelector('[data-message]');
    if (messageElement) {
        showToast(messageElement.dataset.message, 'success');
    }
});
