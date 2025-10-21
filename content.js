// ChatGPT Please Extension - Final Version
console.log('ChatGPT Please: Final version loaded');

// Function to add please
function addPlease(text) {
    if (!text || text.trim() === '') return 'please';
    if (text.toLowerCase().endsWith('please')) return text;
    return text + ' please';
}

// Find the input field
function findInput() {
    const inputs = document.querySelectorAll('textarea, div[contenteditable="true"]');
    for (let input of inputs) {
        const style = window.getComputedStyle(input);
        if (style.display !== 'none' && style.visibility !== 'hidden') {
            return input;
        }
    }
    return null;
}

// Modify the input field
function modifyInput() {
    const input = findInput();
    if (!input) return;
    
    let currentText = '';
    let newText = '';
    
    if (input.tagName === 'TEXTAREA') {
        currentText = input.value;
        newText = addPlease(currentText);
        if (newText !== currentText) {
            console.log('ChatGPT Please: Modifying textarea:', currentText, '->', newText);
            input.value = newText;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } else if (input.contentEditable === 'true') {
        currentText = input.innerText || input.textContent;
        newText = addPlease(currentText);
        if (newText !== currentText) {
            console.log('ChatGPT Please: Modifying contenteditable:', currentText, '->', newText);
            input.innerText = newText;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}

// Listen for Enter key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        console.log('ChatGPT Please: Enter pressed');
        modifyInput(); // Do it immediately
        // Also try to catch the request after a delay
        setTimeout(() => {
            console.log('ChatGPT Please: Checking for network requests after Enter...');
        }, 100);
    }
}, true);

// Listen for send button clicks
document.addEventListener('click', function(e) {
    const button = e.target.closest('button');
    if (button && (button.textContent.toLowerCase().includes('send') || 
                   button.getAttribute('aria-label')?.toLowerCase().includes('send'))) {
        console.log('ChatGPT Please: Send button clicked');
        modifyInput(); // Do it immediately
        // Also try to catch the request after a delay
        setTimeout(() => {
            console.log('ChatGPT Please: Checking for network requests after Send...');
        }, 100);
    }
}, true);

// Intercept ALL network requests to find the right one
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const [url, options] = args;
    
    console.log('ChatGPT Please: ALL fetch request to:', url);
    
    if (url && options && options.body) {
        console.log('ChatGPT Please: Request body:', options.body);
        
        // Try to modify any request that might contain messages
        try {
            const body = JSON.parse(options.body);
            console.log('ChatGPT Please: Parsed body:', body);
            
            if (body.messages && body.messages.length > 0) {
                const lastMessage = body.messages[body.messages.length - 1];
                if (lastMessage.content && !lastMessage.content.toLowerCase().endsWith('please')) {
                    console.log('ChatGPT Please: Intercepting network request');
                    console.log('Original message:', lastMessage.content);
                    lastMessage.content = addPlease(lastMessage.content);
                    options.body = JSON.stringify(body);
                    console.log('Modified message:', lastMessage.content);
                }
            }
        } catch (e) {
            console.log('ChatGPT Please: Not JSON request');
        }
    }
    
    return originalFetch.apply(this, args);
};

// Also intercept XMLHttpRequest
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalSend = xhr.send;
    const originalOpen = xhr.open;
    
    xhr.open = function(method, url, ...args) {
        console.log('ChatGPT Please: XHR OPEN:', method, url);
        return originalOpen.apply(this, [method, url, ...args]);
    };
    
    xhr.send = function(data) {
        console.log('ChatGPT Please: XHR SEND:', data);
        if (data && typeof data === 'string') {
            try {
                const body = JSON.parse(data);
                if (body.messages && body.messages.length > 0) {
                    const lastMessage = body.messages[body.messages.length - 1];
                    if (lastMessage.content && !lastMessage.content.toLowerCase().endsWith('please')) {
                        console.log('ChatGPT Please: Intercepting XHR request');
                        console.log('Original message:', lastMessage.content);
                        lastMessage.content = addPlease(lastMessage.content);
                        data = JSON.stringify(body);
                        console.log('Modified message:', lastMessage.content);
                    }
                }
            } catch (e) {
                // Not JSON, ignore
            }
        }
        return originalSend.call(this, data);
    };
    
    return xhr;
};

// Also try to intercept at the very last moment
document.addEventListener('beforeunload', function() {
    console.log('ChatGPT Please: Page unloading, checking for final requests...');
});

// Monitor for any network activity
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.name.includes('chatgpt') || entry.name.includes('openai') || entry.name.includes('backend-api')) {
            console.log('ChatGPT Please: Network activity detected:', entry.name);
        }
    }
});
observer.observe({ entryTypes: ['resource'] });

console.log('ChatGPT Please: Ready!');