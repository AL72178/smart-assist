/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
/*=============== TABBED NAVIGATION LOGIC ===============*/
const navLinks = document.querySelectorAll('.nav__link');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); 


    const targetId = link.getAttribute('href').substring(1); 
    const targetSection = document.getElementById(targetId);

    if (targetSection) {

      navLinks.forEach(l => l.classList.remove('active-link'));

      link.classList.add('active-link');


      sections.forEach(s => s.classList.remove('active-section'));

      targetSection.classList.add('active-section');
      

      window.scrollTo(0, 0);
    }
  });
});


/*=============== HANDLE INITIAL HASH & INVALID LINKS ===============*/
window.addEventListener('load', () => {
    let hash = window.location.hash;
    
    if (hash) {
        // Remove '#'
        const targetId = hash.substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection && targetSection.classList.contains('section')) {
            // Valid Hash: Trigger click on corresponding link to activate tab
            const link = document.querySelector(`.nav__link[href="${hash}"]`);
            if (link) {
                link.click();
            }
        } else {
            // Invalid Hash: Redirect to default (Date Gap) and clear hash
            history.replaceState(null, null, ' '); 
            const defaultLink = document.querySelector('.nav__link[href="#date-gap"]');
            if (defaultLink) defaultLink.click();
        }
    }
});

/*=============== DATE GAP CALCULATION ===============*/
const calcBtn = document.getElementById('calcBtn');
const resetBtn = document.getElementById('resetBtn');
const resultText = document.getElementById('result');

if(calcBtn) {
  calcBtn.addEventListener('click', () => {
    const fromDate = new Date(document.getElementById('from').value);
    const toDate = new Date(document.getElementById('to').value);

    // Reset classes
    resultText.classList.remove('text-error', 'text-default');

    if (isNaN(fromDate) || isNaN(toDate)) {
      resultText.classList.add('text-error');
      resultText.innerText = 'Please select valid dates.';
      return;
    }


    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    resultText.classList.add('text-default');
    resultText.innerText = `${diffDays} Days`;
  });
}

if(resetBtn) {
  resetBtn.addEventListener('click', () => {
    document.getElementById('from').value = '';
    document.getElementById('to').value = '';
    resultText.innerText = '';
    resultText.classList.remove('text-error', 'text-default');
  });
}
/*=============== CHANGE BACKGROUND HEADER ===============*/
function scrollHeader() {
  const header = document.getElementById('header');

  if (this.scrollY >= 80) header.classList.add('scroll-header');
  else header.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader);

/*=============== JULIAN CONVERT ===============*/
const btnConvertToJulian = document.getElementById('btnConvertToJulian');
const btnConvertToGregorian = document.getElementById('btnConvertToGregorian');
const btnClearJulian = document.getElementById('btnClearJulian');
const julianResult = document.getElementById('result-julian');

if (btnConvertToJulian) {
  btnConvertToJulian.addEventListener('click', () => {
    const dateInput = document.getElementById('gregorianDate').value;
    
    // Reset styles
    julianResult.classList.remove('text-error', 'text-default');
    
    if (!dateInput) {
      julianResult.classList.add('text-error');
      julianResult.innerText = "Please enter a valid date.";
      return;
    }
    const gregorianDate = new Date(dateInput);
    
    const year = gregorianDate.getFullYear();
    const januaryFirst = new Date(year, 0, 1);
    const daysDifference = Math.floor((gregorianDate - januaryFirst) / (24 * 60 * 60 * 1000)) + 1;
    // Format: YYDDD (Last 2 digits of year + 3 digit day of year)
    const yearShort = year.toString().slice(2);
    const julianDate = yearShort + daysDifference.toString().padStart(3, '0');
    
    julianResult.classList.add('text-default');
    julianResult.innerText = `Julian Date: ${julianDate}`;
    
    // Show copy button
    const btnCopy = document.getElementById('btnCopyResult');
    if(btnCopy) btnCopy.classList.remove('hidden');
  });
}

