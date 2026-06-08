// Dummy search suggestions
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions');

const dummySuggestions = [
  "google search clone",
  "javascript tutorial",
  "weather in Lagos",
  "football results today",
  "latest forex rates",
  "ICT smart money concepts",
  "meta trader 5 EA",
  "boom and crash strategy",
  "python learning",
  "agriculture business ideas"
];

searchInput.addEventListener('focus', showSuggestions);
searchInput.addEventListener('input', showSuggestions);
searchInput.addEventListener('blur', () => {
  setTimeout(() => suggestionsBox.style.display = 'none', 200);
});

function showSuggestions() {
  const value = searchInput.value.toLowerCase();
  const filtered = dummySuggestions.filter(s => s.toLowerCase().includes(value));
  suggestionsBox.innerHTML = filtered.map(s => <li>${s}</li>).join('');
  suggestionsBox.style.display = filtered.length ? 'block' : 'none';
}

suggestionsBox.addEventListener('click', e => {
  if (e.target.tagName === 'LI') {
    searchInput.value = e.target.textContent;
    suggestionsBox.style.display = 'none';
  }
});

// App Drawer toggle
const appsBtn = document.getElementById('apps-btn');
const appDrawer = document.getElementById('app-drawer');

appsBtn.addEventListener('click', e => {
  e.stopPropagation();
  appDrawer.classList.toggle('active');
});

// Profile dropdown
const profileBtn = document.getElementById('profile-btn');
const profileDropdown = document.getElementById('profile-dropdown');

profileBtn.addEventListener('click', e => {
  e.stopPropagation();
  profileDropdown.classList.toggle('active');
});

// Close both menus when clicking outside
document.addEventListener('click', e => {
  if (!appDrawer.contains(e.target) && e.target !== appsBtn) {
    appDrawer.classList.remove('active');
  }
  if (!profileDropdown.contains(e.target) && e.target !== profileBtn && !profileBtn.contains(e.target)) {
    profileDropdown.classList.remove('active');
  }
});