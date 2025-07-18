document.addEventListener('DOMContentLoaded', () => {
    const foodImageInput = document.getElementById('foodImageInput');
    const analyzeButton = document.getElementById('analyzeButton');
    const uploadedImage = document.getElementById('uploadedImage');
    const noImageText = document.getElementById('noImageText');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const analysisResults = document.getElementById('analysisResults');

    let selectedFile = null;

    // Handle file input change
    foodImageInput.addEventListener('change', (event) => {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                uploadedImage.style.display = 'block';
                noImageText.style.display = 'none';
                analyzeButton.disabled = false; // Enable button when image is selected
                clearResults(); // Clear previous results
            };
            reader.readAsDataURL(selectedFile);
        } else {
            uploadedImage.src = '#';
            uploadedImage.style.display = 'none';
            noImageText.style.display = 'block';
            analyzeButton.disabled = true; // Disable button if no image
            clearResults();
        }
    });

    // Handle analyze button click
    analyzeButton.addEventListener('click', async () => {
        if (!selectedFile) {
            displayError('Please select an image first.');
            return;
        }

        clearResults();
        loadingMessage.style.display = 'block'; // Show loading message
        analyzeButton.disabled = true; // Disable button during analysis

        const formData = new FormData();
        formData.append('foodImage', selectedFile);

        try {
            // IMPORTANT: This URL should point to your backend server endpoint
            // Your backend will then securely call the Gemini API
            const response = await fetch('/analyze-food', {
                method: 'POST',
                body: formData,
                // You might need to add headers if your backend expects them, e.g., for authentication
                // headers: {
                //     'Authorization': 'Bearer YOUR_AUTH_TOKEN'
                // }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            displayResults(data);

        } catch (error) {
            console.error('Error during analysis:', error);
            displayError(`Failed to analyze food: ${error.message}. Please try again.`);
        } finally {
            loadingMessage.style.display = 'none'; // Hide loading message
            analyzeButton.disabled = false; // Re-enable button
        }
    });

    function clearResults() {
        analysisResults.textContent = '';
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }

    function displayResults(data) {
        // This is where you'd format the data received from your backend
        // For demonstration, we'll just stringify the JSON response.
        // In a real app, you'd parse `data` and display specific fields like calories, nutrients, etc.

        if (data && data.analysis) {
            analysisResults.textContent = `Analysis: \n${JSON.stringify(data.analysis, null, 2)}`;
        } else if (data && data.message) {
             analysisResults.textContent = `Message: \n${data.message}`;
        } else {
             analysisResults.textContent = `No specific analysis data received.\nRaw response: ${JSON.stringify(data, null, 2)}`;
        }

        console.log("Received data:", data); // Log the full response for debugging
    }

    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        analysisResults.textContent = ''; // Clear any previous results
    }
});
