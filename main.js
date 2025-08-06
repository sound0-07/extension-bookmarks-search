const bookmarksContainer = document.getElementById('bookmarks');
const searchInput = document.getElementById('searchInput');

// Function to display a list of bookmark nodes
function displayBookmarks(nodes) {
  bookmarksContainer.innerHTML = ''; // Clear previous results
  const list = document.createElement('ul');
  for (const node of nodes) {
    const listItem = document.createElement('li');
    if (node.url) {
      // It's a bookmark
      const link = document.createElement('a');
      link.href = node.url;
      link.textContent = node.title;
      link.target = '_blank';
      listItem.appendChild(link);
    } else if (node.children) {
      // It's a folder
      const folderTitle = document.createElement('span');
      folderTitle.textContent = node.title;
      listItem.appendChild(folderTitle);
      // Recursively display children
      listItem.appendChild(displayBookmarks(node.children));
    }
    list.appendChild(listItem);
  }
  bookmarksContainer.appendChild(list);
}

// Function to render a flat list of bookmarks (for search results)
function renderBookmarkList(bookmarks) {
    bookmarksContainer.innerHTML = ''; // Clear the container
    const ul = document.createElement('ul');
    if (bookmarks.length > 0) {
        bookmarks.forEach(bookmark => {
            if (bookmark.url) { // Only show actual bookmarks
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.href = bookmark.url;
                a.textContent = bookmark.title === '' ? bookmark.url : bookmark.title;
                a.target = '_blank';
                li.appendChild(a);
                ul.appendChild(li);
            }
        });
    } else {
        const li = document.createElement('li');
        li.textContent = 'No bookmarks found.';
        ul.appendChild(li);
    }
    bookmarksContainer.appendChild(ul);
}


// Function to show all bookmarks
function showAllBookmarks() {
    chrome.bookmarks.getTree(bookmarkTree => {
        if (bookmarkTree && bookmarkTree.length > 0 && bookmarkTree[0].children) {
            renderBookmarkList(flattenTree(bookmarkTree[0].children));
        } else {
            bookmarksContainer.textContent = 'No bookmarks found.';
        }
    });
}

// Helper function to flatten the bookmark tree
function flattenTree(nodes) {
    let flatList = [];
    nodes.forEach(node => {
        if (node.url) {
            flatList.push(node);
        }
        if (node.children) {
            flatList = flatList.concat(flattenTree(node.children));
        }
    });
    return flatList;
}


// Event listener for the search input
searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    if (query) {
        chrome.bookmarks.search(query, (results) => {
            renderBookmarkList(results);
        });
    } else {
        showAllBookmarks();
    }
});

// Initial load
showAllBookmarks();
