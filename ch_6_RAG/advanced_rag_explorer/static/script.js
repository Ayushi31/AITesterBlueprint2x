document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', async (e) => {
        e.preventDefault();
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
        item.classList.add('active');
        
        const target = item.getAttribute('data-target');
        document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
        document.getElementById(`${target}-view`).classList.remove('hidden');

        // Dynamic Pipeline Switching
        if (target === 'chat') {
            document.getElementById('pipeline-upload').classList.add('hidden');
            document.getElementById('pipeline-chat').classList.remove('hidden');
        } else if (target === 'upload') {
            document.getElementById('pipeline-chat').classList.add('hidden');
            document.getElementById('pipeline-upload').classList.remove('hidden');
        } else {
            document.getElementById('pipeline-chat').classList.add('hidden');
            document.getElementById('pipeline-upload').classList.add('hidden');
        }

        if(target === 'viewer') {
            viewerPage = 1;
            loadChunks();
        }
    });
});

let viewerPage = 1;

async function loadChunks() {
    document.getElementById('chunks-container').innerHTML = '<p>Loading chunks from database...</p>';
    const search = document.getElementById('filter-search').value;
    const module = document.getElementById('filter-module').value;
    const priority = document.getElementById('filter-priority').value;
    
    try {
        const url = `/api/chunks?page=${viewerPage}&search_text=${encodeURIComponent(search)}&module=${encodeURIComponent(module)}&priority=${encodeURIComponent(priority)}`;
        const res = await fetch(url);
        const data = await res.json();
        
        document.getElementById('viewer-subtitle').textContent = `Total points: ${data.total_collection}. Showing page ${data.page} (${data.total} matches, 50 per page).`;
        
        if(data.chunks && data.chunks.length > 0) {
            let html = ``;
            data.chunks.forEach((c, idx) => {
                const meta = c.metadata || {};
                let badges = `<span class="chunk-badge" style="margin-right:0;">${c.id}</span>`;
                if (meta.id) badges += `<span class="chunk-meta-badge">${meta.id}</span>`;
                if (meta.jira_id) badges += `<span class="chunk-meta-badge">${meta.jira_id}</span>`;
                if (meta.priority) badges += `<span class="chunk-meta-badge">${meta.priority}</span>`;
                if (meta.module) badges += `<span class="chunk-meta-badge">${meta.module}</span>`;
                badges += `<span class="chunk-meta">${c.text.length} chars</span>`;
                
                html += `
                <div class="chunk-card">
                    <div style="margin-bottom:8px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                        ${badges}
                    </div>
                    <div style="font-family:monospace;font-size:12px;color:#444;white-space:pre-wrap;">${escapeHTML(c.text)}</div>
                </div>`;
            });
            document.getElementById('chunks-container').innerHTML = html;
            
            if (viewerPage * 50 < data.total) {
                document.getElementById('btn-next-page').style.display = 'inline-block';
            } else {
                document.getElementById('btn-next-page').style.display = 'none';
            }
        } else {
            document.getElementById('chunks-container').innerHTML = '<p>No chunks found.</p>';
            document.getElementById('btn-next-page').style.display = 'none';
        }
    } catch(e) {
        document.getElementById('chunks-container').innerHTML = `<p style="color:red">Error loading chunks</p>`;
    }
}

document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    viewerPage = 1;
    loadChunks();
});

document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('filter-search').value = '';
    document.getElementById('filter-module').value = '';
    document.getElementById('filter-priority').value = '';
    viewerPage = 1;
    loadChunks();
});

document.getElementById('btn-next-page').addEventListener('click', () => {
    viewerPage++;
    loadChunks();
});

const escapeHTML = (str) => {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
};

let currentPoints = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let currentSessionId = null;

// Default text columns (matching tutor's defaults)
const DEFAULT_TEXT_COLS = ['summary', 'labels', 'preconditions', 'steps', 'expected_result'];
const DEFAULT_META_COLS = ['id', 'jira_id', 'module', 'priority', 'severity', 'test_type', 'owner', 'sprint', 'status'];

