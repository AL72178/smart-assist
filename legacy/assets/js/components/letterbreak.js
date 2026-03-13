// Cache frequently accessed DOM elements
const inputTextElement = document.getElementById('inputText');
const outputBoxesElement = document.getElementById('outputBoxes');
const charCountElement = document.getElementById('charCount');

// Attach event listeners
inputTextElement.addEventListener('input', countCharacters);
document.getElementById('divideButton').addEventListener('click', divideText);
document.getElementById('resetBtn').addEventListener('click', resetText);

function divideText() {
    const inputText = inputTextElement.value.trim().replace(/\s+/g, ' '); // Remove extra spaces
    outputBoxesElement.innerHTML = '';
    const CHUNK_SIZE = 63;

    let start = 0;

    while (start < inputText.length) {
        let end = start + CHUNK_SIZE;

        // Ensure we don't split a word in half
        if (end < inputText.length && inputText.charAt(end) !== ' ' && inputText.charAt(end) !== '\n') {
            while (end > start && inputText.charAt(end) !== ' ' && inputText.charAt(end) !== '\n') {
                end--;
            }
        }

        // If no space was found, break exactly at CHUNK_SIZE
        if (end === start) {
            end = start + CHUNK_SIZE;
        }

        // Get the chunk and ensure it has only one space between words
        let chunk = inputText.substring(start, end).trim();
        
        if (chunk) {
            let textBoxContainer = document.createElement('div');
            textBoxContainer.className = 'textBoxContainer';

            let textBox = document.createElement('textarea');
            textBox.className = 'textBox';
            textBox.setAttribute('readonly', true);
            textBox.value = chunk;

            let copyButton = document.createElement('button');
            copyButton.className = 'button primaryButton';
            copyButton.innerText = 'Copy';
            copyButton.addEventListener('click', () => copyText(textBox));

            // ✅ Reintroducing the styling for copy action
            textBox.addEventListener('copy', function () {
                textBox.style.outline = '2px solid rgba(76, 175, 80, 0.8)';
                setTimeout(() => {
                    textBox.style.outline = 'none';
                }, 1000); // Reset outline after 1 second
            });

            // Add spacing between output box and copy button
            const spacer = document.createElement('div');
            spacer.style.height = '5px';
            textBoxContainer.appendChild(textBox);
            textBoxContainer.appendChild(spacer);
            textBoxContainer.appendChild(copyButton);
            outputBoxesElement.appendChild(textBoxContainer);
        }

        start = end;
    }
}

function copyText(textElement) {
    textElement.select();
    textElement.setSelectionRange(0, 99999); // For mobile devices
    document.execCommand('copy');
    showCopiedMessage();
}

function showCopiedMessage() {
    const copiedMessage = document.createElement('div');
    copiedMessage.className = 'copied';
    copiedMessage.innerText = 'Copied';
    document.body.appendChild(copiedMessage);
    setTimeout(() => {
        copiedMessage.remove();
    }, 1000);
}

function resetText() {
    inputTextElement.value = '';
    outputBoxesElement.innerHTML = '';
    countCharacters(); // Reset character count
}

function countCharacters() {
    charCountElement.innerText = 'Characters: ' + inputTextElement.value.length; // Update label with character count
                                                 }
