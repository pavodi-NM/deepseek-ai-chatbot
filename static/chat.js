// Format message content with code blocks and paragraphs
function formatMessage(content) {
    // Replace code blocks with properly formatted HTML
    content = content.replace(/```([\s\S]*?)```/g, (match, code) => 
        `<pre><code>${code.trim()}</code></pre>`
    );
    
    // Format paragraphs, but skip if inside pre tags
    const parts = content.split(/<\/?pre[^>]*>/);
    return parts.map((part, index) => {
        // If it's an even index, it's outside pre tags
        if (index % 2 === 0) {
            return part.split('\n\n')
                .map(p => p.trim() ? `<p>${p}</p>` : '')
                .join('');
        }
        // If it's an odd index, it's inside pre tags, return as is
        return `<pre>${part}</pre>`;
    }).join('');
}

// Add thinking indicator while waiting for response
function addThinkingIndicator() {
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message assistant thinking';
    thinkingDiv.innerHTML = `
        <div class="message-icon">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="thinking-indicator">
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <div class="thinking-dot"></div>
                <span>AI is thinking...</span>
            </div>
        </div>
    `;
    document.getElementById('messages').appendChild(thinkingDiv);
    thinkingDiv.scrollIntoView({ behavior: 'smooth' });
}

// Remove thinking indicator when response is received
function removeThinkingIndicator() {
    const thinking = document.querySelector('.thinking');
    if (thinking) {
        thinking.remove();
    }
}

// Add a new message to the chat
function addMessage(content, role) {
    // If it's a user message, show thinking indicator
    if (role === 'user') {
        addThinkingIndicator();
    } else {
        removeThinkingIndicator();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const formattedContent = formatMessage(content);
    
    messageDiv.innerHTML = `
        <div class="message-icon">
            <i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="message-content">${formattedContent}</div>
    `;
    
    document.getElementById('messages').appendChild(messageDiv);
    messageDiv.scrollIntoView({ behavior: 'smooth' });

    // Highlight code blocks after adding message
    messageDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

// Auto-resize textarea
function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    
    // Limit maximum height
    const maxHeight = 200;
    if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
    } else {
        textarea.style.overflowY = 'hidden';
    }
}

// Initialize message input
document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        // Handle Enter key
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Handle input resize
        messageInput.addEventListener('input', function() {
            autoResize(this);
        });
    }
});