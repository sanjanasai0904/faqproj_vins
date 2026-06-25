// theme.js - Persistent Multi-Page Layout Synchronization Script

document.addEventListener("DOMContentLoaded", () => {
    // 1. Establish state parameters using system hardware definitions or cache
    const cachedPreference = localStorage.getItem("vins-theme");
    const hardwareDarkIntent = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Fall back safely to default dark palette system setting
    let activeTheme = "dark";
    if (cachedPreference) {
        activeTheme = cachedPreference;
    } else if (!hardwareDarkIntent) {
        activeTheme = "light";
    }
    
    // 2. Commit layout parameters to core application DOM nodes immediately
    document.documentElement.setAttribute("data-theme", activeTheme);
    renderButtonUIState(activeTheme);

    // 3. Monitor active triggers on operational interactive buttons
    const structuralToggleNode = document.getElementById("themeToggleBtn");
    if (structuralToggleNode) {
        structuralToggleNode.addEventListener("click", () => {
            const runtimeState = document.documentElement.getAttribute("data-theme");
            const structuralInversion = runtimeState === "dark" ? "light" : "dark";
            
            document.documentElement.setAttribute("data-theme", structuralInversion);
            localStorage.setItem("vins-theme", structuralInversion);
            renderButtonUIState(structuralInversion);
        });
    }
});

// Render descriptive label iconography updates dynamically
function renderButtonUIState(targetTheme) {
    const componentNode = document.getElementById("themeToggleBtn");
    if (!componentNode) return;
    
    if (targetTheme === "dark") {
        componentNode.innerHTML = `☀️ <span class="theme-text">Light Mode</span>`;
    } else {
        componentNode.innerHTML = `🌙 <span class="theme-text">Dark Mode</span>`;
    }
}