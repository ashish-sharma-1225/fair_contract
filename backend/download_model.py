"""
Model download script for ClauseLens Local AI.
Downloads Qwen2.5-1.5B-Instruct in GGUF format (Q4_K_M quantization)
from the official Hugging Face repository: Qwen/Qwen2.5-1.5B-Instruct-GGUF.
"""

import os
import sys
import argparse
from huggingface_hub import hf_hub_download

DEFAULT_REPO_ID = "Qwen/Qwen2.5-1.5B-Instruct-GGUF"
DEFAULT_FILENAME = "qwen2.5-1.5b-instruct-q4_k_m.gguf"
DEFAULT_OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "models",
    "Qwen2.5-1.5B-Instruct",
)


def download_model(
    repo_id: str = DEFAULT_REPO_ID,
    filename: str = DEFAULT_FILENAME,
    target_dir: str = DEFAULT_OUTPUT_DIR,
    force: bool = False,
) -> str:
    """
    Downloads the GGUF model if not already present.
    Returns the absolute path to the downloaded model file.
    """
    os.makedirs(target_dir, exist_ok=True)
    target_file = os.path.join(target_dir, filename)

    if os.path.exists(target_file) and not force:
        file_size_mb = os.path.getsize(target_file) / (1024 * 1024)
        if file_size_mb > 500:  # Valid GGUF file is ~986 MB
            print(f"[INFO] Model already exists at: {target_file} ({file_size_mb:.1f} MB)")
            print("[INFO] Skipping download. Use --force to re-download.")
            return target_file
        else:
            print(f"[WARN] Incomplete model file detected ({file_size_mb:.1f} MB). Re-downloading...")

    print(f"[INFO] Downloading {filename} from Hugging Face ({repo_id})...")
    print(f"[INFO] Target directory: {target_dir}")

    try:
        downloaded_path = hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            local_dir=target_dir,
            local_dir_use_symlinks=False,
            resume_download=True,
        )
        file_size_mb = os.path.getsize(downloaded_path) / (1024 * 1024)
        print(f"[SUCCESS] Downloaded successfully: {downloaded_path} ({file_size_mb:.1f} MB)")
        return downloaded_path
    except Exception as e:
        print(f"[ERROR] Failed to download model from Hugging Face: {e}")
        print("[HINT] Ensure internet connection is active and huggingface_hub is installed.")
        raise


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download Qwen2.5-1.5B-Instruct GGUF weights")
    parser.add_argument("--repo-id", default=DEFAULT_REPO_ID, help="Hugging Face repo ID")
    parser.add_argument("--filename", default=DEFAULT_FILENAME, help="GGUF filename")
    parser.add_argument("--output-dir", default=DEFAULT_OUTPUT_DIR, help="Destination directory")
    parser.add_argument("--force", action="store_true", help="Force re-download even if file exists")

    args = parser.parse_args()
    try:
        path = download_model(
            repo_id=args.repo_id,
            filename=args.filename,
            target_dir=args.output_dir,
            force=args.force,
        )
        print(f"Model ready at: {path}")
    except Exception as exc:
        sys.exit(1)
