/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
/*=============== TABBED NAVIGATION LOGIC ===============*/
const navLinks = document.querySelectorAll('.nav__link');
const sections = document.querySelectorAll('.section');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default anchor jump

    // 1. Get the target section ID from the href
    const targetId = link.getAttribute('href').substring(1); // removing '#'
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      // 2. Remove active class from all links
      navLinks.forEach(l => l.classList.remove('active-link'));
      // 3. Add active class to clicked link
      link.classList.add('active-link');

      // 4. Hide all sections
      sections.forEach(s => s.classList.remove('active-section'));
      // 5. Show target section
      targetSection.classList.add('active-section');
      
      // Optional: Scroll to top of page when switching tabs
      window.scrollTo(0, 0);
    }
  });
});

/*=============== SCROLL SECTIONS ACTIVE LINK (REMOVED) ===============*/
/* No longer needed for tabbed interface */

/*=============== DATE GAP CALCULATION ===============*/
const calcBtn = document.getElementById('calcBtn');
const resetBtn = document.getElementById('resetBtn');
const resultText = document.getElementById('result');

if(calcBtn) {
  calcBtn.addEventListener('click', () => {
    const fromDate = new Date(document.getElementById('from').value);
    const toDate = new Date(document.getElementById('to').value);

    if (isNaN(fromDate) || isNaN(toDate)) {
      resultText.style.color = 'var(--first-color)'; // Use theme color for alerts
      resultText.innerText = 'Please select valid dates.';
      return;
    }

    // Calculate diff in milliseconds
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    resultText.style.color = 'var(--title-color)';
    resultText.innerText = `${diffDays} Days`;
  });
}

if(resetBtn) {
  resetBtn.addEventListener('click', () => {
    document.getElementById('from').value = '';
    document.getElementById('to').value = '';
    resultText.innerText = '';
  });
}
/*=============== CHANGE BACKGROUND HEADER ===============*/
function scrollHeader() {
  const header = document.getElementById('header');
  // When the scroll is greater than 80 viewport height, add the scroll-header class to the header tag
  if (this.scrollY >= 80) header.classList.add('scroll-header');
  else header.classList.remove('scroll-header');
}
window.addEventListener('scroll', scrollHeader);