// Step 1: Upload file and get columns
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-upload');
    const fileInput = document.getElementById('file-upload');
    
    if (!fileInput.files.length) {
        alert("Please select a file first.");
        return;
    }
    
    btn.textContent = 'Uploading...';
    btn.disabled = true;

    // Reset pipeline
    document.querySelectorAll('[id^="up-step-"]').forEach(el => {
        el.classList.remove('active');
        const desc = el.querySelector('.step-desc');
        if(desc) desc.textContent = '';
    });
    document.getElementById('column-picker').classList.add('hidden');
    document.getElementById('ingest-chunks-preview').classList.add('hidden');
    document.getElementById('progress-container').classList.add('hidden');

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        // Pipeline Step 1: Read file
        document.getElementById('up-step-1').classList.add('active');
        const res = await fetch('/api/preview', { method: 'POST', body: formData });
        const data = await res.json();
        
        if (data.detail) { alert("Error: " + data.detail); return; }

        currentSessionId = data.session_id;
        document.getElementById('up-desc-1').textContent = `${data.total_rows} rows · ${data.columns.length} columns`;

        // Render column picker checkboxes
        const textGrid = document.getElementById('text-columns-grid');
        const metaGrid = document.getElementById('meta-columns-grid');
        textGrid.innerHTML = '';
        metaGrid.innerHTML = '';

        data.columns.forEach(col => {
            const isTextDefault = DEFAULT_TEXT_COLS.includes(col.toLowerCase());
            textGrid.innerHTML += `<label style="display:flex; align-items:center; gap:4px; padding:6px 10px; border:1px solid #ddd; border-radius:4px; font-size:13px; cursor:pointer; background:${isTextDefault ? '#fdf0ec' : 'white'};">
                <input type="checkbox" class="text-col-check" value="${col}" ${isTextDefault ? 'checked' : ''}> ${col}
            </label>`;
            
            const isMetaDefault = DEFAULT_META_COLS.includes(col.toLowerCase());
            metaGrid.innerHTML += `<label style="display:flex; align-items:center; gap:4px; padding:6px 10px; border:1px solid #ddd; border-radius:4px; font-size:13px; cursor:pointer; background:${isMetaDefault ? '#fdf0ec' : 'white'};">
                <input type="checkbox" class="meta-col-check" value="${col}" ${isMetaDefault ? 'checked' : ''}> ${col}
            </label>`;
        });

        // Toggle background color on check/uncheck
        document.querySelectorAll('.text-col-check, .meta-col-check').forEach(cb => {
            cb.addEventListener('change', () => {
                cb.parentElement.style.background = cb.checked ? '#fdf0ec' : 'white';
            });
        });

        document.getElementById('column-picker').classList.remove('hidden');

    } catch(e) {
        alert("Error: " + e.message);
    } finally {
        btn.textContent = 'Upload & preview';
        btn.disabled = false;
    }
});

// Step 2: Run ingestion with selected columns
document.getElementById('btn-run-ingest').addEventListener('click', async () => {
    if (!currentSessionId) { alert("Please upload a file first."); return; }
    
    const btn = document.getElementById('btn-run-ingest');
    btn.textContent = 'Ingesting...';
    btn.disabled = true;

    const textCols = [...document.querySelectorAll('.text-col-check:checked')].map(cb => cb.value);
    const metaCols = [...document.querySelectorAll('.meta-col-check:checked')].map(cb => cb.value);
    const chunkSize = parseInt(document.getElementById('chunk-size').value);
    const chunkOverlap = parseInt(document.getElementById('chunk-overlap').value);
    const dropCollection = document.getElementById('drop-collection').checked;

    if (textCols.length === 0) { alert("Please select at least one text column."); btn.textContent = 'Run ingestion'; btn.disabled = false; return; }

    try {
        // Pipeline Step 2: Build documents
        document.getElementById('up-step-1').classList.remove('active');
        document.getElementById('up-step-2').classList.add('active');
        document.getElementById('up-desc-2').textContent = `3 samples`;

        const res = await fetch('/api/ingest', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                session_id: currentSessionId,
                text_columns: textCols,
                metadata_columns: metaCols,
                chunk_size: chunkSize,
                chunk_overlap: chunkOverlap,
                drop_collection: dropCollection
            })
        });
        const data = await res.json();
        if (data.detail) { alert("Error: " + data.detail); return; }

        await sleep(400);

        // Pipeline Step 3: Chunk
        document.getElementById('up-step-2').classList.remove('active');
        document.getElementById('up-step-3').classList.add('active');
        document.getElementById('up-desc-3').textContent = `${data.total_chunks} chunks · avg ${data.avg_chars} chars`;
        
        // Render chunk preview
        let previewHtml = '<h4 style="margin-bottom:16px;">First 3 chunks (overlap prefix highlighted)</h4>';
        data.sample_chunks.forEach((chunk, idx) => {
            previewHtml += `
            <div class="chunk-card">
                <div style="margin-bottom:8px;">
                    <span class="chunk-badge">r${chunk.row}-c${chunk.chunk_index}</span>
                    <span class="chunk-meta">row ${chunk.row} · chunk ${chunk.chunk_index}/${chunk.total_chunks_in_row} · ${chunk.text.length} chars</span>
                </div>
                <div style="font-family:monospace;font-size:12px;color:#444;white-space:pre-wrap;">${escapeHTML(chunk.text)}</div>
            </div>`;
        });
        document.getElementById('ingest-chunks-preview').innerHTML = previewHtml;
        document.getElementById('ingest-chunks-preview').classList.remove('hidden');
        await sleep(400);

        // Pipeline Step 4: Embed
        document.getElementById('up-step-3').classList.remove('active');
        document.getElementById('up-step-4').classList.add('active');
        
        document.getElementById('progress-container').classList.remove('hidden');
        const pBar = document.getElementById('embed-progress-bar');
        const pText = document.getElementById('embed-progress-text');
        
        for (let i = 0; i <= 100; i += 2) {
            pBar.style.width = i + '%';
            const currChunks = Math.floor((i / 100) * data.total_chunks);
            pText.textContent = `${currChunks} / ${data.total_chunks} chunks embedded`;
            document.getElementById('up-desc-4').textContent = `${currChunks}/${data.total_chunks} (${i}%)`;
            await sleep(50);
        }

        // Store
        const storeRes = await fetch('/api/store', { 
            method: 'POST', 
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ session_id: data.session_id }) 
        });
        const storeData = await storeRes.json();
        
        // Pipeline Step 5: Index in Qdrant
        document.getElementById('up-step-4').classList.remove('active');
        document.getElementById('up-step-5').classList.add('active');
        document.getElementById('up-desc-5').textContent = `Stored in DB`;

        currentPoints = storeData.vectors_stored;
        document.getElementById('stat-points').textContent = `${currentPoints} points`;
        
    } catch(e) {
        alert("Error: " + e.message);
    } finally {
        btn.textContent = 'Run ingestion';
        btn.disabled = false;
    }
});

