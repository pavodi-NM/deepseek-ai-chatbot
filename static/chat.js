
function formatMessage(content) {

    content = content.replace(/```([\s\S]*?)```/g, (match, code) => 
        `<pre><code>${code.trim()}</code></pre>`
    );
    

    const parts = content.split(/<\/?pre[^>]*>/);
    return parts.map((part, index) => {
        // If it's an even index, it's outside pre tags
        if (index % 2 === 0) {
            return part.split('\n\n')
                .map(p => p.trim() ? `<p>${p}</p>` : '')
                .join('');
        }

        return `<pre>${part}</pre>`;
    }).join('');
}


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

function removeThinkingIndicator() {
    const thinking = document.querySelector('.thinking');
    if (thinking) {
        thinking.remove();
    }
}


function addMessage(content, role) {

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


    messageDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
}

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

document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        messageInput.addEventListener('input', function() {
            autoResize(this);
        });
    }
});