if (btnConvertToGregorian) {
  btnConvertToGregorian.addEventListener('click', () => {
    const julianInput = document.getElementById('julianDate').value;
    
    julianResult.classList.remove('text-error', 'text-default');

    if (!julianInput || julianInput.length !== 5) {
      julianResult.classList.add('text-error');
      julianResult.innerText = "Please enter a 5-digit Julian date (YYDDD).";
      const btnCopy = document.getElementById('btnCopyResult');
      if(btnCopy) btnCopy.classList.add('hidden');
      return;
    }
    
    const yearShort = parseInt(julianInput.substring(0, 2));
    const days = parseInt(julianInput.substring(2));
    
    // Logic: year = 2000 + yearShort (Assuming 21st century)
    const year = 2000 + yearShort; 
    const gregorianDate = new Date(year, 0, 1); // Jan 1st of that year
    gregorianDate.setDate(gregorianDate.getDate() + days - 1); // Add days
    
    const result = `${(gregorianDate.getMonth() + 1).toString().padStart(2, '0')}/${gregorianDate.getDate().toString().padStart(2, '0')}/${gregorianDate.getFullYear()}`;
    
    julianResult.classList.add('text-default');
    julianResult.innerText = `Gregorian Date: ${result}`;
    
    // Show copy button
    const btnCopy = document.getElementById('btnCopyResult');
    if(btnCopy) btnCopy.classList.remove('hidden');
  });
}

if (btnClearJulian) {
  btnClearJulian.addEventListener('click', () => {
    document.getElementById('gregorianDate').value = '';
    document.getElementById('julianDate').value = '';
    julianResult.innerText = '';
    const btnCopy = document.getElementById('btnCopyResult');
    if(btnCopy) btnCopy.classList.add('hidden');
  });
}

/*=============== LOG ASSIST ===============*/
const logOutputContainer = document.querySelector('.output-container');
const completeLogButton = document.getElementById('completeLogButton');
const resetLogButton = document.getElementById('resetLogButton');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');

if (completeLogButton) {
    completeLogButton.addEventListener('click', function (event) {
        event.preventDefault();
        const reqId = formatText(document.getElementById('req_id').value);
        const arc = formatText(document.getElementById('arc').value);
        const mlhInput = document.getElementById('mlh').value; 
        
        let mlhJulian = mlhInput;
        // Simple check: Is it Julian (5 digits)?
        if (!/^\d{5}$/.test(mlhInput)) {
            mlhJulian = gregorianToJulianDate(mlhInput);
        }

        const reason = formatText(document.getElementById('reason').value);

        // Template
        const template = `Inquiry No.: ${reqId} | ARC Code: ${arc} | MLH: ${mlhJulian} | ${reason}`;

        // Format based on mode
        const isCIW = modeToggle.checked; 
        const formattedText = isCIW ? formatLinesCIW(template, 74) : formatLinesWGS(template, 74);

        displayOutput(formattedText);
    });
}

if (resetLogButton) {
    resetLogButton.addEventListener('click', function () {
        document.getElementById('req_id').value = '';
        document.getElementById('arc').value = '';
        document.getElementById('mlh').value = '';
        document.getElementById('reason').value = 'Adjustment made in claim as per ';
        document.getElementById('outputLog').textContent = '';
        if(logOutputContainer) logOutputContainer.classList.add('hidden');
    });
}

if (modeToggle) {
    modeToggle.addEventListener('change', function () {
        if (this.checked) {
            modeLabel.textContent = 'CIW';
        } else {
            modeLabel.textContent = 'WGS';
        }
    });
}

// Helper Functions
function formatText(text) {
    if(!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function formatLinesWGS(text, maxLength) {
    let lines = [];
    let line = '';
    const words = text.split(' ');

    words.forEach(word => {
        if ((line + word).length <= maxLength) {
            line += word + ' ';
        } else {
            lines.push(line.trim());
            line = word + ' ';
        }
    });

    lines.push(line.trim()); 
    return lines.join('\n');
}

function formatLinesCIW(text, maxLength) {
    let lines = [];
    let line = '';
    const words = text.split(' ');

    words.forEach(word => {
        if ((line + word).length <= maxLength) {
            line += word + ' ';
        } else {
            line = line.trim().padEnd(maxLength, '_'); // Pad with underscore
            lines.push(line);
            line = word + ' '; 
        }
    });

    if (line.trim().length > 0) {
        line = line.trim().padEnd(maxLength, '_');
        lines.push(line);
    }

    return lines.join('\n');
}

function displayOutput(text) {
    const outputElement = document.getElementById('outputLog');
    outputElement.textContent = text.toUpperCase();
    if(logOutputContainer) logOutputContainer.classList.remove('hidden');
}

function gregorianToJulianDate(gregorianDate) {
    // Basic date parser for MM/DD/YYYY or similar
    const date = new Date(gregorianDate);
    if (isNaN(date)) return gregorianDate; // Return original if invalid date

    const year = date.getFullYear();
    const januaryFirst = new Date(year, 0, 1);
    const dayOfYear = Math.floor((date - januaryFirst) / (24 * 60 * 60 * 1000)) + 1;
    
    const yearShort = year.toString().slice(2);
    return yearShort + dayOfYear.toString().padStart(3, '0');
}

/* Log Assist Copy */
const btnCopyLog = document.getElementById('btnCopyLog');
if (btnCopyLog) {
    btnCopyLog.addEventListener('click', () => {
        const text = document.getElementById('outputLog').textContent;
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = btnCopyLog.innerHTML;
            btnCopyLog.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 15.59 4.71 11.3 3.3 12.71l5 5c.2.2.45.29.71.29s.51-.1.71-.29l11-11-1.41-1.41L9.02 15.59Z"></path>
                </svg>
            `;
            
            setTimeout(() => {
                btnCopyLog.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 2H10c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 12H10V4h10z"></path>
                      <path d="M14 20H4V10h2V8H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2h-2z"></path>
                    </svg>
                `; 
            }, 2000);
        });
    });
}


