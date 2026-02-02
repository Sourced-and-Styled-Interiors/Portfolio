document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".intake-form");
  const success = document.querySelector(".form-success");

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const endpoint = form.getAttribute("action");

    if (!endpoint || endpoint.includes("REPLACE_WITH_YOUR_ENDPOINT")) {
      alert("Add your Getform endpoint URL in the form action first.");
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
      });

      if (response.ok || response.type === "opaque") {
        form.reset();
        success.hidden = false;
      } else {
        alert("There was a problem sending the form. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("There was a problem sending the form. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send my brief";
    }
  });
});
