/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'theme-icon-sun' // The icon class we want to ADD when in dark mode (effectively toggling which is shown)
// Note: We are now manually handling SVG display, so the logic needs to adapt to toggle specific elements or classes.

// Improved Logic for SVG Toggling
const moonIcon = document.querySelector('.theme-icon-moon')
const sunIcon = document.querySelector('.theme-icon-sun')

const enableDarkMode = () => {
    document.body.classList.add(darkTheme)
    moonIcon.style.display = 'none'
    sunIcon.style.display = 'block'
    localStorage.setItem('selected-theme', 'dark')
}

const enableLightMode = () => {
    document.body.classList.remove(darkTheme)
    moonIcon.style.display = 'block'
    sunIcon.style.display = 'none'
    localStorage.setItem('selected-theme', 'light')
}

// Previously selected topic (if user selected)
const selectedTheme = localStorage.getItem('selected-theme')

// Validate if the user previously chose a topic
if (selectedTheme) {
  // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  if(selectedTheme === 'dark') {
      moonIcon.style.display = 'none'
      sunIcon.style.display = 'block'
  } else {
      moonIcon.style.display = 'block'
      sunIcon.style.display = 'none'
  }
}

// Activate / deactivate the theme manually with the button
themeButton.addEventListener('click', () => {
    // Add or remove the dark / icon theme
    if(document.body.classList.contains(darkTheme)) {
        enableLightMode()
    } else {
        enableDarkMode()
    }
})
