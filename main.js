document.addEventListener('DOMContentLoaded', () => {
    const videoInput = document.getElementById('videoInput');
    const videoUrl = document.getElementById('videoUrl');
    const addUrlBtn = document.getElementById('addUrlBtn');
    const videoList = document.getElementById('videoList');
    const convertAllBtn = document.getElementById('convertAllBtn');
    const progress = document.getElementById('progress');
    const progressFill = progress.querySelector('.progress-fill');
    const formatSelect = document.getElementById('formatSelect');

    let videos = [];

    function createVideoItem(file, isUrl = false) {
        const videoId = `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const item = document.createElement('div');
        item.className = 'video-item';
        item.dataset.id = videoId;

        const preview = document.createElement('video');
        preview.controls = true;
        preview.className = 'video-preview';
        
        const details = document.createElement('div');
        details.className = 'video-details';
        
        const name = document.createElement('p');
        name.className = 'video-name';
        
        const status = document.createElement('span');
        status.className = 'video-status';
        status.textContent = 'في الانتظار';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = '✕';
        removeBtn.onclick = () => {
            videos = videos.filter(v => v.id !== videoId);
            item.remove();
            updateConvertButton();
        };

        if (isUrl) {
            name.textContent = file;
            preview.src = file;
        } else {
            name.textContent = file.name;
            preview.src = URL.createObjectURL(file);
        }

        details.appendChild(name);
        details.appendChild(status);
        item.appendChild(preview);
        item.appendChild(details);
        item.appendChild(removeBtn);
        
        videos.push({
            id: videoId,
            file: file,
            isUrl: isUrl
        });

        return item;
    }

    function updateConvertButton() {
        convertAllBtn.disabled = videos.length === 0;
    }

    videoInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            videoList.appendChild(createVideoItem(file));
        });
        updateConvertButton();
        videoInput.value = '';
    });

    addUrlBtn.addEventListener('click', () => {
        const url = videoUrl.value.trim();
        if (url) {
            videoList.appendChild(createVideoItem(url, true));
            updateConvertButton();
            videoUrl.value = '';
        }
    });

    async function convertVideo(video) {
        const item = document.querySelector(`[data-id="${video.id}"]`);
        const status = item.querySelector('.video-status');
        status.textContent = 'جاري التحويل...';
        
        try {
            await simulateConversion();
            
            const format = formatSelect.value;
            const fileName = video.isUrl ? 
                `video-${Date.now()}.${format}` : 
                video.file.name.replace(/\.[^/.]+$/, `.${format}`);
            
            status.textContent = 'تم التحويل';
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-btn';
            downloadBtn.innerHTML = '<span class="download-icon">⬇️</span> تحميل';
            downloadBtn.onclick = () => {
                const a = document.createElement('a');
                a.href = video.isUrl ? video.file : URL.createObjectURL(video.file);
                a.download = fileName;
                a.click();
            };
            
            const details = item.querySelector('.video-details');
            details.appendChild(downloadBtn);
        } catch (error) {
            status.textContent = 'فشل التحويل';
            status.style.color = 'var(--accent-color)';
        }
    }

    convertAllBtn.addEventListener('click', async () => {
        progress.hidden = false;
        convertAllBtn.disabled = true;
        
        for (const video of videos) {
            await convertVideo(video);
        }
        
        progress.hidden = true;
        convertAllBtn.disabled = false;
        progressFill.style.width = '0%';
    });

    async function simulateConversion() {
        const duration = 3000;
        const steps = 100;
        const stepDuration = duration / steps;

        for (let i = 0; i <= steps; i++) {
            await new Promise(resolve => setTimeout(resolve, stepDuration));
            progressFill.style.width = `${i}%`;
        }
    }

    // إضافة تأثيرات حركة للأزرار
    const buttons = document.querySelectorAll('button:not(.remove-btn), .upload-btn');
    buttons.forEach(button => {
        button.addEventListener('mouseover', () => {
            if (!button.disabled) {
                button.style.transform = 'translateY(-5px)';
            }
        });
        
        button.addEventListener('mouseout', () => {
            if (!button.disabled) {
                button.style.transform = 'translateY(0)';
            }
        });
    });
});