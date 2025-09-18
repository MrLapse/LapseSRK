document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const qrForm = document.getElementById('qrForm');
    const textInput = document.getElementById('textInput');
    const qrColor = document.getElementById('qrColor');
    const qrSize = document.getElementById('qrSize');
    const sizeValue = document.getElementById('sizeValue');
    const qrResult = document.getElementById('qrResult');
    const qrImage = document.getElementById('qrImage');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorMessage = document.getElementById('errorMessage');
    const historyList = document.getElementById('historyList');
    const themeToggle = document.getElementById('themeToggle');
    
    // Initialize history array
    let qrHistory = JSON.parse(localStorage.getItem('qrHistory')) || [];
    
    // Set initial size value
    sizeValue.textContent = `${qrSize.value}px`;
    
    // Check for saved theme preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }
    
    // Theme toggle functionality
    themeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    
    // Update size value display
    qrSize.addEventListener('input', () => {
        sizeValue.textContent = `${qrSize.value}px`;
    });
    
    // Form submission
    qrForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = textInput.value.trim();
        const color = qrColor.value;
        const size = parseInt(qrSize.value);
        
        if (!text) {
            showError('Please enter some text or a URL');
            return;
        }
        
        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, color, size })
            });
            
            const data = await response.json();
            
            if (data.success) {
                hideError();
                displayQRCode(data.qrCode, text);
                updateHistory(data.history);
            } else {
                showError(data.error || 'Failed to generate QR code');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Network error. Please try again.');
        }
    });
    
    // Download button
    downloadBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text) {
            window.open(`/download?text=${encodeURIComponent(text)}`, '_blank');
        }
    });
    
    // Display QR code
    function displayQRCode(dataUrl, text) {
        qrImage.src = dataUrl;
        qrImage.alt = `QR Code for: ${text}`;
        qrResult.classList.remove('hidden');
    }
    
    // Update history section
    function updateHistory(history) {
        if (history.length === 0) {
            historyList.innerHTML = '<p class="empty-history">No history yet. Generate your first QR code!</p>';
            return;
        }
        
        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-content">
                    <div class="history-qr">
                        <img src="${item.dataUrl}" alt="QR Code for: ${item.text}" width="50" height="50">
                    </div>
                    <div class="history-details">
                        <p class="history-text">${item.text}</p>
                        <p class="history-time">${new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }
    
    // Hide error message
    function hideError() {
        errorMessage.classList.add('hidden');
    }
    
    // Initialize history display
    updateHistory(qrHistory);
});