/*=============== DARK LIGHT THEME ===============*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'theme-icon-sun' 
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


const selectedTheme = localStorage.getItem('selected-theme')

if (selectedTheme) {

  document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
  if(selectedTheme === 'dark') {
      moonIcon.style.display = 'none'
      sunIcon.style.display = 'block'
  } else {
      moonIcon.style.display = 'block'
      sunIcon.style.display = 'none'
  }
}


themeButton.addEventListener('click', () => {

    if(document.body.classList.contains(darkTheme)) {
        enableLightMode()
    } else {
        enableDarkMode()
    }
})
