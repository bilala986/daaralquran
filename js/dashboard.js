// dashboard.js

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".hover-card");
    if (!cards.length) return;

    cards.forEach(card => {
        card.addEventListener("mouseenter", () => card.classList.add("shadow-lg"));
        card.addEventListener("mouseleave", () => card.classList.remove("shadow-lg"));
    });
});
