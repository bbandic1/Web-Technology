function toggleTree(node) {
    const childNodes = node.querySelector('.child-nodes');
    const text = node.firstChild.textContent.trim();
  
    if (childNodes.classList.contains('hidden')) {
      childNodes.classList.remove('hidden');
      node.firstChild.textContent = text.replace('+', '-');
    } else {
      childNodes.classList.add('hidden');
      node.firstChild.textContent = text.replace('-', '+');
    }
  }
  