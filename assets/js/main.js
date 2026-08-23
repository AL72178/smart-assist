/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
/*=============== TABBED NAVIGATION LOGIC ===============*/
const navLinks = document.querySelectorAll('.nav__link');
const sections = document.querySelectorAll('.section');

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      navLinks.forEach((l) => l.classList.remove('active-link'));

      link.classList.add('active-link');

      sections.forEach((s) => s.classList.remove('active-section'));

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

if (calcBtn) {
  calcBtn.addEventListener('click', () => {
    const fromVal = document.getElementById('from').value;
    const toVal = document.getElementById('to').value;

    // Reset classes
    resultText.classList.remove('text-error', 'text-default');

    if (!fromVal || !toVal) {
      resultText.classList.add('text-error');
      resultText.innerText = 'Please select valid dates.';
      return;
    }

    const fromParts = fromVal.split('-');
    const toParts = toVal.split('-');

    let fromUtc, toUtc;
    if (fromParts.length === 3 && toParts.length === 3) {
      fromUtc = Date.UTC(parseInt(fromParts[0], 10), parseInt(fromParts[1], 10) - 1, parseInt(fromParts[2], 10));
      toUtc = Date.UTC(parseInt(toParts[0], 10), parseInt(toParts[1], 10) - 1, parseInt(toParts[2], 10));
    } else {
      fromUtc = new Date(fromVal).getTime();
      toUtc = new Date(toVal).getTime();
    }

    if (isNaN(fromUtc) || isNaN(toUtc)) {
      resultText.classList.add('text-error');
      resultText.innerText = 'Please select valid dates.';
      return;
    }

    const diffTime = Math.abs(toUtc - fromUtc);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    resultText.classList.add('text-default');
    resultText.innerText = `${diffDays} Days`;
  });
}

if (resetBtn) {
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
      julianResult.innerText = 'Please enter a valid date.';
      return;
    }

    const parts = dateInput.split('-');
    let year, month, day;
    if (parts.length === 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else {
      const gregorianDate = new Date(dateInput);
      if (isNaN(gregorianDate)) {
        julianResult.classList.add('text-error');
        julianResult.innerText = 'Please enter a valid date.';
        return;
      }
      year = gregorianDate.getFullYear();
      month = gregorianDate.getMonth();
      day = gregorianDate.getDate();
    }

    const utcDate = Date.UTC(year, month, day);
    const utcJan1 = Date.UTC(year, 0, 1);
    const daysDifference = Math.floor((utcDate - utcJan1) / (24 * 60 * 60 * 1000)) + 1;

    // Format: YYDDD (Last 2 digits of year + 3 digit day of year)
    const yearShort = year.toString().slice(-2);
    const julianDate = yearShort + daysDifference.toString().padStart(3, '0');

    julianResult.classList.add('text-default');
    julianResult.innerText = `Julian Date: ${julianDate}`;

    // Show copy button
    const btnCopy = document.getElementById('btnCopyResult');
    if (btnCopy) btnCopy.classList.remove('hidden');
  });
}

