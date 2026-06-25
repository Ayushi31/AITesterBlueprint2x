import os
import glob
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import chromadb
from sentence_transformers import SentenceTransformer
from groq import Groq
import PyPDF2
import docx
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Mount static folder
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Models and Clients
_embedding_model = None
_chroma_client = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        print("Loading Embedding Model...")
        _embedding_model = SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True)
    return _embedding_model

def get_chroma_collection():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.PersistentClient(path="./chroma_db")
    return _chroma_client.get_or_create_collection(name="basic_rag")

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is missing in .env")
    return Groq(api_key=api_key)

def chunk_text(text, chunk_size=500, overlap=50):
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap
    return chunks

def extract_text_from_pdf(filepath):
    text = ""
    with open(filepath, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(filepath):
    doc = docx.Document(filepath)
    return "\n".join([p.text for p in doc.paragraphs])

@app.post("/api/ingest")
def ingest_data():
    data_dir = "data"
    if not os.path.exists(data_dir):
        return {"status": "error", "message": "Data directory not found."}
    
    files = glob.glob(os.path.join(data_dir, "*"))
    if not files:
        return {"status": "error", "message": "No files found in data directory."}
    
    collection = get_chroma_collection()
    embedding_model = get_embedding_model()
    
    total_chunks = 0
    all_chunks_info = []
    
    for file in files:
        if file.endswith(".pdf"):
            text = extract_text_from_pdf(file)
        elif file.endswith(".docx"):
            text = extract_text_from_docx(file)
        else:
            continue
            
        chunks = chunk_text(text)
        if not chunks:
            continue
            
        embeddings = embedding_model.encode(chunks).tolist()
        
        ids = [f"{os.path.basename(file)}-{i}" for i in range(len(chunks))]
        metadatas = [{"source": os.path.basename(file)} for _ in chunks]
        
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
        total_chunks += len(chunks)
        all_chunks_info.extend(chunks)
        
    return {
        "status": "success", 
        "message": f"Ingested {total_chunks} chunks.",
        "sample_chunks": all_chunks_info[:5] # Sending a few chunks back for visualization
    }

@app.get("/api/db")
def view_db():
    collection = get_chroma_collection()
    results = collection.get()
    return {
        "count": collection.count(),
        "ids": results["ids"],
        "documents": results["documents"],
        "metadatas": results["metadatas"]
    }

class QueryRequest(BaseModel):
    query: str

@app.post("/api/query")
def query_rag(req: QueryRequest):
    collection = get_chroma_collection()
    if collection.count() == 0:
        raise HTTPException(status_code=400, detail="Database is empty. Please ingest first.")
        
    embedding_model = get_embedding_model()
    query_emb = embedding_model.encode(req.query).tolist()
    
    results = collection.query(
        query_embeddings=[query_emb],
        n_results=1,
        include=["documents", "metadatas", "distances"]
    )
    
    if not results["documents"] or not results["documents"][0]:
        raise HTTPException(status_code=404, detail="No relevant context found.")
        
    retrieved_chunk = results["documents"][0][0]
    
    groq_client = get_groq_client()
    system_prompt = "You are an AI assistant. Answer the user query using ONLY the provided context. If the answer is not in the context, say you don't know."
    user_prompt = f"Context:\n{retrieved_chunk}\n\nQuery: {req.query}"
    
    chat_completion = groq_client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        model="llama-3.1-8b-instant",
        temperature=0.3
    )
    
    return {
        "answer": chat_completion.choices[0].message.content,
        "retrieved_chunk": retrieved_chunk,
        "flow": [
            "1. User Query Received",
            "2. Query Embedded (Nomic Embed)",
            "3. ChromaDB Searched for Top 1 closest chunk",
            "4. Chunk Retrieved",
            "5. Groq Llama 3.1 synthesizes answer"
        ]
    }

from fastapi.responses import FileResponse
@app.get("/")
def read_root():
    return FileResponse("static/index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)
