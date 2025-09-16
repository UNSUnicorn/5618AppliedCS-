document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyze-btn');
    const imageFile = document.getElementById('image-file');
    const imageUrl = document.getElementById('image-url');
    const spinner = document.getElementById('spinner');
    const resultsCard = document.getElementById('results-card');
    const previewImage = document.getElementById('preview-image');
    const resultsTable = document.getElementById('results-table');
    const downloadCsvBtn = document.getElementById('download-csv');

    // *** IMPORTANT: REPLACE THIS WITH YOUR ACTUAL CLOUD RUN BACKEND URL ***
    // *** 重要：请将此处替换为您实际部署的 Cloud Run 后端 URL ***
    const BACKEND_API_URL = "https://YOUR_CLOUDRUN_SERVICE_URL.run.app/analyze"; 
    // 例如: "https://gemini-backend-xxxxxx-uc.a.run.app/analyze"
    // 部署Cloud Run后获取，并更新此处，然后重新部署Cloudflare Pages

    let analysisResultData = null; 

    analyzeBtn.addEventListener('click', async () => {
        spinner.style.display = 'block';
        resultsCard.style.display = 'none';
        downloadCsvBtn.style.display = 'none'; 

        const formData = new FormData();
        const activeTab = document.querySelector('.nav-pills .nav-link.active').id;

        let previewUrl = '';
        if (activeTab === 'pills-upload-tab' && imageFile.files.length > 0) {
            formData.append('image', imageFile.files[0]);
            previewUrl = URL.createObjectURL(imageFile.files[0]);
        } else if (activeTab === 'pills-url-tab' && imageUrl.value) {
            formData.append('url', imageUrl.value);
            previewUrl = imageUrl.value;
        } else {
            alert('Please upload an image or provide a URL!');
            spinner.style.display = 'none';
            return;
        }

        try {
            // *** Modified: Use the absolute backend API URL ***
            const response = await fetch(BACKEND_API_URL, { 
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed due to an unknown error.');
            }

            analysisResultData = data; 
            displayResults(data, previewUrl);

        } catch (error) {
            alert('An error occurred: ' + error.message);
        } finally {
            spinner.style.display = 'none';
        }
    });
    
    function displayResults(data, imgUrl) {
        previewImage.src = imgUrl;
        resultsTable.innerHTML = ''; 

        const labels = {
            is_animal_on_flower: "Is the animal on a flower? (y/n)",
            latin_name_of_animal: "Latin name of animal",
            photo_source: "Photo Source (URL/Filename)",
            flower_family: "Flower Family",
            flower_color: "Flower Color",
            flower_shape: "Flower Shape",
            flower_size_relative_to_animal: "Flower Size (relative to the animal)"
        };

        for (const key in labels) {
            if (data.hasOwnProperty(key)) {
                const row = document.createElement('tr');
                const th = document.createElement('th');
                const td = document.createElement('td');
                th.textContent = labels[key];
                td.textContent = data[key];
                row.appendChild(th);
                row.appendChild(td);
                resultsTable.appendChild(row);
            }
        }
        resultsCard.style.display = 'block';
        downloadCsvBtn.style.display = 'block'; 
    }

    downloadCsvBtn.addEventListener('click', () => {
        if (!analysisResultData) return;
        
        const headers = Object.keys(analysisResultData);
        const values = headers.map(header => {
            const value = String(analysisResultData[header]);
            return `"${value.replace(/"/g, '""')}"`; 
        });

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(',') + '\n' 
            + values.join(',');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'analysis_result.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});