if (btnConvertToGregorian) {
  btnConvertToGregorian.addEventListener('click', () => {
    const julianInput = document.getElementById('julianDate').value;

    julianResult.classList.remove('text-error', 'text-default');

    if (!julianInput || julianInput.length !== 5) {
      julianResult.classList.add('text-error');
      julianResult.innerText = 'Please enter a 5-digit Julian date (YYDDD).';
      const btnCopy = document.getElementById('btnCopyResult');
      if (btnCopy) btnCopy.classList.add('hidden');
      return;
    }

    const yearShort = parseInt(julianInput.substring(0, 2), 10);
    const days = parseInt(julianInput.substring(2), 10);

    // Logic: year = 2000 + yearShort (Assuming 21st century)
    const year = 2000 + yearShort;
    const utcJan1 = Date.UTC(year, 0, 1);
    const targetUtc = utcJan1 + (days - 1) * (24 * 60 * 60 * 1000);
    const gregorianDate = new Date(targetUtc);

    const month = (gregorianDate.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = gregorianDate.getUTCDate().toString().padStart(2, '0');
    const fullYear = gregorianDate.getUTCFullYear();
    const result = `${month}/${day}/${fullYear}`;

    julianResult.classList.add('text-default');
    julianResult.innerText = `Gregorian Date: ${result}`;

    // Show copy button
    const btnCopy = document.getElementById('btnCopyResult');
    if (btnCopy) btnCopy.classList.remove('hidden');
  });
}

if (btnClearJulian) {
  btnClearJulian.addEventListener('click', () => {
    document.getElementById('gregorianDate').value = '';
    document.getElementById('julianDate').value = '';
    julianResult.innerText = '';
    const btnCopy = document.getElementById('btnCopyResult');
    if (btnCopy) btnCopy.classList.add('hidden');
  });
}

/*=============== LOG ASSIST ===============*/
const logOutputContainer = document.querySelector('.output-container');
const completeLogButton = document.getElementById('completeLogButton');
const resetLogButton = document.getElementById('resetLogButton');
const modeToggle = document.getElementById('modeToggle');
const modeLabel = document.getElementById('modeLabel');
const inquiryInput = document.getElementById('req_id');
const arcInput = document.getElementById('arc');
const lppDateInput = document.getElementById('mlh');
const adjustmentNoteInput = document.getElementById('reason');
const logAssistError = document.getElementById('logAssistError');
const arcStatusDot = document.getElementById('arcStatusDot');

const GENERAL_ADJUSTMENT_NOTE = 'Adjustment made in claim as per claim';
const ARC_ADJUSTMENT_NOTES = {
  SCX: 'Adjustment made in claim as per the coding review.',
  S40: 'Adjustment made in claim as per the POTF received in the inquiry.',
  S50: 'Adjustment made in claim as per the Retro Authorization received (#Auth_No.).',
  S94: "Adjustment made in claim as per the Retro Update in the Provider's Contract.",
  S84: "Adjustment made in claim as per the Retro Member's Eligibility.",
  S85: "Adjustment made in claim to update the Member's Group ID.",
  S77: 'Adjustment made in claim to key the claim correctly as per the claim form.',
  S89: 'Adjustment made in claim as the claim was incorrectly denied for duplicacy.',
  S05: 'Adjustment made in claim as per the EOB/Update.',
  S06: 'Adjustment made in claim as per the Medicare EOB/Update.',
};

let lastSystemGeneratedNote = GENERAL_ADJUSTMENT_NOTE;
let arcDebounceTimer = null;
let noteHighlightTimeout = null;

function getAdjustmentNoteForArc(arc) {
  const normalized = (arc || '').trim().toUpperCase();
  return ARC_ADJUSTMENT_NOTES[normalized] || GENERAL_ADJUSTMENT_NOTE;
}

function setArcStatusDot(visible) {
  if (arcStatusDot) {
    if (visible) {
      arcStatusDot.classList.add('visible');
    } else {
      arcStatusDot.classList.remove('visible');
    }
  }
}

function highlightAdjustmentNote() {
  if (!adjustmentNoteInput) return;
  adjustmentNoteInput.classList.add('note-highlight-success');
  if (noteHighlightTimeout) {
    clearTimeout(noteHighlightTimeout);
  }
  noteHighlightTimeout = setTimeout(() => {
    adjustmentNoteInput.classList.remove('note-highlight-success');
    noteHighlightTimeout = null;
  }, 1600);
}

function handleArcRecognition(arcValue) {
  const normalizedArc = (arcValue || '').trim().toUpperCase();

  if (/^[A-Za-z0-9]{3}$/.test(normalizedArc)) {
    setArcStatusDot(true);

    const resolvedNote = getAdjustmentNoteForArc(normalizedArc);

    if (adjustmentNoteInput) {
      const currentNote = adjustmentNoteInput.value;
      if (lastSystemGeneratedNote !== null && currentNote === lastSystemGeneratedNote) {
        if (currentNote !== resolvedNote) {
          adjustmentNoteInput.value = resolvedNote;
          lastSystemGeneratedNote = resolvedNote;
          highlightAdjustmentNote();
        }
      }
    }
  } else {
    setArcStatusDot(false);
  }
}

function showLogAssistError(message) {
  if (logAssistError) {
    logAssistError.textContent = message;
    logAssistError.hidden = false;
  }
  if (logOutputContainer) logOutputContainer.classList.add('hidden');
}

function clearLogAssistError() {
  if (logAssistError) {
    logAssistError.textContent = '';
    logAssistError.hidden = true;
  }
}

function isValidInquiryNumber(value) {
  return /^APP-COMM-[0-9]{7}$/.test(value.trim().toUpperCase());
}

function isValidArcCode(value) {
  return /^[A-Za-z0-9]{3}$/.test(value.trim());
}

if (completeLogButton) {
  completeLogButton.addEventListener('click', function (event) {
    event.preventDefault();
    clearLogAssistError();

    const inquiryValue = inquiryInput?.value.trim().toUpperCase() || '';
    const arcValue = arcInput?.value.trim().toUpperCase() || '';
    const mlhValue = lppDateInput?.value.trim() || '';

    // If debounce timer is pending when Complete Log is clicked, resolve immediately
    if (arcDebounceTimer) {
      clearTimeout(arcDebounceTimer);
      arcDebounceTimer = null;
      handleArcRecognition(arcValue);
    }

    if (!isValidInquiryNumber(inquiryValue)) {
      showLogAssistError('Enter a valid Inquiry No. in the format APP-COMM-1234567.');
      inquiryInput?.focus();
      return;
    }
    if (!isValidArcCode(arcValue)) {
      showLogAssistError('Enter an ARC Code containing exactly 3 letters or numbers.');
      arcInput?.focus();
      return;
    }

    const mlhJulian = gregorianToJulianDate(mlhValue);
    if (!mlhJulian) {
      showLogAssistError('Enter a valid LPP Date: Julian (YYDDD), MM/DD/YYYY, or Aug 6, 2026.');
      lppDateInput?.focus();
      return;
    }

    const reqId = formatText(inquiryValue);
    const arc = formatText(arcValue);
    const reason = (adjustmentNoteInput?.value || '').trim();

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
    if (arcDebounceTimer) {
      clearTimeout(arcDebounceTimer);
      arcDebounceTimer = null;
    }
    if (noteHighlightTimeout) {
      clearTimeout(noteHighlightTimeout);
      noteHighlightTimeout = null;
    }
    if (adjustmentNoteInput) {
      adjustmentNoteInput.classList.remove('note-highlight-success');
    }
    setArcStatusDot(false);

    if (inquiryInput) inquiryInput.value = '';
    if (arcInput) arcInput.value = '';
    if (lppDateInput) lppDateInput.value = '';
    if (adjustmentNoteInput) adjustmentNoteInput.value = GENERAL_ADJUSTMENT_NOTE;
    lastSystemGeneratedNote = GENERAL_ADJUSTMENT_NOTE;

    clearLogAssistError();
    const outputLog = document.getElementById('outputLog');
    if (outputLog) outputLog.textContent = '';
    if (logOutputContainer) logOutputContainer.classList.add('hidden');
  });
}

if (arcInput) {
  arcInput.addEventListener('input', () => {
    arcInput.value = arcInput.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase();
    setArcStatusDot(false);

    if (arcDebounceTimer) {
      clearTimeout(arcDebounceTimer);
      arcDebounceTimer = null;
    }

    const currentArc = arcInput.value;
    arcDebounceTimer = setTimeout(() => {
      handleArcRecognition(currentArc);
      arcDebounceTimer = null;
    }, 1500);
  });
}

if (adjustmentNoteInput) {
  adjustmentNoteInput.addEventListener('input', () => {
    if (adjustmentNoteInput.value !== lastSystemGeneratedNote) {
      lastSystemGeneratedNote = null;
    }
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
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function formatLinesWGS(text, maxLength) {
  let lines = [];
  let line = '';
  const words = text.split(' ');

  words.forEach((word) => {
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

  words.forEach((word) => {
    if ((line + word).length <= maxLength) {
      line += word + ' ';
    } else {
      line = line.trim().padEnd(maxLength, '_'); // Pad with underscore
      lines.push(line);
      line = word + ' ';
    }
  });

  if (line.trim().length > 0) {
    line = line.trim();
    lines.push(line);
  }

  return lines.join('\n');
}

function displayOutput(text) {
  const outputElement = document.getElementById('outputLog');
  outputElement.textContent = text.toUpperCase();
  if (logOutputContainer) logOutputContainer.classList.remove('hidden');
}

function gregorianToJulianDate(gregorianDateStr) {
  if (!gregorianDateStr) return null;
  const str = gregorianDateStr.trim();

  let month, day, year;
  const julianMatch = str.match(/^(\d{2})(\d{3})$/);
  const mdYMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  const yMDMatch = str.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  const textDateMatch = str.match(
    /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,)?\s+(\d{4})$/i,
  );

  if (julianMatch) {
    year = 2000 + parseInt(julianMatch[1], 10);
    const dayOfYear = parseInt(julianMatch[2], 10);
    const maxDay = isLeapYear(year) ? 366 : 365;
    if (dayOfYear < 1 || dayOfYear > maxDay) return null;
    month = 0;
    day = dayOfYear;
    const julianDate = new Date(Date.UTC(year, 0, day));
    month = julianDate.getUTCMonth();
    day = julianDate.getUTCDate();
  } else if (mdYMatch) {
    month = parseInt(mdYMatch[1], 10) - 1;
    day = parseInt(mdYMatch[2], 10);
    let y = parseInt(mdYMatch[3], 10);
    if (y < 100) y += 2000;
    year = y;
  } else if (yMDMatch) {
    year = parseInt(yMDMatch[1], 10);
    month = parseInt(yMDMatch[2], 10) - 1;
    day = parseInt(yMDMatch[3], 10);
  } else if (textDateMatch) {
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    month = monthNames.indexOf(textDateMatch[1].slice(0, 3).toLowerCase());
    day = parseInt(textDateMatch[2], 10);
    year = parseInt(textDateMatch[3], 10);
  } else {
    return null;
  }

  if (!isValidCalendarDate(year, month, day)) return null;

  const utcDate = Date.UTC(year, month, day);
  const utcJan1 = Date.UTC(year, 0, 1);
  const dayOfYear = Math.floor((utcDate - utcJan1) / (24 * 60 * 60 * 1000)) + 1;

  const yearShort = year.toString().slice(-2);
  return yearShort + dayOfYear.toString().padStart(3, '0');
}

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function isValidCalendarDate(year, month, day) {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 0 || month > 11 || day < 1) return false;
  const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month];
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

    if (fullText.includes(': ')) {
      textToCopy = fullText.split(': ')[1];
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
      content: '',
    };
    notes.push(newNote);
    saveNotes();
    renderNotes();
  });
}

if (clearAllNotesBtn) {
  clearAllNotesBtn.addEventListener('click', () => {
    if (notes.length === 0) return;

    const confirmDelete = confirm('Are you sure you want to delete ALL notes? This cannot be undone.');
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
  if (!notesGrid) return;
  notesGrid.innerHTML = '';

  notes.forEach((note) => {
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
  boldBtn.title = 'Bold Text';
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
  copyBtn.title = 'Copy Text';
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
  deleteBtn.title = 'Delete Note';
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
  notes = notes.filter((n) => n.id !== id);
  saveNotes();
  renderNotes();
}

/*=============== KEYBOARD NAVIGATION ===============*/
document.addEventListener('keydown', (e) => {
  // 1. Check if user is typing in an input/textarea
  const activeTag = document.activeElement.tagName.toLowerCase();
  const isEditable = document.activeElement.isContentEditable;

  if (activeTag === 'input' || activeTag === 'textarea' || isEditable) {
    return; // Do nothing if typing
  }

  // 2. Navigation Logic
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const navLinksArr = Array.from(document.querySelectorAll('.nav__link'));
    const activeIndex = navLinksArr.findIndex((link) => link.classList.contains('active-link'));

    if (activeIndex === -1) return;

    let nextIndex;
    if (e.key === 'ArrowRight') {
      nextIndex = (activeIndex + 1) % navLinksArr.length;
    } else {
      nextIndex = (activeIndex - 1 + navLinksArr.length) % navLinksArr.length;
    }

    // Trigger click to switch tab
    navLinksArr[nextIndex].click();
  }
});
