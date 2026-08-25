(function () {
  let tabs = [];
  const dynamicTabsContainer = document.getElementById('vpDynamicTabs');
  const tableBody = document.getElementById('vpTableBody');
  const paginationContainer = document.getElementById('vpPagination');
  const searchInput = document.getElementById('vpSearchInput');
  const codedByRadios = document.querySelectorAll("input[name='vpCodedByFilter']");
  const clearSearchBtn = document.getElementById('vpClearSearch');

  const prevBtn = document.getElementById('vpPrevBtn');
  const nextBtn = document.getElementById('vpNextBtn');

  const rowsPerPage = 10;
  let allData = [];
  let filteredData = [];
  let currentPage = 1;
  let selectedRadioValue = 'all';
  let selectedTabCategory = 'All';

  // ========================================================================
  // INPUT BOX: Letter Break & Abbreviation workflow
  // HTML controls: #vpLetterBreakInput, #vpApplyAbbrevBtn, #vpDivideTextBtn,
  // #vpResetLetterBreakBtn, and #vpAbbrevStatus.
  // ========================================================================
  const inputTextElement = document.getElementById('vpLetterBreakInput');
  const inputHighlightLayerElement = document.getElementById('vpInputHighlightLayer');
  const outputBoxesElement = document.getElementById('vpLetterBreakOutput');
  const charCountElement = document.getElementById('vpLetterBreakCharCount');
  const applyAbbrevButton = document.getElementById('vpApplyAbbrevBtn');
  const abbrevTextareaWrapElement = document.getElementById('vpAbbrevTextareaWrap');
  const abbrevStatusElement = document.getElementById('vpAbbrevStatus');
  const divideButton = document.getElementById('vpDivideTextBtn');
  const resetBtn = document.getElementById('vpResetLetterBreakBtn');

  let abbreviationDataPromise = null;
  const selectedAmbiguousDefinitions = new Map();
  const removedPointerCodes = [
    'D3',
    'D25',
    'D117',
    'D26',
    'D53',
    '00H49',
    'H49',
    '00H39',
    '00H39',
    '00H08',
    'H08',
    '00H71',
    'H71',
    '00H80',
    'H80',
  ];

  // --- Utility Functions ---
  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

  function getFilteredByRadio(data, value) {
    return value === 'pdr' ? data.filter((item) => item['Coded By']?.trim().toLowerCase() === 'pdr') : data;
  }

  function getSearchFiltered(data, query) {
    return data.filter((item) =>
      ['Inquiry', 'Secondary Category', 'Scenario', 'Decision Code', 'Short Summary', 'Verbiage'].some((key) =>
        item[key]?.toLowerCase().includes(query),
      ),
    );
  }

  function setActiveTab(tabText) {
    tabs.forEach((t) => {
      const isActive = t.textContent.trim() === tabText;
      t.classList.toggle('vp-tab--active', isActive);
      if (isActive) {
        t.setAttribute('aria-current', 'page');
      } else {
        t.removeAttribute('aria-current');
      }
    });
  }

  // --- Dynamic Tabs Rendering ---
  function renderTabs(data) {
    const categories = new Set(['All']);
    data.forEach((item) => {
      if (item['Inquiry']) {
        categories.add(item['Inquiry'].trim());
      }
    });

    if (dynamicTabsContainer) {
      dynamicTabsContainer.innerHTML = '';
      tabs = [];

      categories.forEach((category) => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = category === 'All' ? 'vp-tab vp-tab--active' : 'vp-tab';
        if (category === 'All') {
          a.setAttribute('aria-current', 'page');
        }
        a.textContent = category;

        a.addEventListener('click', (event) => {
          event.preventDefault();
          selectedTabCategory = event.currentTarget.textContent.trim();
          setActiveTab(selectedTabCategory);
          applyFilters();
        });

        dynamicTabsContainer.appendChild(a);
        tabs.push(a);
      });
    }
  }

  // --- Rendering Table ---
  function renderTable(data) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    data.forEach((item) => {
      const verbiageText = item['Verbiage'] || '';
      const verbiageHTML = verbiageText.replace(
        /([\[\(\{])\*([^{}\[\]\(\)]+?)([\]\)\}])/g,
        (match, open, content, close) =>
          `${open}<span contenteditable="true" class="editable-bracket">${content}</span>${close}`,
      );

      const row = document.createElement('tr');
      row.innerHTML = `
        <td style="font-weight: 600; width: 20%;">
          <div style="color: var(--title-color); font-weight: 700;">${item['Inquiry'] || 'N/A'}</div>
          <div style="font-size: 0.75rem; color: var(--text-color); opacity: 0.8; margin-top: 0.25rem;">${item['Secondary Category'] || ''}</div>
        </td>
        <td style="width: 25%;">
          <div style="color: var(--title-color); font-weight: 600;">${item['Scenario'] || ''}</div>
          <div style="margin-top: 0.25rem; font-size: 0.8rem; opacity: 0.9;">${item['Short Summary'] || ''}</div>
        </td>
        <td style="width: 15%;">
          ${
            item['Coded By']?.toLowerCase() === 'pdr'
              ? `<span class="vp-pill-badge">${item['Decision Code']}</span>`
              : item['Decision Code'] || ''
          }
        </td>
        <td class="vp-verbiage-cell" style="width: 30%; line-height: 1.5;">${verbiageHTML}</td>
        <td style="width: 10%;">
          <div class="vp-action-btn-group">
            <button class="vp-action-btn vp-action-btn--edit vp-edit-button" title="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
            </button>
            <button class="vp-action-btn vp-action-btn--copy vp-copy-button" title="Copy Verbiage">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
              </svg>
            </button>
          </div>
        </td>
      `;
      tableBody.appendChild(row);
    });
  }

  function handleTableActionClick(event) {
    const copyButton = event.target.closest('.vp-copy-button');
    if (copyButton) {
      const row = copyButton.closest('tr');
      const verbiageCell = row?.querySelector('.vp-verbiage-cell');
      const textToCopy = verbiageCell?.textContent.trim() || '';

      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(() => {
        copyButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        `;
        window.setTimeout(() => {
          copyButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
          `;
        }, 1500);
      });
      return;
    }

    const editButton = event.target.closest('.vp-edit-button');
    if (!editButton || !inputTextElement) return;

    const row = editButton.closest('tr');
    const verbiageCell = row?.querySelector('.vp-verbiage-cell');
    const textToEdit = verbiageCell?.textContent.trim() || '';

    if (!textToEdit) return;

    inputTextElement.value = textToEdit;
    countCharacters();

    const lbSection = document.querySelector('.vp-letter-break-container');
    if (lbSection) {
      lbSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (tableBody) {
    tableBody.addEventListener('click', handleTableActionClick);
  }

  function renderPagination(totalPages) {
    if (!paginationContainer) return;
    paginationContainer.querySelectorAll('a.vp-page-btn').forEach((btn) => btn.remove());

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('a');
      btn.href = '#';
      btn.textContent = i;
      btn.className = `vp-page-btn vp-page-link ${i === currentPage ? 'vp-page-link--active' : ''}`;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        displayPage(i);
      });

      paginationContainer.insertBefore(btn, nextBtn);
    }

    if (prevBtn) {
      prevBtn.classList.toggle('vp-page-link--disabled', currentPage === 1);
    }
    if (nextBtn) {
      nextBtn.classList.toggle('vp-page-link--disabled', currentPage === totalPages || totalPages === 0);
    }
  }

  function displayPage(page) {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    currentPage = Math.max(1, Math.min(page, totalPages));

    if (filteredData.length === 0) {
      renderTable([]);
      renderPagination(0);
      return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    renderTable(filteredData.slice(start, end));
    renderPagination(totalPages);
  }

  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const radioFiltered = getFilteredByRadio(allData, selectedRadioValue);
    const searchFiltered = getSearchFiltered(radioFiltered, query);

    const categoryCounts = {};
    searchFiltered.forEach((item) => {
      const category = item['Inquiry'] || 'All';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    tabs.forEach((tab) => {
      const tabName = tab.textContent.trim();
      const tabKey = tabName === 'All' ? 'All' : tabName;

      tab.style.display =
        tabKey === 'All' ? (searchFiltered.length > 0 ? '' : 'none') : categoryCounts[tabKey] ? '' : 'none';

      if (tab.classList.contains('vp-tab--active') && tab.style.display === 'none') {
        selectedTabCategory = 'All';
        setActiveTab('All');
      }
    });

    filteredData =
      selectedTabCategory === 'All'
        ? searchFiltered
        : searchFiltered.filter((item) => item['Inquiry'] === selectedTabCategory);

    displayPage(1);
  }

  // --- Search Input Listeners ---
  if (searchInput) {
    searchInput.addEventListener(
      'input',
      debounce(() => {
        if (clearSearchBtn) {
          clearSearchBtn.style.display = searchInput.value ? 'block' : 'none';
        }
        applyFilters();
      }, 300),
    );
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
      }
      clearSearchBtn.style.display = 'none';
      applyFilters();
    });
  }

  codedByRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      selectedRadioValue = radio.value.toLowerCase();
      applyFilters();
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage > 1) {
        displayPage(currentPage - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const totalPages = Math.ceil(filteredData.length / rowsPerPage);
      if (currentPage < totalPages) {
        displayPage(currentPage + 1);
      }
    });
  }

  // ---------- Input box events and text actions ----------
  if (inputTextElement) {
    inputTextElement.setAttribute('spellcheck', 'true');
    inputTextElement.spellcheck = true;
    inputTextElement.addEventListener('input', handleTextInputChange);
    inputTextElement.addEventListener('scroll', syncInputHighlightScroll);
  }
  if (divideButton) {
    divideButton.addEventListener('click', expandText);
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', resetText);
  }

  // Condition: text must exist. If it does not, show "No text to expand".
  // Otherwise, remove braces, add the denial-letter prefix when needed, and
  // select the first "reason" placeholder for manual editing.
  function expandText() {
    if (!inputTextElement) return;
    let originalText = inputTextElement.value;
    if (!originalText.trim()) {
      if (abbrevStatusElement) {
        abbrevStatusElement.classList.remove('hidden');
        abbrevStatusElement.classList.add('is-visible');
        abbrevStatusElement.innerHTML = `
          <div class="vp-abbrev-status-title" style="color: var(--danger-color, #ef4444);">No text to expand</div>
          <div class="vp-abbrev-status-text">Please enter or edit verbiage in the box first.</div>
        `;
      }
      return;
    }

    // Clean any curly braces {{}} from text
    originalText = originalText.replace(/\{\{reason\}\}/g, 'reason').replace(/[\{\}]/g, '');

    const templatePrefix =
      'We have reviewed the submitted information. After careful evaluation, it is determined that the claim was denied correctly due to reason. ';

    if (
      !originalText.startsWith(
        'We have reviewed the submitted information. After careful evaluation, it is determined that the claim was denied correctly due to ',
      )
    ) {
      inputTextElement.value = templatePrefix + originalText;
    } else {
      inputTextElement.value = originalText;
    }

    countCharacters();
    updateInputHighlights([]);

    const placeholder = 'reason';
    const pos = inputTextElement.value.indexOf(placeholder);
    if (pos !== -1) {
      inputTextElement.focus();
      inputTextElement.setSelectionRange(pos, pos + placeholder.length);
    }
  }

  function sanitizeOutputText(text) {
    if (typeof text !== 'string') {
      return { text: '', detectedIssues: [] };
    }

    let cleaned = normalizeWhitespace(text);
    cleaned = removeStandaloneEditWords(cleaned);
    cleaned = removePointerCodes(cleaned);
    cleaned = normalizeSafePunctuation(cleaned);
    cleaned = normalizeSentenceCapitalization(cleaned);
    cleaned = normalizeRepeatedAdjacentWords(cleaned);
    cleaned = normalizeWhitespace(cleaned).trim();

    return {
      text: cleaned,
      detectedIssues: detectUnsafeTextIssues(cleaned),
    };
  }

  // Reset condition: clear all input, status, selections, and character count.
  function resetText() {
    if (inputTextElement) inputTextElement.value = '';
    clearAbbreviationSelections();
    hideAbbreviationStatus();
    countCharacters();
    updateInputHighlights([]);
  }

  // Runs after typing, loading table verbiage, expanding, abbreviation
  // processing, and resetting the input box.
  function countCharacters() {
    if (charCountElement && inputTextElement) {
      charCountElement.innerText = 'Characters: ' + inputTextElement.value.length;
    }
  }

  // Runs whenever the user types: clear old abbreviation choices/status and
  // refresh the character count because the input text has changed.
  function handleTextInputChange() {
    clearAbbreviationSelections();
    hideAbbreviationStatus();
    countCharacters();
    updateInputHighlights([]);
  }

  // ---------- Apply Abbreviations action ----------
  // Condition: text must exist. Otherwise, show "No text to process".
  // When text exists, match terms from the local abbreviation library:
  // - First occurrence: expand to "Definition (TERM)".
  // - Repeated occurrence: wrap as "(TERM)".
  // - Multiple definitions: pause for manual meaning selection.
  // - No match/change: report that no abbreviation update is required.
  if (applyAbbrevButton) {
    applyAbbrevButton.addEventListener('click', applyAbbreviations);
  }

  if (abbrevStatusElement) {
    abbrevStatusElement.addEventListener('click', handleAbbreviationChoiceClick);
  }

  async function applyAbbreviations() {
    if (!inputTextElement) return;
    const originalText = inputTextElement.value;

    if (!originalText.trim()) {
      renderAbbreviationStatus({
        changed: false,
        expandedCount: 0,
        wrappedCount: 0,
        expandedTerms: [],
        wrappedTerms: new Map(),
        ambiguousTerms: [],
        title: 'No text to process',
        summary: 'Add letter text first, then apply abbreviations.',
      });
      return;
    }

    setAbbreviationProcessingState(true);

    try {
      const abbreviations = await loadAbbreviations();
      const result = processAbbreviationText(originalText, abbreviations);

      inputTextElement.value = result.text;
      countCharacters();
      updateInputHighlights(result.detectedIssues);
      renderAbbreviationStatus(result);
      showAbbreviationCompletionEffect();
    } catch (error) {
      console.error('Error applying abbreviations:', error);
      renderAbbreviationStatus({
        changed: false,
        expandedCount: 0,
        wrappedCount: 0,
        expandedTerms: [],
        wrappedTerms: new Map(),
        ambiguousTerms: [],
        title: 'Could not apply abbreviations',
        summary: 'The abbreviation list could not be loaded. Please try again.',
        isError: true,
      });
    } finally {
      setAbbreviationProcessingState(false);
    }
  }

  async function loadAbbreviations() {
    if (window.vpAbbreviations) {
      return window.vpAbbreviations;
    }
    return [];
  }

  function processAbbreviationText(text, abbreviations) {
    const result = {
      text,
      changed: false,
      expandedCount: 0,
      normalizedCount: 0,
      wrappedCount: 0,
      removedEditCount: 0,
      expandedTerms: [],
      wrappedTerms: new Map(),
      ambiguousTerms: [],
      detectedIssues: [],
    };

    abbreviations.forEach((abbrObj) => {
      const term = typeof abbrObj.Term === 'string' ? abbrObj.Term.trim() : '';
      const definitions = extractDefinitions(abbrObj);

      if (!term || definitions.length === 0) {
        return;
      }

      const resolvedDefinition = resolveDefinitionChoice(result.text, term, definitions);

      if (resolvedDefinition) {
        result.text = applyDefinitionRule(result.text, term, resolvedDefinition, result);
        return;
      }

      if (definitions.length > 1) {
        if (hasTermOccurrence(result.text, term)) {
          result.ambiguousTerms.push({ term, definitions });
        }
        return;
      }

      result.text = applyDefinitionRule(result.text, term, definitions[0], result);
    });

    result.removedEditCount = countStandaloneWordOccurrences(result.text, 'edit', 'edits');
    const normalizedOutput = sanitizeOutputText(result.text);
    result.text = normalizedOutput.text;
    result.detectedIssues = normalizedOutput.detectedIssues;

    if (result.removedEditCount > 0) {
      result.changed = true;
    }

    if (
      result.expandedCount > 0 ||
      result.wrappedCount > 0 ||
      result.normalizedCount > 0 ||
      result.removedEditCount > 0
    ) {
      result.title = 'Abbreviation updates ready';
      result.summary = buildResultSummary(result);
    } else if (result.detectedIssues.length > 0) {
      result.title = 'Review suggested';
      result.summary = buildResultSummary(result);
    } else if (result.ambiguousTerms.length > 0) {
      result.title = 'Manual review needed';
      result.summary = buildResultSummary(result);
    } else {
      result.title = 'No abbreviation changes';
      result.summary = 'Your text already follows the abbreviation format in the library.';
    }

    return result;
  }

  function applyDefinitionRule(text, term, definition, result) {
    const occurrenceRegex = buildOccurrenceRegex(term);
    const canonicalTerm = formatAbbreviationTerm(term);
    let firstOccurrenceHandled = false;

    return text.replace(occurrenceRegex, (match, prefix, wrappedTerm, rawTerm, offset, fullText) => {
      const matchedTerm = wrappedTerm || rawTerm;
      const displayTerm = formatMatchedAbbreviationTerm(matchedTerm, canonicalTerm);
      const occurrenceStart = offset + prefix.length;
      const alreadyWrapped = Boolean(wrappedTerm);

      if (hasExistingExpandedContext(fullText, occurrenceStart, canonicalTerm, definition)) {
        firstOccurrenceHandled = true;
        if (displayTerm !== matchedTerm) {
          result.changed = true;
          result.normalizedCount += 1;
        }
        return `${prefix}(${displayTerm})`;
      }

      if (!firstOccurrenceHandled) {
        firstOccurrenceHandled = true;
        result.changed = true;
        result.expandedCount += 1;
        result.expandedTerms.push({ term, definition });
        return `${prefix}${definition} (${canonicalTerm})`;
      }

      if (alreadyWrapped) {
        if (displayTerm !== matchedTerm) {
          result.changed = true;
          result.normalizedCount += 1;
        }
        return `${prefix}(${displayTerm})`;
      }

      result.changed = true;
      result.wrappedCount += 1;
      incrementTermCount(result.wrappedTerms, term);
      return `${prefix}(${displayTerm})`;
    });
  }

  function resolveDefinitionChoice(text, term, definitions) {
    const selectedDefinition = selectedAmbiguousDefinitions.get(term);

    if (selectedDefinition && definitions.includes(selectedDefinition)) {
      return selectedDefinition;
    }

    return findExistingExpandedDefinition(text, term, definitions);
  }

  function extractDefinitions(abbrObj) {
    return Object.keys(abbrObj)
      .filter((key) => /^Definition(?: \d+)?$/.test(key))
      .sort(compareDefinitionKeys)
      .map((key) => (typeof abbrObj[key] === 'string' ? abbrObj[key].trim() : ''))
      .filter(Boolean)
      .filter((value, index, array) => array.indexOf(value) === index);
  }

  function compareDefinitionKeys(firstKey, secondKey) {
    return getDefinitionRank(firstKey) - getDefinitionRank(secondKey);
  }

  function getDefinitionRank(key) {
    if (key === 'Definition') {
      return 1;
    }
    const numericPart = Number.parseInt(key.replace('Definition', '').trim(), 10);
    return Number.isNaN(numericPart) ? Number.MAX_SAFE_INTEGER : numericPart;
  }

  function hasTermOccurrence(text, term) {
    return buildOccurrenceRegex(term).test(text);
  }

  function findExistingExpandedDefinition(text, term, definitions) {
    const termPattern = buildFlexibleTermPattern(term);
    return (
      definitions.find((definition) => {
        const escapedDefinition = escapeRegExp(definition);
        const expandedRegex = new RegExp(`${escapedDefinition}\\s*\\(${termPattern}\\)`, 'i');
        return expandedRegex.test(text);
      }) || null
    );
  }

  function buildOccurrenceRegex(term) {
    const termPattern = buildFlexibleTermPattern(term);
    return new RegExp(`(^|[^A-Za-z0-9])(?:\\((${termPattern})\\)|(${termPattern}))(?=[^A-Za-z0-9]|$)`, 'gi');
  }

  function hasExistingExpandedContext(text, occurrenceStart, canonicalTerm, definition) {
    const beforeOccurrence = text.slice(0, occurrenceStart);
    const expandedPattern = new RegExp(
      `${escapeRegExp(definition)}\\s*\\(${buildFlexibleTermPattern(canonicalTerm)}\\)\\s*$`,
      'i',
    );

    if (expandedPattern.test(beforeOccurrence)) {
      return true;
    }

    const normalizedBeforeOccurrence = normalizeComparableText(beforeOccurrence);
    return normalizedBeforeOccurrence.endsWith(normalizeComparableText(definition));
  }

  function incrementTermCount(termMap, term) {
    termMap.set(term, (termMap.get(term) || 0) + 1);
  }

  function buildResultSummary(result) {
    const parts = [];
    if (result.expandedCount > 0) {
      parts.push(`${result.expandedCount} expanded`);
    }
    if (result.wrappedCount > 0) {
      parts.push(`${result.wrappedCount} repeat${result.wrappedCount === 1 ? '' : 's'} wrapped`);
    }
    if (result.normalizedCount > 0) {
      parts.push(`${result.normalizedCount} standardized`);
    }
    if (result.removedEditCount > 0) {
      parts.push(`${result.removedEditCount} edit word${result.removedEditCount === 1 ? '' : 's'} removed`);
    }
    if (result.ambiguousTerms.length > 0) {
      parts.push(`${result.ambiguousTerms.length} review required`);
    }
    if (result.detectedIssues.length > 0) {
      parts.push(`${result.detectedIssues.length} flagged`);
    }
    return parts.join(' | ');
  }

  function setAbbreviationProcessingState(isProcessing) {
    if (abbrevTextareaWrapElement) {
      abbrevTextareaWrapElement.classList.toggle('is-processing', isProcessing);
    }

    if (applyAbbrevButton) {
      applyAbbrevButton.disabled = isProcessing;
      applyAbbrevButton.textContent = isProcessing ? 'Processing...' : 'Process Text';
      applyAbbrevButton.classList.toggle('opacity-70', isProcessing);
      applyAbbrevButton.classList.toggle('cursor-not-allowed', isProcessing);
    }

    if (isProcessing && abbrevStatusElement) {
      abbrevStatusElement.classList.remove('hidden');
      abbrevStatusElement.classList.add('is-visible', 'is-animated');
      abbrevStatusElement.innerHTML = `
        <div class="vp-abbrev-status-title">Scanning abbreviations</div>
        <div class="vp-abbrev-status-text">Checking text against abbreviation library...</div>
      `;
    }
  }

  function showAbbreviationCompletionEffect() {
    if (!abbrevTextareaWrapElement) return;
    abbrevTextareaWrapElement.classList.remove('is-complete');
    void abbrevTextareaWrapElement.offsetWidth;
    abbrevTextareaWrapElement.classList.add('is-complete');

    window.setTimeout(() => {
      abbrevTextareaWrapElement.classList.remove('is-complete');
    }, 900);
  }

  function renderAbbreviationStatus(result) {
    if (!abbrevStatusElement) return;

    const chipMarkup = buildStatusChips(result);
    const detailMarkup = buildAmbiguousDetailMarkup(result.ambiguousTerms);
    const choiceMarkup = buildAmbiguousChoiceMarkup(result.ambiguousTerms);
    const issueMarkup = buildDetectedIssueMarkup(result.detectedIssues);

    abbrevStatusElement.innerHTML = `
      <div class="vp-abbrev-status-title">${escapeHtml(result.title)}</div>
      <div class="vp-abbrev-status-text">${escapeHtml(result.summary)}</div>
      ${chipMarkup ? `<div class="vp-abbrev-status-groups">${chipMarkup}</div>` : ''}
      ${choiceMarkup}
      ${detailMarkup}
      ${issueMarkup}
    `;

    abbrevStatusElement.classList.remove('hidden', 'is-animated');
    abbrevStatusElement.classList.add('is-visible');
    void abbrevStatusElement.offsetWidth;
    abbrevStatusElement.classList.add('is-animated');

    window.setTimeout(() => {
      abbrevStatusElement.classList.remove('is-animated');
    }, 1000);
  }

  function buildStatusChips(result) {
    const chips = [];
    if (result.expandedTerms.length > 0) {
      const expandedLabels = result.expandedTerms.map(({ term }) => term).join(', ');
      chips.push(
        `<span class="vp-abbrev-chip vp-abbrev-chip--expanded">Expanded: ${escapeHtml(expandedLabels)}</span>`,
      );
    }
    if (result.wrappedTerms.size > 0) {
      const wrappedLabels = Array.from(result.wrappedTerms.entries())
        .map(([term, count]) => (count > 1 ? `${term} x${count}` : term))
        .join(', ');
      chips.push(`<span class="vp-abbrev-chip vp-abbrev-chip--wrapped">Wrapped: ${escapeHtml(wrappedLabels)}</span>`);
    }
    if (result.ambiguousTerms.length > 0) {
      const ambiguousLabels = result.ambiguousTerms.map(({ term }) => term).join(', ');
      chips.push(
        `<span class="vp-abbrev-chip vp-abbrev-chip--ambiguous">Review: ${escapeHtml(ambiguousLabels)}</span>`,
      );
    }
    if (result.detectedIssues.length > 0) {
      chips.push(
        `<span class="vp-abbrev-chip vp-abbrev-chip--warning">Flagged: ${escapeHtml(
          result.detectedIssues.map(({ token }) => token).join(', '),
        )}</span>`,
      );
    }
    if (chips.length === 0) {
      chips.push('<span class="vp-abbrev-chip vp-abbrev-chip--neutral">No changes needed</span>');
    }
    return chips.join('');
  }

  function buildAmbiguousDetailMarkup(ambiguousTerms) {
    if (!ambiguousTerms.length) return '';
    const details = ambiguousTerms.map(({ term, definitions }) => `${term}: ${definitions.join(' / ')}`).join(' ; ');
    return `<div class="vp-abbrev-status-text" style="margin-top: 0.5rem; font-style: italic;">Needs Review: ${escapeHtml(details)}</div>`;
  }

  function buildAmbiguousChoiceMarkup(ambiguousTerms) {
    if (!ambiguousTerms.length) return '';
    const groups = ambiguousTerms
      .map(({ term, definitions }) => {
        const buttons = definitions
          .map(
            (definition) => `
              <button
                type="button"
                class="vp-abbrev-choice-btn"
                data-abbrev-term="${escapeHtml(term)}"
                data-abbrev-definition="${escapeHtml(definition)}"
              >
                ${escapeHtml(definition)}
              </button>
            `,
          )
          .join('');

        return `
          <div class="vp-abbrev-choice-group">
            <div class="vp-abbrev-choice-label">Choose meaning for ${escapeHtml(term)}:</div>
            <div class="vp-abbrev-choice-buttons">${buttons}</div>
          </div>
        `;
      })
      .join('');

    return `<div class="vp-abbrev-choice-area">${groups}</div>`;
  }

  function buildDetectedIssueMarkup(detectedIssues) {
    if (!detectedIssues.length) return '';

    const issues = detectedIssues
      .map(
        ({ token, message }) => `
          <div class="vp-abbrev-issue-item">
            <span class="vp-abbrev-issue-token">${escapeHtml(token)}</span>
            <span>${escapeHtml(message)}</span>
          </div>
        `,
      )
      .join('');

    return `
      <div class="vp-abbrev-issue-area">
        <div class="vp-abbrev-choice-label">Flagged for review:</div>
        <div class="vp-abbrev-issue-list">${issues}</div>
      </div>
    `;
  }

  function updateInputHighlights(detectedIssues) {
    if (!inputHighlightLayerElement || !inputTextElement) return;

    const tokensToHighlight = Array.from(
      new Set(
        (detectedIssues || [])
          .map(({ token }) => token?.trim())
          .filter(Boolean)
          .sort((first, second) => second.length - first.length),
      ),
    );

    if (!inputTextElement.value) {
      inputHighlightLayerElement.innerHTML = '';
      syncInputHighlightScroll();
      return;
    }

    inputHighlightLayerElement.innerHTML = buildHighlightedTextMarkup(inputTextElement.value, tokensToHighlight);
    syncInputHighlightScroll();
  }

  function buildHighlightedTextMarkup(text, tokensToHighlight) {
    const highlightedRanges = [];

    tokensToHighlight.forEach((token) => {
      let searchIndex = 0;

      while (searchIndex < text.length) {
        const matchIndex = text.indexOf(token, searchIndex);
        if (matchIndex === -1) break;

        highlightedRanges.push({ start: matchIndex, end: matchIndex + token.length });
        searchIndex = matchIndex + Math.max(token.length, 1);
      }
    });

    const mergedRanges = mergeHighlightRanges(highlightedRanges);
    let highlightedMarkup = '';
    let currentIndex = 0;

    mergedRanges.forEach(({ start, end }) => {
      highlightedMarkup += escapeHtml(text.slice(currentIndex, start));
      highlightedMarkup += `<mark>${escapeHtml(text.slice(start, end))}</mark>`;
      currentIndex = end;
    });

    highlightedMarkup += escapeHtml(text.slice(currentIndex));
    return `${highlightedMarkup}\n`;
  }

  function mergeHighlightRanges(ranges) {
    if (!ranges.length) return [];

    const sortedRanges = ranges
      .map((range) => ({ ...range }))
      .sort((first, second) => first.start - second.start || first.end - second.end);
    const mergedRanges = [sortedRanges[0]];

    for (let i = 1; i < sortedRanges.length; i += 1) {
      const previousRange = mergedRanges[mergedRanges.length - 1];
      const currentRange = sortedRanges[i];

      if (currentRange.start <= previousRange.end) {
        previousRange.end = Math.max(previousRange.end, currentRange.end);
      } else {
        mergedRanges.push(currentRange);
      }
    }

    return mergedRanges;
  }

  function syncInputHighlightScroll() {
    if (!inputHighlightLayerElement || !inputTextElement) return;
    inputHighlightLayerElement.scrollTop = inputTextElement.scrollTop;
    inputHighlightLayerElement.scrollLeft = inputTextElement.scrollLeft;
  }

  async function handleAbbreviationChoiceClick(event) {
    const choiceButton = event.target.closest('[data-abbrev-term][data-abbrev-definition]');
    if (!choiceButton || !inputTextElement) return;

    const { abbrevTerm, abbrevDefinition } = choiceButton.dataset;
    if (!abbrevTerm || !abbrevDefinition) return;

    selectedAmbiguousDefinitions.set(abbrevTerm, abbrevDefinition);
    setAbbreviationProcessingState(true);

    try {
      const abbreviations = await loadAbbreviations();
      const result = processAbbreviationText(inputTextElement.value, abbreviations);

      inputTextElement.value = result.text;
      countCharacters();
      updateInputHighlights(result.detectedIssues);
      renderAbbreviationStatus(result);
      showAbbreviationCompletionEffect();
    } catch (error) {
      console.error('Error applying selected abbreviation definition:', error);
    } finally {
      setAbbreviationProcessingState(false);
    }
  }

  function clearAbbreviationSelections() {
    selectedAmbiguousDefinitions.clear();
  }

  function hideAbbreviationStatus() {
    if (!abbrevStatusElement) return;
    abbrevStatusElement.classList.remove('is-visible', 'is-animated');
    abbrevStatusElement.classList.add('hidden');
    abbrevStatusElement.innerHTML = '';
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function formatAbbreviationTerm(term) {
    return term.trim().toUpperCase();
  }

  function formatMatchedAbbreviationTerm(matchedTerm, canonicalTerm) {
    const normalizedMatchedTerm = matchedTerm.trim().toUpperCase();
    if (canonicalTerm === 'E/M' && normalizedMatchedTerm === 'EM') {
      return 'E&M';
    }
    const matchedHasSeparator = /[\/&-]/.test(normalizedMatchedTerm);
    const canonicalHasSeparator = /[\/&-]/.test(canonicalTerm);

    if (!matchedHasSeparator && canonicalHasSeparator) {
      return normalizedMatchedTerm;
    }

    return canonicalTerm;
  }

  function buildFlexibleTermPattern(term) {
    const trimmedTerm = term.trim();
    if (!trimmedTerm) return '';
    if (!/[\/&-]/.test(trimmedTerm)) {
      return escapeRegExp(trimmedTerm);
    }
    const compactTerm = trimmedTerm.replace(/[^A-Za-z0-9]/g, '');
    if (compactTerm.length < 2) {
      return escapeRegExp(trimmedTerm);
    }
    return compactTerm
      .split('')
      .map((character) => escapeRegExp(character))
      .join('(?:\\s*(?:[\\/&-])\\s*)?');
  }

  function normalizeComparableText(value) {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function normalizeWhitespace(text) {
    return text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/[ \u00A0]+/g, ' ')
      .replace(/\n[ \t]+/g, '\n')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ {2,}/g, ' ');
  }

  function removeStandaloneEditWords(text) {
    return text.replace(/\bedits?\b/gi, ' ');
  }

  function removePointerCodes(text) {
    return text.replace(new RegExp(`\\b(?:${removedPointerCodes.map(escapeRegExp).join('|')})\\b`, 'gi'), ' ');
  }

  function normalizeSafePunctuation(text) {
    return text
      .replace(/,\s*,+/g, ',')
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/([,;:!?])(?=\S)/g, '$1 ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .replace(/\[\s+/g, '[')
      .replace(/\s+\]/g, ']')
      .replace(/\{\s+/g, '{')
      .replace(/\s+\}/g, '}')
      .replace(/([?!;,])\1{1,}/g, '$1')
      .replace(/([A-Za-z])-{2,}(?=$|\s|[",.;:!?)\]])/g, '$1')
      .replace(/\.{2,}(?=\s+[A-Za-z])/g, '.')
      .replace(/([A-Za-z0-9])\s*\.\s+([A-Za-z])/g, (match, before, after) => `${before}. ${after.toUpperCase()}`);
  }

  function normalizeSentenceCapitalization(text) {
    return text.replace(/([.!?]\s+)([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
  }

  function normalizeRepeatedAdjacentWords(text) {
    // Pass 1: remove repeated adjacent multi-word phrases (2–6 words).
    // e.g. "Evaluation and Management Evaluation and Management Code" → "Evaluation and Management Code"
    const words = text.split(/(\s+)/); // preserves whitespace tokens between words
    const wordTokens = words.filter((_, i) => i % 2 === 0); // every other element is a word
    const spaceTokens = words.filter((_, i) => i % 2 !== 0); // whitespace separators

    let changed = true;
    while (changed) {
      changed = false;
      for (let phraseLen = 6; phraseLen >= 2; phraseLen--) {
        for (let i = 0; i <= wordTokens.length - phraseLen * 2; i++) {
          const phraseA = wordTokens.slice(i, i + phraseLen).join(' ');
          const phraseB = wordTokens.slice(i + phraseLen, i + phraseLen * 2).join(' ');
          if (phraseA.toLowerCase() === phraseB.toLowerCase()) {
            // Remove the duplicate phrase (second occurrence) and its leading whitespace
            wordTokens.splice(i + phraseLen, phraseLen);
            spaceTokens.splice(i + phraseLen - 1, phraseLen);
            changed = true;
            break;
          }
        }
        if (changed) break;
      }
    }

    // Reassemble the text from word and space tokens
    let reassembled = '';
    for (let i = 0; i < wordTokens.length; i++) {
      reassembled += wordTokens[i];
      if (i < spaceTokens.length) reassembled += spaceTokens[i];
    }

    // Pass 2: single-word adjacent duplicate cleanup (e.g. "the the" → "the")
    return reassembled.replace(/\b([A-Za-z][A-Za-z'/.-]*)\s+\1\b/gi, '$1');
  }

  function detectUnsafeTextIssues(text) {
    const detectedIssues = [];
    const seenIssues = new Set();
    const issuePatterns = [
      { pattern: /"{2,}/g, message: 'Repeated quotation marks need review.' },
      { pattern: /'{3,}/g, message: 'Repeated apostrophes need review.' },
      { pattern: /-{2,}/g, message: 'Repeated hyphen sequence needs review.' },
      { pattern: /\/{2,}/g, message: 'Repeated slash sequence needs review.' },
      { pattern: /\\{2,}/g, message: 'Repeated backslash sequence needs review.' },
      { pattern: /\.{3,}/g, message: 'Repeated period sequence needs review.' },
      { pattern: /;{2,}/g, message: 'Repeated semicolons need review.' },
      { pattern: /:{2,}/g, message: 'Repeated colons need review.' },
      { pattern: /\({2,}/g, message: 'Repeated opening parentheses need review.' },
      { pattern: /\){2,}/g, message: 'Repeated closing parentheses need review.' },
      { pattern: /\[{2,}/g, message: 'Repeated opening brackets need review.' },
      { pattern: /\]{2,}/g, message: 'Repeated closing brackets need review.' },
      { pattern: /\{{2,}/g, message: 'Repeated opening braces need review.' },
      { pattern: /\}{2,}/g, message: 'Repeated closing braces need review.' },
      { pattern: /[^\w\s]{3,}/g, message: 'Irregular symbol sequence needs review.' },
    ];

    issuePatterns.slice(0, -1).forEach(({ pattern, message }) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (isPartOfMixedSymbolSequence(text, match.index, match[0].length)) {
          continue;
        }
        addDetectedIssue(detectedIssues, seenIssues, match[0], message);
      }
    });

    const irregularSymbolPattern = issuePatterns[issuePatterns.length - 1];
    let irregularMatch;
    while ((irregularMatch = irregularSymbolPattern.pattern.exec(text)) !== null) {
      const token = irregularMatch[0];
      const isUniformKnownSequence =
        new Set(token).size === 1 &&
        issuePatterns.slice(0, -1).some(({ pattern }) => pattern.source.includes(token[0]));

      if (!isUniformKnownSequence) {
        addDetectedIssue(detectedIssues, seenIssues, token, irregularSymbolPattern.message);
      }
    }

    detectJoinedWordIssues(text, detectedIssues, seenIssues);

    return detectedIssues;
  }

  function isPartOfMixedSymbolSequence(text, start, length) {
    const previousCharacter = text[start - 1] || '';
    const nextCharacter = text[start + length] || '';
    const isSymbol = (character) => Boolean(character) && /[^\w\s]/.test(character);

    return isSymbol(previousCharacter) || isSymbol(nextCharacter);
  }

  function detectJoinedWordIssues(text, detectedIssues, seenIssues) {
    const candidates = text.match(/\b[a-z]{6,}\b/g) || [];
    const commonWords = [
      'the',
      'and',
      'for',
      'with',
      'from',
      'that',
      'this',
      'claim',
      'code',
      'review',
      'provider',
      'submitted',
    ];

    candidates.forEach((candidate) => {
      const joinedWordSuggestion = findJoinedWordSuggestion(candidate, commonWords);
      if (!joinedWordSuggestion) return;
      addDetectedIssue(detectedIssues, seenIssues, candidate, `Possible missing space: ${joinedWordSuggestion}`);
    });
  }

  function findJoinedWordSuggestion(word, commonWords) {
    const lowerWord = word.toLowerCase();
    for (const prefix of commonWords) {
      if (!lowerWord.startsWith(prefix) || lowerWord === prefix) continue;
      const suffix = lowerWord.slice(prefix.length);
      if (commonWords.includes(suffix) || suffix === 'the') {
        return `${prefix} ${suffix}`;
      }
    }
    return null;
  }

  function addDetectedIssue(detectedIssues, seenIssues, token, message) {
    const key = `${token}|${message}`;
    if (seenIssues.has(key)) return;
    seenIssues.add(key);
    detectedIssues.push({ token, message });
  }

  function countStandaloneWordOccurrences(text, ...words) {
    const uniqueWords = [...new Set(words.filter(Boolean).map((word) => word.trim().toLowerCase()))];

    return uniqueWords.reduce((total, word) => {
      const matches = text.match(new RegExp(`\\b${escapeRegExp(word)}\\b`, 'gi'));
      return total + (matches ? matches.length : 0);
    }, 0);
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // --- Load Initial Data ---
  if (window.vpData) {
    allData = window.vpData;
    filteredData = allData;
    renderTabs(allData);
    displayPage(1);
  } else {
    console.warn('Verbiage Pro data is unavailable locally.');
  }
})();
