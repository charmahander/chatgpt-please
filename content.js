// ChatGPT Please Extension - Content Script
// Automatically appends "please" to the end of every prompt

(function() {
    'use strict';
    
    // Configuration
    const APPEND_TEXT = ' please';
    const DEBOUNCE_DELAY = 100; // ms
    
    // Track if we've already processed a message to avoid infinite loops
    let processedMessages = new Set();
    
    // Debug logging
    function debugLog(message, data = null) {
        console.log('[ChatGPT Please]', message, data || '');
    }
    
    // Function to append "please" to text if not already present
    function appendPlease(text) {
        if (!text || typeof text !== 'string') return text;
        
        const trimmedText = text.trim();
        if (trimmedText.toLowerCase().endsWith('please')) {
            return text; // Already ends with "please"
        }
        
        return text + APPEND_TEXT;
    }
    
    // Function to find and modify textarea/input elements
    function modifyInputElements() {
        debugLog('Searching for input elements...');
        
        // More comprehensive selectors for ChatGPT
        const selectors = [
            // Textarea selectors
            'textarea[placeholder*="Message"]',
            'textarea[placeholder*="message"]',
            'textarea[data-id*="root"]',
            'textarea[aria-label*="message"]',
            'textarea[aria-label*="Message"]',
            'textarea[role="textbox"]',
            'textarea[data-testid*="textbox"]',
            'textarea[data-testid*="input"]',
            'textarea',
            
            // Contenteditable selectors
            'div[contenteditable="true"][data-id*="root"]',
            'div[contenteditable="true"][role="textbox"]',
            'div[contenteditable="true"][aria-label*="message"]',
            'div[contenteditable="true"][data-testid*="textbox"]',
            'div[contenteditable="true"]',
            
            // Generic input selectors
            'input[type="text"]',
            'input[placeholder*="message"]',
            'input[placeholder*="Message"]'
        ];
        
        let foundElements = 0;
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            debugLog(`Selector "${selector}" found ${elements.length} elements`);
            
            elements.forEach(element => {
                if (element.dataset.pleaseProcessed) return; // Skip already processed elements
                
                // Mark as processed
                element.dataset.pleaseProcessed = 'true';
                foundElements++;
                
                debugLog('Processing element:', element);
                
                // For textarea elements
                if (element.tagName === 'TEXTAREA') {
                    const originalValue = element.value;
                    debugLog('Textarea value:', originalValue);
                    
                    if (originalValue && originalValue.trim() && !originalValue.toLowerCase().endsWith('please')) {
                        const newValue = appendPlease(originalValue);
                        element.value = newValue;
                        debugLog('Updated textarea value:', newValue);
                        
                        // Trigger multiple events to ensure the app notices
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        element.dispatchEvent(new Event('keyup', { bubbles: true }));
                        
                        // Force focus back to the element
                        element.focus();
                    }
                }
                
                // For contenteditable divs
                if (element.contentEditable === 'true') {
                    const textContent = element.textContent || element.innerText;
                    debugLog('Contenteditable text:', textContent);
                    
                    if (textContent && textContent.trim() && !textContent.toLowerCase().endsWith('please')) {
                        const newText = appendPlease(textContent);
                        element.textContent = newText;
                        debugLog('Updated contenteditable text:', newText);
                        
                        // Trigger multiple events to ensure the app notices
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        element.dispatchEvent(new Event('keyup', { bubbles: true }));
                        
                        // Force focus back to the element
                        element.focus();
                    }
                }
                
                // For input elements
                if (element.tagName === 'INPUT') {
                    const originalValue = element.value;
                    debugLog('Input value:', originalValue);
                    
                    if (originalValue && originalValue.trim() && !originalValue.toLowerCase().endsWith('please')) {
                        const newValue = appendPlease(originalValue);
                        element.value = newValue;
                        debugLog('Updated input value:', newValue);
                        
                        // Trigger input event
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
            });
        });
        
        debugLog(`Total elements processed: ${foundElements}`);
    }
    
    // Function to intercept form submissions and modify the data
    function interceptSubmissions() {
        // Listen for form submissions
        document.addEventListener('submit', function(event) {
            const form = event.target;
            if (!form) return;
            
            // Find textarea or contenteditable elements in the form
            const textInputs = form.querySelectorAll('textarea, div[contenteditable="true"]');
            
            textInputs.forEach(input => {
                if (input.tagName === 'TEXTAREA') {
                    const currentValue = input.value;
                    if (currentValue && !currentValue.toLowerCase().endsWith('please')) {
                        input.value = appendPlease(currentValue);
                    }
                } else if (input.contentEditable === 'true') {
                    const currentText = input.textContent || input.innerText;
                    if (currentText && !currentText.toLowerCase().endsWith('please')) {
                        input.textContent = appendPlease(currentText);
                    }
                }
            });
        }, true);
    }
    
    // Function to monitor for new messages being sent
    function monitorMessageSending() {
        // Look for send buttons and intercept their clicks
        const sendButtonSelectors = [
            'button[data-testid*="send"]',
            'button[aria-label*="Send"]',
            'button[title*="Send"]',
            'button:has(svg[data-icon*="send"])',
            'button:has(svg[data-icon*="arrow"])'
        ];
        
        sendButtonSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                if (button.dataset.pleaseProcessed) return;
                button.dataset.pleaseProcessed = 'true';
                
                button.addEventListener('click', function(event) {
                    // Small delay to allow the form to be populated
                    setTimeout(() => {
                        modifyInputElements();
                    }, 50);
                }, true);
            });
        });
    }
    
    // Function to observe DOM changes for dynamically added elements
    function observeDOMChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList') {
                    // Reset processed flags for new elements
                    const newElements = document.querySelectorAll('textarea, div[contenteditable="true"], button');
                    newElements.forEach(element => {
                        if (!element.dataset.pleaseProcessed) {
                            delete element.dataset.pleaseProcessed;
                        }
                    });
                    
                    // Re-run our functions for new elements
                    setTimeout(() => {
                        modifyInputElements();
                        monitorMessageSending();
                    }, 100);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Function to handle keyboard shortcuts (Enter key)
    function handleKeyboardShortcuts() {
        document.addEventListener('keydown', function(event) {
            // Check for Enter key (but not Shift+Enter for new lines)
            if (event.key === 'Enter' && !event.shiftKey) {
                debugLog('Enter key pressed, checking for active element...');
                
                // Find the active element
                const activeElement = document.activeElement;
                debugLog('Active element:', activeElement);
                
                if (activeElement && (
                    activeElement.tagName === 'TEXTAREA' || 
                    activeElement.contentEditable === 'true'
                )) {
                    debugLog('Active element is input field, processing...');
                    // Small delay to allow the text to be processed
                    setTimeout(() => {
                        modifyInputElements();
                    }, 10);
                }
            }
        }, true);
    }
    
    // More aggressive approach - intercept all input events
    function interceptAllInputEvents() {
        debugLog('Setting up input event interception...');
        
        // Listen for all input events
        document.addEventListener('input', function(event) {
            const target = event.target;
            debugLog('Input event detected on:', target);
            
            if (target && (target.tagName === 'TEXTAREA' || target.contentEditable === 'true' || target.tagName === 'INPUT')) {
                debugLog('Input event on input field, processing...');
                setTimeout(() => {
                    modifyInputElements();
                }, 50);
            }
        }, true);
        
        // Listen for all keyup events
        document.addEventListener('keyup', function(event) {
            const target = event.target;
            if (target && (target.tagName === 'TEXTAREA' || target.contentEditable === 'true' || target.tagName === 'INPUT')) {
                debugLog('Keyup event on input field, processing...');
                setTimeout(() => {
                    modifyInputElements();
                }, 50);
            }
        }, true);
    }
    
    // Initialize the extension
    function init() {
        debugLog('ChatGPT Please extension loaded');
        debugLog('Current URL:', window.location.href);
        debugLog('Document ready state:', document.readyState);
        
        // Wait for the page to be fully loaded
        if (document.readyState === 'loading') {
            debugLog('Document still loading, waiting...');
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(init, 100);
            });
            return;
        }
        
        debugLog('Document loaded, initializing...');
        
        // Run initial modifications
        modifyInputElements();
        monitorMessageSending();
        interceptSubmissions();
        handleKeyboardShortcuts();
        interceptAllInputEvents();
        observeDOMChanges();
        
        // Re-run periodically to catch any missed elements
        setInterval(() => {
            modifyInputElements();
            monitorMessageSending();
        }, 2000); // Increased interval to 2 seconds
        
        debugLog('Extension initialization complete');
    }
    
    // Start the extension
    debugLog('Starting ChatGPT Please extension...');
    init();
    
})();