document.getElementById('query-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = document.getElementById('user-query').value;
    const topK = document.getElementById('top-k').value;
    const topN = document.getElementById('top-n').value;
    const doRewrite = document.getElementById('opt-rewrite').checked;
    const doRerank = document.getElementById('opt-reranker').checked;

    if(!query) return;

    // update stats display
    document.getElementById('stat-hybrid').textContent = topN;
    document.getElementById('stat-rerank').textContent = topK;

    const chatHist = document.getElementById('chat-history');
    chatHist.innerHTML += `<div class="message user">${query}</div>`;
    document.getElementById('user-query').value = '';

    const btn = document.getElementById('btn-query');
    btn.textContent = '...';
    btn.disabled = true;

    // Reset chat pipeline only
    document.querySelectorAll('[id^="step-"]').forEach(el => {
        el.classList.remove('active');
        const desc = el.querySelector('.step-desc');
        if(desc) desc.textContent = '';
    });

    try {
        const res = await fetch('/api/query', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                query, 
                top_k_retrieve: parseInt(topN), 
                top_k_rerank: parseInt(topK),
                do_rewrite: doRewrite,
                do_rerank: doRerank
            })
        });
        const data = await res.json();
        
        if (data.error || data.detail) {
            chatHist.innerHTML += `<div class="message bot" style="color:red">Error: ${data.error || data.detail}</div>`;
            return;
        }

        const stats = data.pipeline_stats;

        // Step 1
        document.getElementById('step-1').classList.add('active');
        document.getElementById('chat-desc-1').textContent = `mode=answer`;
        await sleep(300);

        // Step 2 & Query Rewrite
        document.getElementById('step-1').classList.remove('active');
        document.getElementById('step-2').classList.add('active');
        document.getElementById('chat-desc-2').textContent = `${stats.queries_count} queries`;
        
        if (doRewrite && data.search_query) {
            chatHist.innerHTML += `<div style="background:#fef7f5; border:1px solid #fce4dc; border-radius:8px; padding:12px 16px; margin-top:16px; font-size:13px; color:#c95c46;">
                <strong>Query Rewrite:</strong><br>
                <span style="color:#555; font-style:italic;">"${escapeHTML(data.search_query)}"</span>
            </div>`;
        }
        await sleep(300);

        // Step 3
        document.getElementById('step-2').classList.remove('active');
        document.getElementById('step-3').classList.add('active');
        document.getElementById('chat-desc-3').textContent = `${stats.queries_count} queries embedded`;
        await sleep(300);

        // Step 4 & Table
        document.getElementById('step-3').classList.remove('active');
        document.getElementById('step-4').classList.add('active');
        document.getElementById('chat-desc-4').textContent = `${stats.dense_hits} hits`;
        
        if (data.intermediate_results && data.intermediate_results.dense) {
            chatHist.innerHTML += generateTableHtml('Dense search - vector similarity (top ' + topN + ')', data.intermediate_results.dense, `${stats.dense_hits} hits`);
        }
        await sleep(300);

        // Step 5 & Table
        document.getElementById('step-4').classList.remove('active');
        document.getElementById('step-5').classList.add('active');
        document.getElementById('chat-desc-5').textContent = `${stats.sparse_hits} hits`;
        
        if (data.intermediate_results && data.intermediate_results.sparse) {
            chatHist.innerHTML += generateTableHtml('Sparse search - BM25-like (top ' + topN + ' per query)', data.intermediate_results.sparse, `${stats.sparse_hits} hits`);
        }
        await sleep(400);

        // Step 6 & Table
        document.getElementById('step-5').classList.remove('active');
        document.getElementById('step-6').classList.add('active');
        document.getElementById('chat-desc-6').textContent = `${stats.fused_hits} fused`;

        if (data.intermediate_results && data.intermediate_results.fused) {
            chatHist.innerHTML += generateTableHtml('RRF fuse', data.intermediate_results.fused, `${stats.fused_hits} fused hits`);
        }
        await sleep(400);

        // Step 7
        document.getElementById('step-6').classList.remove('active');
        document.getElementById('step-7').classList.add('active');
        document.getElementById('chat-desc-7').textContent = `${stats.reranked_hits} hits`;
        
        if (data.intermediate_results && data.intermediate_results.reranked) {
            chatHist.innerHTML += generateTableHtml('Cross-encoder rerank', data.intermediate_results.reranked, `${stats.reranked_hits} hits`);
        }
        await sleep(400);

        // Step 8 & Final
        document.getElementById('step-7').classList.remove('active');
        document.getElementById('step-8').classList.add('active');
        document.getElementById('chat-desc-8').textContent = `completed`;

        chatHist.innerHTML += `<div class="message bot" style="border: 1px solid var(--accent); border-left: 4px solid var(--accent);"><strong>Final Answer:</strong><br><br>${data.final_answer.replace(/\n/g, '<br>')}</div>`;
        
        setTimeout(() => document.getElementById('step-8').classList.remove('active'), 1000);

    } catch(e) {
        chatHist.innerHTML += `<div class="message bot" style="color:red">Error: ${e.message}</div>`;
    } finally {
        btn.textContent = 'Ask';
        btn.disabled = false;
        // scroll to bottom
        chatHist.scrollTop = chatHist.scrollHeight;
    }
});

