import os
import io
import uuid
import pandas as pd
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

# Clients for Open Source Stack
import chromadb
from sentence_transformers import SentenceTransformer, CrossEncoder
from groq import Groq

# Load environment variables
load_dotenv(override=True)

app = FastAPI(title="Advanced RAG Explorer (Open Source Stack)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for session data (chunks before pushing to DB)
sessions = {}

# Lazy initialization for ML models to prevent long startup delays
_embedding_model = None
_cross_encoder = None
_chroma_client = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        print("Loading embedding model...")
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model

def get_cross_encoder():
    global _cross_encoder
    if _cross_encoder is None:
        print("Loading cross-encoder model...")
        _cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
    return _cross_encoder

def get_chroma_client():
    global _chroma_client
    if _chroma_client is None:
        # Uses local directory to persist data
        _chroma_client = chromadb.PersistentClient(path="./chroma_db")
    return _chroma_client

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is missing in .env.")
    return Groq(api_key=api_key)

import math
import re
from collections import Counter

class SimpleBM25:
    def __init__(self, corpus_texts):
        self.corpus_size = len(corpus_texts)
        if self.corpus_size == 0:
            return
        corpus_tokens = [self.tokenize(text) for text in corpus_texts]
        self.avgdl = sum(len(doc) for doc in corpus_tokens) / self.corpus_size
        self.doc_freqs = []
        self.idf = {}
        self.doc_len = []
        df = Counter()
        for document in corpus_tokens:
            self.doc_len.append(len(document))
            frequencies = Counter(document)
            self.doc_freqs.append(frequencies)
            for word in frequencies:
                df[word] += 1
        for word, freq in df.items():
            self.idf[word] = math.log(1 + (self.corpus_size - freq + 0.5) / (freq + 0.5))
            
    def tokenize(self, text):
        return re.findall(r'\w+', text.lower())

    def get_scores(self, query):
        query_tokens = self.tokenize(query)
        scores = []
        for index in range(self.corpus_size):
            score = 0
            doc_len = self.doc_len[index]
            frequencies = self.doc_freqs[index]
            for word in query_tokens:
                if word not in frequencies:
                    continue
                freq = frequencies[word]
                numerator = self.idf[word] * freq * 2.5
                denominator = freq + 1.5 * (1 - 0.75 + 0.75 * doc_len / self.avgdl)
                score += numerator / denominator
            scores.append(score)
        return scores


def simple_chunker_with_overlap(text: str, chunk_size: int, overlap: int) -> List[dict]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk_text = text[start:end]
        overlap_len = 0
        if start > 0:
            overlap_len = min(overlap, len(chunk_text))
        chunks.append({
            "text": chunk_text,
            "overlap_length": overlap_len
        })
        start += chunk_size - overlap
        if start >= len(text):
            break
    return chunks

class StoreRequest(BaseModel):
    session_id: str

class QueryRequest(BaseModel):
    query: str
    top_k_retrieve: int = 10
    top_k_rerank: int = 5
    do_rewrite: bool = False
    do_rerank: bool = False

class IngestRequest(BaseModel):
    session_id: str
    text_columns: List[str]
    metadata_columns: List[str]
    chunk_size: int = 1000
    chunk_overlap: int = 150
    drop_collection: bool = False

@app.post("/api/preview")
async def preview_file(
    file: UploadFile = File(...)
):
    """Step 1: Parse file, return columns and a preview so user can pick text/metadata columns."""
    try:
        contents = await file.read()
        filename = file.filename
        
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith(".xlsx"):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV or XLSX.")
        
        session_id = str(uuid.uuid4())
        sessions[session_id] = {"df": df, "filename": filename}
        
        # Build a preview of first 3 rows
        preview_rows = []
        for i in range(min(3, len(df))):
            row_dict = {}
            for col in df.columns:
                row_dict[col] = str(df.iloc[i][col])
            preview_rows.append(row_dict)
        
        return {
            "session_id": session_id,
            "filename": filename,
            "total_rows": len(df),
            "columns": list(df.columns),
            "preview_rows": preview_rows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingest")
async def ingest_data(req: IngestRequest):
    """Step 2: Build chunks from selected columns and store them."""
    try:
        if req.session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found. Please upload file again.")
        
        session_data = sessions[req.session_id]
        df = session_data["df"]
        filename = session_data["filename"]
        
        # Drop old collection if requested
        if req.drop_collection:
            chroma_client = get_chroma_client()
            try:
                chroma_client.delete_collection(name="rag-explorer")
            except:
                pass
        
        # Build document text per row from selected text columns only
        text_cols = [c for c in req.text_columns if c in df.columns]
        meta_cols = [c for c in req.metadata_columns if c in df.columns]
        
        all_chunks = []
        for i in range(len(df)):
            # Build text from selected text columns
            parts = []
            for col in text_cols:
                val = str(df.iloc[i][col])
                if val and val != 'nan':
                    parts.append(f"{col}: {val}")
            doc_text = "\n".join(parts)
            
            # Build metadata from selected metadata columns
            metadata = {"row": i, "source": filename}
            for col in meta_cols:
                val = str(df.iloc[i][col])
                if val != 'nan':
                    metadata[col] = val
            
            # Chunk the text (most rows will be 1 chunk since avg < chunk_size)
            doc_chunks = simple_chunker_with_overlap(doc_text, req.chunk_size, req.chunk_overlap)
            for ci, chunk_data in enumerate(doc_chunks):
                all_chunks.append({
                    "text": chunk_data["text"],
                    "metadata": metadata,
                    "row": i,
                    "chunk_index": ci,
                    "total_chunks_in_row": len(doc_chunks)
                })
        
        # Store the chunks for the store step
        sessions[req.session_id] = all_chunks
        
        # Build sample chunks for preview
        sample_chunks = all_chunks[:3]
        
        avg_chars = sum(len(c["text"]) for c in all_chunks) / max(len(all_chunks), 1)
        
        return {
            "session_id": req.session_id,
            "filename": filename,
            "total_rows": len(df),
            "total_chunks": len(all_chunks),
            "avg_chars": round(avg_chars, 1),
            "chunk_size": req.chunk_size,
            "overlap": req.chunk_overlap,
            "sample_chunks": sample_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/store")
async def store_embeddings(req: StoreRequest):
    session_id = req.session_id
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found or already stored.")
    
    chunks = sessions[session_id]
    
    chroma_client = get_chroma_client()
    embedding_model = get_embedding_model()
    
    collection_name = "rag-explorer"
    collection = chroma_client.get_or_create_collection(name=collection_name)
    
    # Process in batches
    batch_size = 100
    total_stored = 0
    for i in range(0, len(chunks), batch_size):
        batch = chunks[i:i+batch_size]
        texts = [c["text"] for c in batch]
        
        embeddings = embedding_model.encode(texts).tolist()
        
        ids = [f"r{c['row']}-c{c.get('chunk_index', 0)}" for c in batch]
        metadatas = [c.get("metadata", {"row": c["row"]}) for c in batch]
        
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
        total_stored += len(batch)
    
    del sessions[session_id]
    
    return {
        "status": "success",
        "index_name": "chroma_db/" + collection_name,
        "vectors_stored": total_stored,
        "embedding_model": "all-MiniLM-L6-v2"
    }

@app.post("/api/query")
async def query_pipeline(req: QueryRequest):
    try:
        chroma_client = get_chroma_client()
        embedding_model = get_embedding_model()
        cross_encoder = get_cross_encoder()
        groq_client = get_groq_client()
        
        collection = chroma_client.get_or_create_collection(name="rag-explorer")
        
        if collection.count() == 0:
            return {"error": "No documents retrieved from ChromaDB. Ensure you have ingested data."}
            
        # 1. Query Rewrite
        search_query = req.query
        if req.do_rewrite:
            rewrite_prompt = f"Rewrite this query to be better optimized for a search engine. Output ONLY the rewritten query text: {req.query}"
            res = groq_client.chat.completions.create(
                messages=[{"role": "user", "content": rewrite_prompt}],
                model="llama-3.1-8b-instant",
                temperature=0.2
            )
            search_query = res.choices[0].message.content.strip()

        # 2. Embed & Dense Search
        query_embedding = embedding_model.encode(search_query).tolist()
        retrieval_res = collection.query(
            query_embeddings=[query_embedding],
            n_results=req.top_k_retrieve,
            include=["documents", "metadatas", "distances"]
        )
        
        dense_results = []
        if retrieval_res["documents"] and retrieval_res["documents"][0]:
            for i in range(len(retrieval_res["documents"][0])):
                dense_results.append({
                    "id": retrieval_res["ids"][0][i],
                    "text": retrieval_res["documents"][0][i],
                    "dense_rank": i + 1
                })

        # 3. Sparse Search
        all_docs = collection.get()
        sparse_results = []
        if all_docs["documents"]:
            bm25 = SimpleBM25(all_docs["documents"])
            bm25_scores = bm25.get_scores(search_query)
            doc_scores = list(zip(all_docs["ids"], all_docs["documents"], bm25_scores))
            doc_scores.sort(key=lambda x: x[2], reverse=True)
            for i, (doc_id, doc_text, score) in enumerate(doc_scores[:req.top_k_retrieve]):
                sparse_results.append({
                    "id": doc_id,
                    "text": doc_text,
                    "sparse_rank": i + 1
                })

        # 4. RRF Fuse
        rrf_scores = {}
        docs_by_id = {}
        k = 60
        for doc in dense_results:
            docs_by_id[doc["id"]] = doc["text"]
            rrf_scores[doc["id"]] = rrf_scores.get(doc["id"], 0) + 1 / (k + doc["dense_rank"])
        for doc in sparse_results:
            docs_by_id[doc["id"]] = doc["text"]
            rrf_scores[doc["id"]] = rrf_scores.get(doc["id"], 0) + 1 / (k + doc["sparse_rank"])
            
        fused_sorted = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)
        hybrid_docs = [{"id": d_id, "text": docs_by_id[d_id], "score": score} for d_id, score in fused_sorted[:req.top_k_retrieve]]

        # 5. Re-rank
        final_docs = hybrid_docs
        if req.do_rerank and hybrid_docs:
            texts_to_rerank = [doc["text"] for doc in hybrid_docs]
            pairs = [[req.query, text] for text in texts_to_rerank]
            rerank_scores = cross_encoder.predict(pairs)
            combined = []
            for i, doc in enumerate(hybrid_docs):
                combined.append({
                    "text": doc["text"],
                    "relevance_score": float(rerank_scores[i])
                })
            combined.sort(key=lambda x: x["relevance_score"], reverse=True)
            final_docs = combined[:req.top_k_rerank]
        else:
            final_docs = final_docs[:req.top_k_rerank]

        # 6. Generate
        context_parts = []
        for i, doc in enumerate(final_docs):
            context_parts.append(f"【Chunk {i+1}】: {doc['text']}")
        context = "\n\n".join(context_parts)
        
        system_prompt = "You are a QA assistant. Use the provided context chunks to answer. Cite the chunks used like [Chunk 1] or 【Chunk 1】. Be concise."
        user_prompt = f"Context:\n{context}\n\nQuery:\n{req.query}"
        
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3
        )
        
        final_answer = chat_completion.choices[0].message.content
        
        return {
            "final_answer": final_answer,
            "search_query": search_query,
            "pipeline_stats": {
                "queries_count": 2 if req.do_rewrite else 1,
                "dense_hits": len(dense_results),
                "sparse_hits": len(sparse_results),
                "fused_hits": len(hybrid_docs),
                "reranked_hits": len(final_docs)
            },
            "intermediate_results": {
                "sparse": sparse_results,
                "dense": dense_results,
                "fused": hybrid_docs,
                "reranked": final_docs
            },
            "models_used": {
                "embedding": "SentenceTransformer (all-MiniLM-L6-v2)",
                "vector_db": "ChromaDB (Local)",
                "reranker": "CrossEncoder",
                "generator": "Groq (llama-3.1-8b-instant)"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chunks")
async def get_chunks(page: int = 1, search_text: str = "", module: str = "", priority: str = ""):
    try:
        chroma_client = get_chroma_client()
        collection = chroma_client.get_or_create_collection(name="rag-explorer")
        
        total_count = collection.count()
        if total_count == 0:
            return {"chunks": [], "total": 0, "total_collection": 0, "page": page}
        
        per_page = 50
        has_filters = bool(search_text or module or priority)
        
        if not has_filters:
            offset = (page - 1) * per_page
            batch = collection.get(
                limit=per_page,
                offset=offset,
                include=["documents", "metadatas"]
            )
            chunks = []
            if batch and batch["ids"]:
                for i in range(len(batch["ids"])):
                    chunks.append({
                        "id": batch["ids"][i],
                        "text": batch["documents"][i],
                        "metadata": batch["metadatas"][i] if batch.get("metadatas") else {}
                    })
            return {
                "chunks": chunks,
                "total": total_count,
                "page": page,
                "total_collection": total_count
            }
        else:
            filtered_chunks = []
            batch_size = 500
            for offset in range(0, total_count, batch_size):
                batch = collection.get(
                    limit=batch_size,
                    offset=offset,
                    include=["documents", "metadatas"]
                )
                if not batch or not batch["ids"]:
                    break
                for i in range(len(batch["ids"])):
                    text = batch["documents"][i]
                    meta = batch["metadatas"][i] if batch.get("metadatas") else {}
                    
                    if search_text and search_text.lower() not in text.lower():
                        continue
                    if module and module.lower() not in str(meta.get("module", "")).lower():
                        continue
                    if priority and priority.lower() not in str(meta.get("priority", "")).lower():
                        continue
                    filtered_chunks.append({
                        "id": batch["ids"][i],
                        "text": text,
                        "metadata": meta
                    })
                if len(filtered_chunks) >= page * per_page + per_page:
                    break
            
            total_filtered = len(filtered_chunks)
            start_idx = (page - 1) * per_page
            end_idx = start_idx + per_page
            
            return {
                "chunks": filtered_chunks[start_idx:end_idx],
                "total": total_filtered,
                "page": page,
                "total_collection": total_count
            }
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"chunks": [], "error": str(e), "total": 0, "total_collection": 0, "page": page}

# Mount static files
os.makedirs("static", exist_ok=True)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
