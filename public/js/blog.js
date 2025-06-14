// Load posts when page loads
window.onload = () => fetchPosts();

// Create a post
async function createPost() {
  const title = document.getElementById('title').value;
  const author = document.getElementById('author').value;
  const content = document.getElementById('content').value;

  const res = await fetch('/api/blogs/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, content })
  });

  if (res.ok) {
    alert('Post created');
    fetchPosts();
  }
}

// Fetch all posts
async function fetchPosts() {
  const res = await fetch('/api/blogs/all');
  const data = await res.json();

  const postContainer = document.getElementById('posts');
  postContainer.innerHTML = '';

  data.forEach(post => {
    postContainer.innerHTML += `
      <div class="post">
        <h2>${post.title}</h2>
        <p>${post.content}</p>
        <small>Author: ${post.author}</small><br/>
        <button onclick="deletePost('${post._id}')">Delete</button>
        <button onclick="editPost('${post._id}', '${post.title}', '${post.author}', \`${post.content}\`)">Edit</button>
      </div>
    `;
  });
}

// Delete a post
async function deletePost(id) {
  const res = await fetch(`/api/blogs/delete/${id}`, { method: 'DELETE' });
  if (res.ok) {
    alert('Deleted');
    fetchPosts();
  }
}

// Search posts
async function searchPosts() {
  const query = document.getElementById('search').value;
  const res = await fetch(`/api/blogs/search?q=${query}`);
  const data = await res.json();

  const postContainer = document.getElementById('posts');
  postContainer.innerHTML = '';

  data.forEach(post => {
    postContainer.innerHTML += `
      <div class="post">
        <h2>${post.title}</h2>
        <p>${post.content}</p>
        <small>Author: ${post.author}</small><br/>
        <button onclick="deletePost('${post._id}')">Delete</button>
        <button onclick="editPost('${post._id}', '${post.title}', '${post.author}', \`${post.content}\`)">Edit</button>
      </div>
    `;
  });
}

// Edit post prompt
async function editPost(id, title, author, content) {
  const newTitle = prompt('Update title', title);
  const newAuthor = prompt('Update author', author);
  const newContent = prompt('Update content', content);

  const res = await fetch(`/api/blogs/update/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle, author: newAuthor, content: newContent })
  });

  if (res.ok) {
    alert('Updated');
    fetchPosts();
  }
}
