#!/usr/bin/env python3
"""
Sync new files/changes from local git to GitLab via Repository Files API.
Use this when you make local changes and want to push them to GitLab
(but don't want to use git push because fine-grained PATs are restricted).

This script:
1. Checks each file in `git ls-files` against GitLab
2. For new files: uses 'create' action
3. For modified files: uses 'update' action
4. Skips unchanged files

Usage:
  python3 scripts/sync_to_gitlab.py [--dry-run]
"""
import os
import json
import subprocess
import requests
import base64
import hashlib
from pathlib import Path
import sys

GITLAB_TOKEN = os.environ.get('GITLAB_TOKEN', 'glpat-gupt0wt_EfWmH99u8NGm6WM6MQpvOjEKdTpranZqbQ8.01.1716a5win')
PROJECT_ID = os.environ.get('PROJECT_ID', '87322047')
GITLAB_API = 'https://gitlab.com/api/v4'
REPO_DIR = '/home/z/my-project'
BRANCH = 'main'

HEADERS = {
    'PRIVATE-TOKEN': GITLAB_TOKEN,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
}

MAX_FILE_SIZE = 1024 * 1024
SKIP_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.webp',
    '.mp4', '.mp3', '.wav', '.avi', '.mov',
    '.zip', '.tar', '.gz', '.bz2', '.7z',
    '.pdf', '.docx', '.xlsx', '.pptx',
    '.exe', '.dll', '.so', '.dylib',
    '.woff', '.woff2', '.ttf', '.otf',
    '.lock', '.pyc', '.pyo',
}
SKIP_PATTERNS = [
    'node_modules/', '.next/', '.wrangler/', '__pycache__/',
    'dist/', 'build/', '.cache/', 'vendor/',
    'upload/pasted_image', '.bun/',
]


def should_skip(path):
    if not path:
        return True
    for pattern in SKIP_PATTERNS:
        if pattern in path:
            return True
    _, ext = os.path.splitext(path)
    if ext.lower() in SKIP_EXTENSIONS:
        return True
    return False


def read_file_content(path):
    full_path = os.path.join(REPO_DIR, path)
    try:
        with open(full_path, 'rb') as f:
            raw = f.read()
        try:
            content = raw.decode('utf-8')
            return content, False
        except UnicodeDecodeError:
            return base64.b64encode(raw).decode('ascii'), True
    except (FileNotFoundError, PermissionError, IsADirectoryError):
        return None, False


def list_local_files():
    result = subprocess.run(['git', 'ls-files'], capture_output=True, text=True, cwd=REPO_DIR)
    return [f for f in result.stdout.strip().split('\n') if f]


def list_gitlab_files():
    """Recursively list all files in GitLab repo."""
    all_files = {}
    page = 1
    while True:
        url = f"{GITLAB_API}/projects/{PROJECT_ID}/repository/tree?recursive=true&per_page=100&page={page}"
        try:
            response = requests.get(url, headers=HEADERS, timeout=60)
            response.raise_for_status()
            data = response.json()
            if not data:
                break
            for item in data:
                if item.get('type') == 'blob':
                    all_files[item['path']] = item.get('id', '')
            page += 1
            if len(data) < 100:
                break
        except Exception as e:
            print(f"  Error listing GitLab files (page {page}): {e}")
            break
    return all_files


def get_gitlab_file_content(path):
    """Get file content hash from GitLab to compare."""
    url = f"{GITLAB_API}/projects/{PROJECT_ID}/repository/files/{requests.utils.quote(path, safe='')}/raw?ref={BRANCH}"
    try:
        response = requests.get(url, headers=HEADERS, timeout=60)
        if response.status_code == 200:
            return response.content
        return None
    except:
        return None


def sync(dry_run=False):
    os.chdir(REPO_DIR)
    
    print("=== Step 1: Get list of local files ===")
    local_files = list_local_files()
    print(f"  Total local files: {len(local_files)}")
    
    print("\n=== Step 2: Get list of GitLab files ===")
    gitlab_files = list_gitlab_files()
    print(f"  Total GitLab files: {len(gitlab_files)}")
    
    # Find new, modified, and unchanged files
    actions = []
    new_count = 0
    update_count = 0
    skip_count = 0
    
    print("\n=== Step 3: Diff local vs GitLab ===")
    for path in local_files:
        if should_skip(path):
            skip_count += 1
            continue
        
        full_path = os.path.join(REPO_DIR, path)
        try:
            size = os.path.getsize(full_path)
        except:
            skip_count += 1
            continue
        
        if size > MAX_FILE_SIZE:
            print(f"  ⚠️  Skipping (size {size}B > {MAX_FILE_SIZE}B): {path}")
            skip_count += 1
            continue
        
        content, is_binary = read_file_content(path)
        if content is None:
            skip_count += 1
            continue
        
        if path in gitlab_files:
            # Check if modified
            remote_content = get_gitlab_file_content(path)
            local_bytes = content.encode('utf-8') if not is_binary else base64.b64decode(content)
            if remote_content == local_bytes:
                continue  # unchanged
            
            # Modified
            action = {
                'action': 'update',
                'file_path': path,
                'content': content,
            }
            if is_binary:
                action['encoding'] = 'base64'
            actions.append(action)
            update_count += 1
            print(f"  📝 Modified: {path}")
        else:
            # New file
            action = {
                'action': 'create',
                'file_path': path,
                'content': content,
            }
            if is_binary:
                action['encoding'] = 'base64'
            actions.append(action)
            new_count += 1
            print(f"  ➕ New: {path}")
    
    print(f"\n  Summary:")
    print(f"    New files: {new_count}")
    print(f"    Modified files: {update_count}")
    print(f"    Skipped (binary/large/pattern): {skip_count}")
    print(f"    Actions to push: {len(actions)}")
    
    if not actions:
        print("\n✅ No changes to push. GitLab is in sync.")
        return 0
    
    if dry_run:
        print("\n[DRY RUN] Skipping actual push.")
        return 0
    
    # Push in chunks
    CHUNK_SIZE = 50
    chunks = [actions[i:i+CHUNK_SIZE] for i in range(0, len(actions), CHUNK_SIZE)]
    
    print(f"\n=== Step 4: Push {len(chunks)} commit(s) ===")
    for i, chunk in enumerate(chunks, 1):
        message = f"Sync from GitHub - chunk {i}/{len(chunks)} ({len(chunk)} files)"
        payload = {
            'branch': BRANCH,
            'commit_message': message,
            'actions': chunk,
        }
        print(f"\n--- Commit {i}/{len(chunks)} ({len(chunk)} actions) ---")
        try:
            response = requests.post(
                f"{GITLAB_API}/projects/{PROJECT_ID}/repository/commits",
                headers=HEADERS,
                json=payload,
                timeout=300,
            )
            if response.status_code == 201:
                data = response.json()
                print(f"✅ Created: {data.get('id', '')[:12]}")
            else:
                print(f"❌ HTTP {response.status_code}: {response.text[:300]}")
                return 1
        except Exception as e:
            print(f"❌ Error: {e}")
            return 1
        
        if i < len(chunks):
            import time
            time.sleep(3)
    
    print(f"\n✅ Sync complete!")
    return 0


if __name__ == '__main__':
    dry_run = '--dry-run' in sys.argv
    exit(sync(dry_run))