/*=============== COPY RESULT BUTTON ===============*/
const btnCopyResult = document.getElementById('btnCopyResult');
if (btnCopyResult) {
  btnCopyResult.addEventListener('click', () => {
    // Extract just the value, removing "Julian Date: " or "Gregorian Date: "
    const fullText = julianResult.innerText;
    let textToCopy = fullText;
    
    if (fullText.includes(": ")) {
        textToCopy = fullText.split(": ")[1];
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
       const originalIcon = btnCopyResult.innerHTML;
       btnCopyResult.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
        </svg>
       `;

       setTimeout(() => {
         btnCopyResult.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 2H10c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 12H10V4h10z"></path>
                <path d="M14 20H4V10h2V8H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2h-2z"></path>
            </svg>
         `;
       }, 2000);
    });
  });
}

/*=============== LETTER BREAK GEN ===============*/
const letterBreakInput = document.getElementById('letterBreakInput');
const letterBreakOutput = document.getElementById('letterBreakOutput');
const letterBreakCharCount = document.getElementById('letterBreakCharCount');
const btnDivideText = document.getElementById('btnDivideText');
const btnResetLetterBreak = document.getElementById('btnResetLetterBreak');

const LB_CHUNK_SIZE = 63;
let lbOutputBoxCount = 0;

if (letterBreakInput) {
    letterBreakInput.addEventListener('input', lbCountCharacters);
}

if (btnDivideText) {
    btnDivideText.addEventListener('click', lbDivideText);
}

if (btnResetLetterBreak) {
    btnResetLetterBreak.addEventListener('click', lbResetText);
}

function lbDivideText() {
    const inputText = letterBreakInput.value.trim();
    if (!letterBreakOutput) return;
    
    letterBreakOutput.innerHTML = '';
    lbOutputBoxCount = 0; 

    if (!inputText) return;

    let start = 0;

    while (start < inputText.length) {
        let end = start + LB_CHUNK_SIZE;

        if (end >= inputText.length) {
            end = inputText.length;
        } else {
            // Find last space before chunk limit
            const lastSpaceIndex = inputText.lastIndexOf(' ', end);

            // Only adjust if a valid space exists after start
            if (lastSpaceIndex > start) {
                end = lastSpaceIndex;
            }
        }

        const chunkText = inputText.substring(start, end).trim();
        if (chunkText) {
            lbCreateOutputBox(chunkText);
        }

        start = end;
    }
}

function lbCreateOutputBox(text) {
    lbOutputBoxCount++;

    const wrapper = document.createElement('div');
    wrapper.className = 'textBoxWrapper';

    const textBox = document.createElement('textarea');
    textBox.className = 'textBox';
    textBox.readOnly = true;
    textBox.value = text;

    // Red border if box index > 10
    if (lbOutputBoxCount > 10) {
        textBox.classList.add('textBox--limit-exceeded');
    }

    const copyBtn = document.createElement('button');
    copyBtn.className = 'lb-copy-btn';
    copyBtn.title = "Copy";
    copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H10c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 12H10V4h10z"></path>
            <path d="M14 20H4V10h2V8H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-2h-2z"></path>
        </svg>
    `;
    
    copyBtn.addEventListener('click', () => lbCopyText(textBox, copyBtn));

    wrapper.appendChild(textBox);
    wrapper.appendChild(copyBtn);

    letterBreakOutput.appendChild(wrapper);
}

function lbCopyText(textElement, btnElement) {
    textElement.select();
    textElement.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(textElement.value).then(() => {
        // Change icon to check
        const originalContent = btnElement.innerHTML;
        btnElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
            </svg>
        `;
        
        // Revert back after 2 seconds
        setTimeout(() => {
            btnElement.innerHTML = originalContent;
        }, 2000);
        
        lbShowCopiedMessage();
    });
}

