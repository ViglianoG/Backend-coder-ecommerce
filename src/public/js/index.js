const body = document.querySelector("body");
const toggle = document.querySelector("#toggle");
const sunIcon = document.querySelector(".toggle .bxs-sun");
const moonIcon = document.querySelector(".toggle .bx-moon");
const loginContainer = document.querySelector(".login-container");

toggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  sunIcon.className =
    sunIcon.className == "bx bxs-sun" ? "bx bx-sun" : "bx bxs-sun";
  moonIcon.className =
    moonIcon.className == "bx bx-moon" ? "bx bxs-moon" : "bx bx-moon";

  document.body.classList.contains("dark")
    ? localStorage.setItem("dark-mode", "true")
    : localStorage.setItem("dark-mode", "false");
});

if (localStorage.getItem("dark-mode") === "true") {
  body.classList.toggle("dark");
  loginContainer.classList.toggle("dark");
} else {
  body.classList.remove("dark");
}

const toTop = document.querySelector(".go-top-container");
const toTopButton = document.querySelector(".go-top-button");
window.addEventListener("scroll", () => {
  if (window.scrollY > 150) {
    toTop.classList.add("show");
  } else {
    toTop.classList.remove("show");
  }
});

toTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
