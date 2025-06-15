# src/code_context_tool/core.py
import os
import json
import uuid
from functools import lru_cache
from pathlib import Path

import qdrant_client
from qdrant_client.http.models import Distance, VectorParams, Filter, FieldCondition, MatchValue, PointStruct, UpdateStatus
from rich.console import Console
from rich.progress import track
from sentence_transformers import SentenceTransformer

from . import config as default_config

console = Console()

# --- Configuration Loading ---
def load_project_config():
    """Loads configuration, starting with defaults and overriding with project-specific settings."""
    config = {
        "qdrant_url": default_config.QDRANT_URL,
        "model_name": default_config.EMBEDDING_MODEL_NAME,
        "collection_name_prefix": default_config.DEFAULT_COLLECTION_NAME_PREFIX,
        "ignore_list": default_config.DEFAULT_IGNORE_LIST,
    }
    
    project_config_path = Path(".cct_config.json")
    if project_config_path.exists():
        with open(project_config_path, 'r') as f:
            project_config = json.load(f)
            config.update(project_config)
            console.log(f"Loaded project configuration from [cyan].cct_config.json[/cyan]")
    
    # Derive a unique collection name from the project folder name
    project_folder_name = Path.cwd().name.lower().replace(" ", "_")
    config["collection_name"] = f"{config['collection_name_prefix']}_{project_folder_name}"

    return config

# --- Model Loading (Cached) ---
@lru_cache(maxsize=1)
def get_embedding_model(model_name):
    """Loads and caches the SentenceTransformer model to prevent reloading."""
    console.log(f"Loading embedding model: [green]{model_name}[/green]... (This may take a moment on first run)")
    model = SentenceTransformer(model_name, trust_remote_code=True)
    console.log("✅ Model loaded successfully.")
    return model

# --- Chunking Logic ---
def chunk_by_syntax(file_path: Path, file_content: str):
    """Chunks code based on its Abstract Syntax Tree (AST) for semantic coherence."""
    file_ext = file_path.suffix
    language_name = default_config.LANGUAGE_MAP.get(file_ext)

    if not language_name:
        return []

    try:
        language = get_language(language_name)
        parser = get_parser(language_name)
        tree = parser.parse(bytes(file_content, "utf8"))
    except Exception:
        # Fallback if tree-sitter language isn't available/compiled
        return chunk_by_lines(file_path, file_content)

    chunks = []
    
    def traverse_tree(node):
        if node.type in default_config.SYNTAX_CHUNK_NODE_TYPES:
            start_line = node.start_point[0] + 1
            end_line = node.end_point[0] + 1
            chunk_text = node.text.decode('utf8', errors='ignore')
            chunks.append({
                "text": chunk_text,
                "file_path": str(file_path),
                "start_line": start_line,
                "end_line": end_line
            })
        else:
            for child in node.children:
                traverse_tree(child)

    traverse_tree(tree.root_node)
    
    # If AST chunking results in no chunks (e.g., a file with no functions/classes),
    # do not fall back to line chunking, as it might be an empty or simple file.
    # The indexer can decide to do a line-based pass if needed.
    return chunks

def chunk_by_lines(file_path: Path, file_content: str, lines_per_chunk=20, overlap=5):
    """A simple fallback chunker that splits by a fixed number of lines."""
    chunks = []
    lines = file_content.splitlines()
    line_count = len(lines)
    current_line = 0

    while current_line < line_count:
        end_line_num = min(current_line + lines_per_chunk, line_count)
        chunk_text = "\n".join(lines[current_line:end_line_num])
        if chunk_text.strip(): # Avoid empty chunks
            chunks.append({
                "text": chunk_text,
                "file_path": str(file_path),
                "start_line": current_line + 1,
                "end_line": end_line_num
            })
        current_line += lines_per_chunk - overlap
    return chunks

def chunk_file(file_path: Path, file_content: str):
    """Intelligently chooses the best chunking method based on file type."""
    file_ext = file_path.suffix
    if file_ext in default_config.LANGUAGE_MAP:
        # Prioritize syntax-based chunking for code
        syntax_chunks = chunk_by_syntax(file_path, file_content)
        if syntax_chunks:
            return syntax_chunks
    
    # Fallback to line-based chunking for text files or code without recognized structures
    return chunk_by_lines(file_path, file_content)

