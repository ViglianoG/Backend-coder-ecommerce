const body = document.querySelector("body");
const toggle = document.querySelector("#toggle");
const sunIcon = document.querySelector(".toggle .bxs-sun");
const moonIcon = document.querySelector(".toggle .bx-moon");

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
  document.body.classList.add("dark");
} else {
  document.body.classList.remove("dark");
}