function toggleCollapsible(btn) {
    const content = btn.parentElement.nextElementSibling;
    const isHidden = content.style.display === 'none';
    content.style.display = isHidden ? 'block' : 'none';
    btn.textContent = (isHidden ? '▼ ' : '▶ ') + btn.textContent.substring(2);
}

function generateTableHtml(title, dataArray, topText) {
    const id = 'collapsible-' + Math.random().toString(36).substr(2, 9);
    let html = `<div style="background:white; border:1px solid #eee; border-radius:8px; margin-top:16px; font-size:12px; overflow:hidden;">
        <div style="padding:12px 16px; background:#fcfcfc; border-bottom:1px solid #eee; display:flex; align-items:center; cursor:pointer;" onclick="toggleCollapsible(this.querySelector('h4'))">
            <h4 style="color:#c95c46; margin:0; font-weight:600; flex:1;">▼ ${title} - ${topText}</h4>
        </div>
        <div class="collapsible-content" style="padding:16px; overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; text-align:left;">
                <thead>
                    <tr style="border-bottom:1px solid #eee; color:#888;">
                        <th style="padding:8px; font-weight:600;">#</th>
                        <th style="padding:8px; font-weight:600;">CHUNK ID</th>
                        <th style="padding:8px; font-weight:600;">PREVIEW</th>
                        <th style="padding:8px; font-weight:600;">SCORE</th>
                    </tr>
                </thead>
                <tbody>`;
                
    dataArray.forEach((row, i) => {
        let chunkText = escapeHTML(row.text);
        if (chunkText.length > 80) chunkText = chunkText.substring(0, 80) + '...';
        
        let score = row.score || row.relevance_score || 0;
        score = parseFloat(score).toFixed(4);
        
        html += `<tr style="border-bottom:1px solid #f9f9f9;">
            <td style="padding:8px; color:#888;">${i+1}</td>
            <td style="padding:8px;">
                <div style="font-family:monospace; color:#225497; background:#e8f0fe; display:inline-block; padding:3px 6px; border-radius:4px;">${row.id || 'r0-c0'}</div>
            </td>
            <td style="padding:8px; color:#555;">${chunkText}</td>
            <td style="padding:8px; font-family:monospace;">${score}</td>
        </tr>`;
    });
    
    html += `</tbody></table></div></div>`;
    return html;
}