function lbShowCopiedMessage() {
    const copiedMessage = document.createElement('div');
    copiedMessage.className = 'copied-msg';
    copiedMessage.innerText = 'Copied!';

    document.body.appendChild(copiedMessage);

    setTimeout(() => {
        copiedMessage.remove();
    }, 1000);
}

function lbResetText() {
    letterBreakInput.value = '';
    letterBreakOutput.innerHTML = '';
    lbCountCharacters();
}

function lbCountCharacters() {
    if(letterBreakCharCount) {
        letterBreakCharCount.innerText = 'Characters: ' + letterBreakInput.value.length;
    }
}


/*=============== TODO NOTE ===============*/
const addNoteBtn = document.getElementById('addNoteBtn');
const clearAllNotesBtn = document.getElementById('clearAllNotesBtn');
const notesGrid = document.getElementById('notes-grid');

// State
let notes = JSON.parse(localStorage.getItem('smartAssistNotes') || '[]');

// Init
if (notesGrid) {
    renderNotes();
}

if (addNoteBtn) {
    addNoteBtn.addEventListener('click', () => {
        const newNote = {
            id: Date.now(),
            content: ''
        };
        notes.push(newNote);
        saveNotes();
        renderNotes();
    });
}

if (clearAllNotesBtn) {
    clearAllNotesBtn.addEventListener('click', () => {
        if(notes.length === 0) return;
        
        const confirmDelete = confirm("Are you sure you want to delete ALL notes? This cannot be undone.");
        if (confirmDelete) {
            notes = [];
            saveNotes();
            renderNotes();
        }
    });
}

function saveNotes() {
    localStorage.setItem('smartAssistNotes', JSON.stringify(notes));
}

function renderNotes() {
    if(!notesGrid) return;
    notesGrid.innerHTML = '';
    
    notes.forEach(note => {
        const noteEl = createNoteElement(note);
        notesGrid.appendChild(noteEl);
    });
}

function createNoteElement(note) {
    const div = document.createElement('div');
    div.classList.add('sticky-note');
    
    // Content Editable Div (Rich Text)
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('sticky-content');
    contentDiv.contentEditable = true;
    contentDiv.setAttribute('placeholder', 'Type note here...');
    contentDiv.innerHTML = note.content; // Load HTML content
    
    // Auto-save on input
    contentDiv.addEventListener('input', () => {
        note.content = contentDiv.innerHTML;
        saveNotes();
    });

    // Keyboard Shortcuts (Ctrl+B)
    contentDiv.addEventListener('keydown', (e) => {
        if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
            e.preventDefault();
            document.execCommand('bold');
        }
    });

    // Actions Container
    const actions = document.createElement('div');
    actions.classList.add('sticky-actions');

    /* --- BOLD BUTTON --- */
    const boldBtn = document.createElement('button');
    boldBtn.classList.add('sticky-btn');
    boldBtn.title = "Bold Text";
    boldBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
             <path d="M8.21 13c2.106 0 3.412-1.087 3.412-2.823 0-1.306-.984-2.283-2.324-2.386v-.055a2.176 2.176 0 0 0 1.852-2.14c0-1.51-1.162-2.46-3.014-2.46H3.843V13H8.21zM5.908 4.674h1.696c.963 0 1.517.451 1.517 1.244 0 .834-.629 1.32-1.73 1.32H5.908V4.674zm0 6.788V8.598h1.73c1.217 0 1.88.492 1.88 1.415 0 .943-.643 1.449-1.832 1.449H5.908z"/>
        </svg>
    `;
    // Prevent focus loss when clicking button
    boldBtn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Stop button from taking focus
        document.execCommand('bold');
    });

    // Copy Button
    const copyBtn = document.createElement('button');
    copyBtn.classList.add('sticky-btn');
    copyBtn.title = "Copy Text";
    copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
            <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
        </svg>
    `;
    copyBtn.addEventListener('click', () => {
        // For rich text, we might want to copy plain text or HTML. 
        // Clipboard API usually handles plain text. innerText gets text.
        navigator.clipboard.writeText(contentDiv.innerText).then(() => {
            // Visual feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/></svg>`;
            setTimeout(() => {
                copyBtn.innerHTML = originalIcon;
            }, 1000);
        });
    });

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('sticky-btn', 'delete');
    deleteBtn.title = "Delete Note";
    deleteBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
    `;
    deleteBtn.addEventListener('click', () => {
        deleteNote(note.id);
    });

    actions.appendChild(boldBtn); // Add Bold Button
    actions.appendChild(copyBtn);
    actions.appendChild(deleteBtn);
    
    div.appendChild(contentDiv);
    div.appendChild(actions);
    
    return div;
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes();
}