# --- Core Qdrant VectorDB Class ---
class VectorDB:
    def __init__(self):
        self.config = load_project_config()
        self.client = qdrant_client.QdrantClient(url=self.config['qdrant_url'])
        self.model = get_embedding_model(self.config['model_name'])
        self.collection_name = self.config['collection_name']
        self._ensure_collection_exists()

    def _ensure_collection_exists(self):
        """
        Checks if the collection exists AND has the correct vector dimensions.
        If not, it recreates it.
        """
        try:
            collection_info = self.client.get_collection(collection_name=self.collection_name)
            model_dim = self.model.get_sentence_embedding_dimension()
            collection_dim = collection_info.vectors_config.params.size

            if model_dim == collection_dim:
                # The collection exists and is correct, we are done.
                return
            
            # If dimensions mismatch, we must recreate.
            console.log(f"[yellow]Warning:[/yellow] Collection '[cyan]{self.collection_name}[/cyan]' exists but has wrong vector dimension (Expected: {model_dim}, Found: {collection_dim}).")
            console.log("Recreating collection to match the new model...")
            
        except Exception:
            # This triggers if the collection doesn't exist at all.
            console.log(f"Collection '[cyan]{self.collection_name}[/cyan]' not found. Creating it now.")

        # This code will now run if the collection doesn't exist OR if dimensions mismatch.
        self.client.recreate_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(
                size=self.model.get_sentence_embedding_dimension(),
                distance=Distance.COSINE
            ),
        )
        console.log("✅ Collection is ready.")


    def index_project(self, root_dir='.'):
        """Performs a full scan and indexing of the project directory."""
        console.log(f"Starting full project indexing for collection '[cyan]{self.collection_name}[/cyan]'...")
        root_path = Path(root_dir)
        files_to_process = []
        ignore_list = self.config['ignore_list']

        for path in root_path.rglob('*'):
            if path.is_file() and not any(part in path.parts for part in ignore_list) and not path.name in ignore_list:
                files_to_process.append(path)
        
        for file_path in track(files_to_process, description="Indexing project files..."):
            self.update_file(str(file_path), show_progress=False)
        console.log("✅ Project indexing complete.")

    def update_file(self, file_path_str: str, show_progress: bool = True):
        """Updates the vectors for a single file by deleting old entries and upserting new ones."""
        if show_progress:
            console.log(f"Updating vectors for: [yellow]{file_path_str}[/yellow]")

        # 1. Delete all existing points for this file path
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=Filter(must=[FieldCondition(key="file_path", match=MatchValue(value=file_path_str))]),
            wait=True,
        )
        
        # 2. Read, chunk, and upsert the new content
        try:
            file_path = Path(file_path_str)
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            chunks = chunk_file(file_path, content)
            if not chunks:
                return

            # Batch encode for efficiency
            vectors = self.model.encode([chunk["text"] for chunk in chunks])

            points_to_upsert = [
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vectors[i].tolist(),
                    payload=chunk
                ) for i, chunk in enumerate(chunks)
            ]

            if points_to_upsert:
                self.client.upsert(collection_name=self.collection_name, points=points_to_upsert, wait=True)
        
        except FileNotFoundError:
            if show_progress:
                console.log(f"  - File not found: {file_path_str}. Assumed deleted, old vectors removed.")
        except Exception as e:
            console.log(f"[bold red]Error updating {file_path_str}:[/bold red] {e}")

    def query(self, query_text: str, limit: int = 5) -> list:
        """Searches the vector database with a natural language query."""
        # For BGE models, prepending an instruction for retrieval tasks improves performance.
        prefixed_query = f'Represent this sentence for searching relevant passages: {query_text}'
        query_vector = self.model.encode(prefixed_query).tolist()
        
        search_result = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit,
            with_payload=True
        )
        
        results_for_ai = [
            {
                "score": hit.score,
                "file_path": hit.payload["file_path"],
                "start_line": hit.payload["start_line"],
                "end_line": hit.payload["end_line"],
                "code_chunk": hit.payload["code_chunk"]
            }
for hit in search_result
        ]
        return results_for_ai