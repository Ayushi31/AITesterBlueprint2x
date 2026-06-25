document.getElementById('ingestBtn').addEventListener('click', async () => {
    const btn = document.getElementById('ingestBtn');
    const resultBox = document.getElementById('ingestResult');
    
    btn.textContent = 'Ingesting...';
    btn.disabled = true;
    
    try {
        const res = await fetch('/api/ingest', { method: 'POST' });
        const data = await res.json();
        
        resultBox.classList.remove('hidden');
        if (data.status === 'success') {
            resultBox.innerHTML = `<strong>Success!</strong> ${data.message}`;
            resultBox.style.borderColor = 'var(--success)';
            resultBox.style.color = '#34d399';
        } else {
            resultBox.innerHTML = `<strong>Error!</strong> ${data.message}`;
            resultBox.style.borderColor = '#ef4444';
            resultBox.style.color = '#f87171';
        }
    } catch (e) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = `<strong>Error!</strong> Could not connect to server.`;
    } finally {
        btn.textContent = 'Ingest Documents';
        btn.disabled = false;
    }
});

document.getElementById('viewDbBtn').addEventListener('click', async () => {
    const dbView = document.getElementById('dbView');
    const dbList = document.getElementById('dbList');
    const countSpan = document.getElementById('dbCount');
    
    dbList.innerHTML = 'Loading...';
    dbView.classList.remove('hidden');
    
    try {
        const res = await fetch('/api/db');
        const data = await res.json();
        
        countSpan.textContent = data.count;
        dbList.innerHTML = '';
        
        if (data.count === 0) {
            dbList.innerHTML = '<p>Database is empty. Please ingest first.</p>';
            return;
        }
        
        for (let i = 0; i < data.ids.length; i++) {
            const item = document.createElement('div');
            item.className = 'db-item';
            item.innerHTML = `
                <h4>ID: ${data.ids[i]} | Source: ${data.metadatas[i].source}</h4>
                <p>${data.documents[i]}</p>
            `;
            dbList.appendChild(item);
        }
    } catch (e) {
        dbList.innerHTML = '<p>Error loading database contents.</p>';
    }
});

document.getElementById('askBtn').addEventListener('click', async () => {
    const query = document.getElementById('queryInput').value;
    if (!query) return;
    
    const askBtn = document.getElementById('askBtn');
    const processArea = document.getElementById('queryProcess');
    const answerArea = document.getElementById('answerArea');
    const steps = document.querySelectorAll('.step');
    
    askBtn.disabled = true;
    askBtn.textContent = 'Thinking...';
    
    processArea.classList.remove('hidden');
    answerArea.classList.add('hidden');
    
    // Reset steps
    steps.forEach(s => s.classList.remove('active'));
    
    // Simulate process flow for visualization
    const delay = ms => new Promise(res => setTimeout(res, ms));
    
    try {
        steps[0].classList.add('active'); // Query Received
        
        const res = await fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        await delay(500);
        steps[0].classList.remove('active');
        steps[1].classList.add('active'); // Embedded
        
        await delay(500);
        steps[1].classList.remove('active');
        steps[2].classList.add('active'); // Searched
        
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.detail || 'An error occurred');
        }
        
        const data = await res.json();
        
        await delay(500);
        steps[2].classList.remove('active');
        steps[3].classList.add('active'); // Retrieved
        
        await delay(500);
        steps[3].classList.remove('active');
        steps[4].classList.add('active'); // Synthesized
        
        // Show result
        document.getElementById('contextText').textContent = data.retrieved_chunk;
        document.getElementById('answerText').textContent = data.answer;
        answerArea.classList.remove('hidden');
        
    } catch (e) {
        alert(e.message);
    } finally {
        askBtn.disabled = false;
        askBtn.textContent = 'Ask Question';
        setTimeout(() => {
            steps.forEach(s => s.classList.remove('active'));
        }, 2000);
    }
});
