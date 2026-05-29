/*=============== SLA LOOKUP MODULE ===============*/

/**
 * SLA Lookup Feature (Simplified)
 * - Fetches SLA data from JSON
 * - Populates state dropdown dynamically
 * - Shows ALL results (PAR + Non-PAR, Professional + Facility) at once
 * - No conditional filters needed
 */

(function() {
    'use strict';

    // DOM Elements
    const slaLoading = document.getElementById('slaLoading');
    const slaError = document.getElementById('slaError');
    const slaFilters = document.getElementById('slaFilters');
    const slaResults = document.getElementById('slaResults');
    const slaEmpty = document.getElementById('slaEmpty');
    const slaStateSelect = document.getElementById('slaState');

    // Category inputs (radio buttons)
    let categoryInputs = [];

    // Cached SLA Data
    let slaData = null;

    // =============== INITIALIZATION ===============
    async function init() {
        if (!slaLoading) return; // Not on SLA page

        try {
            await fetchSLAData();
            setupEventListeners();
            showFilters();
        } catch (error) {
            console.error('SLA Lookup Init Error:', error);
            showError();
        }
    }

    // =============== DATA FETCH ===============
    async function fetchSLAData() {
        if (window.newSLAData) {
            slaData = window.newSLAData;
        } else {
            const response = await fetch('assets/data/newSLA.json');
            if (!response.ok) {
                throw new Error('Failed to fetch SLA data');
            }
            slaData = await response.json();
        }
        populateStateDropdown();
    }

    // =============== STATE DROPDOWN ===============
    function populateStateDropdown() {
        if (!slaData || !slaData.states) return;

        const states = Object.keys(slaData.states).sort();
        
        // Clear existing options (except default)
        slaStateSelect.innerHTML = '<option value="">-- Select State --</option>';
        
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            slaStateSelect.appendChild(option);
        });
    }

    // =============== EVENT LISTENERS ===============
    function setupEventListeners() {
        // State change
        slaStateSelect.addEventListener('change', handleFilterChange);

        // Category radios
        categoryInputs = document.querySelectorAll('input[name="slaCategory"]');
        categoryInputs.forEach(input => {
            input.addEventListener('change', handleFilterChange);
        });
    }

    // =============== FILTER CHANGE HANDLER ===============
    function handleFilterChange() {
        const state = slaStateSelect.value;
        const category = getSelectedRadio(categoryInputs);

        // Validate required filters
        if (!state || !category) {
            showEmpty();
            return;
        }

        const stateData = slaData?.states?.[state];
        if (!stateData) {
            renderNotApplicable('State data not found');
            return;
        }

        // Get notes from state level (new structure)
        const stateNotes = stateData.notes || null;

        if (category === 'iqt') {
            const categoryData = stateData.iqt;
            if (!categoryData) {
                renderNotApplicable('IQT data not available for ' + state);
                return;
            }
            renderIQTResults(categoryData, state, stateNotes);
        } else if (category === 'claim') {
            const categoryData = stateData.claim;
            if (!categoryData) {
                renderNotApplicable('Claim data not available for ' + state);
                return;
            }
            renderClaimResults(categoryData, 'Claim', stateNotes);
        } else if (category === 'correctedClaim') {
            const categoryData = stateData.correctedClaim;
            if (!categoryData) {
                renderNotApplicable('Corrected Claim data not available for ' + state);
                return;
            }
            renderClaimResults(categoryData, 'Corrected Claim', stateNotes);
        }
    }

    // =============== RENDER IQT RESULTS ===============
    function renderIQTResults(iqtData, state, stateNotes) {
        clearResults();
        slaResults.classList.remove('hidden');
        slaEmpty.classList.add('hidden');

        const levels = iqtData.levels;
        if (!levels) {
            renderNotApplicable('IQT levels not available');
            return;
        }

        // Get sorted level keys (level1, level2, level3, etc.)
        const levelKeys = Object.keys(levels).sort((a, b) => {
            const numA = parseInt(a.replace('level', '')) || 0;
            const numB = parseInt(b.replace('level', '')) || 0;
            return numA - numB;
        });

        levelKeys.forEach(levelKey => {
            const level = levels[levelKey];
            const levelName = level.name || levelKey;
            const levelNumber = levelKey.replace('level', '');
            const appliesTo = level.appliesTo || 'all';

            // Check if level has provider-specific timelines or single timeline
            if (level.timelines) {
                // Has separate Professional and Facility timelines
                if (level.timelines.professional) {
                    slaResults.appendChild(createIQTCard(levelNumber, levelName, 'Professional', level.timelines.professional));
                }
                if (level.timelines.facility) {
                    slaResults.appendChild(createIQTCard(levelNumber, levelName, 'Facility', level.timelines.facility));
                }
            } else if (level.timeline) {
                // Single timeline (applies to all)
                slaResults.appendChild(createIQTCard(levelNumber, levelName, 'All Providers', level.timeline));
            }
        });

        // Add notes if present
        if (stateNotes) {
            slaResults.appendChild(createNotesCard(stateNotes));
        }
    }

    function createIQTCard(levelNumber, levelName, provider, timeline) {
        const card = document.createElement('div');
        const isNA = !timeline || timeline === 'N/A';
        card.className = `sla-card ${isNA ? 'sla-card--na' : ''}`;
        
        card.innerHTML = `
            <div class="sla-card__header">
                <span class="sla-card__category">IQT Level ${levelNumber}</span>
                <span class="sla-card__provider">${provider}</span>
            </div>
            <div class="sla-card__body">
                <p class="sla-card__label">${levelName}</p>
                <p class="sla-card__timeline">${timeline || 'Not Applicable'}</p>
            </div>
        `;
        
        return card;
    }

    // =============== RENDER CLAIM/CORRECTED CLAIM RESULTS ===============
    function renderClaimResults(categoryData, categoryLabel, stateNotes) {
        clearResults();
        slaResults.classList.remove('hidden');
        slaEmpty.classList.add('hidden');

        // Render PAR section
        if (categoryData.par) {
            slaResults.appendChild(createClaimCard(categoryLabel, 'PAR', 'Professional', categoryData.par.professional));
            slaResults.appendChild(createClaimCard(categoryLabel, 'PAR', 'Facility', categoryData.par.facility));
        }

        // Render Non-PAR section
        if (categoryData.nonPar) {
            slaResults.appendChild(createClaimCard(categoryLabel, 'Non-PAR', 'Professional', categoryData.nonPar.professional));
            slaResults.appendChild(createClaimCard(categoryLabel, 'Non-PAR', 'Facility', categoryData.nonPar.facility));
        }

        // Add notes if present
        if (stateNotes) {
            slaResults.appendChild(createNotesCard(stateNotes));
        }
    }

    function createClaimCard(category, participation, provider, timeline) {
        const card = document.createElement('div');
        const isNA = !timeline || timeline === 'N/A';
        card.className = `sla-card ${isNA ? 'sla-card--na' : ''}`;

        // Add dynamic classes for UI differentiation
        const partClass = participation === 'PAR' ? 'provider-par' : 'provider-nonpar';
        const provClass = provider === 'Professional' ? 'type-pro' : 'type-fac';

        card.innerHTML = `
            <div class="sla-card__header">
                <span class="sla-card__category">${category}</span>
                <span class="sla-card__provider ${partClass} ${provClass}">
                    <span class="provider-badge">${participation}</span> • <span class="type-badge">${provider}</span>
                </span>
            </div>
            <div class="sla-card__body">
                <p class="sla-card__label">Timely Filing Deadline</p>
                <p class="sla-card__timeline">${timeline || 'Not Applicable'}</p>
            </div>
        `;

        return card;
    }

    function createNotesCard(notes) {
        const card = document.createElement('div');
        card.className = 'sla-card sla-card--notes';
        card.innerHTML = `
            <div class="sla-card__footer" style="border-top: none; padding-top: 0;">
                <p class="sla-card__notes">📝 Note: ${notes}</p>
            </div>
        `;
        return card;
    }

    // =============== RENDER NOT APPLICABLE ===============
    function renderNotApplicable(message) {
        clearResults();
        slaResults.classList.remove('hidden');
        slaEmpty.classList.add('hidden');

        const card = document.createElement('div');
        card.className = 'sla-card sla-card--na';
        card.innerHTML = `
            <div class="sla-card__body" style="text-align: center;">
                <p class="sla-card__timeline">Not Applicable</p>
                <p class="sla-card__label">${message}</p>
            </div>
        `;
        slaResults.appendChild(card);
    }

    // =============== UI STATE HELPERS ===============
    function showFilters() {
        slaLoading.classList.add('hidden');
        slaError.classList.add('hidden');
        slaFilters.classList.remove('hidden');
        showEmpty();
    }

    function showError() {
        slaLoading.classList.add('hidden');
        slaError.classList.remove('hidden');
        slaFilters.classList.add('hidden');
        slaResults.classList.add('hidden');
        slaEmpty.classList.add('hidden');
    }

    function showEmpty() {
        slaResults.classList.add('hidden');
        slaEmpty.classList.remove('hidden');
    }

    function clearResults() {
        slaResults.innerHTML = '';
    }

    // =============== UTILITY HELPERS ===============
    function getSelectedRadio(inputs) {
        for (const input of inputs) {
            if (input.checked) return input.value;
        }
        return null;
    }

    // =============== RUN ON DOM READY ===============
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
