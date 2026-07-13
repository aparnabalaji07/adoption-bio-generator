const generateButton = document.getElementById("generate");
const resultDiv = document.getElementById("result");

generateButton.addEventListener("click", async () => {
  const animal = {
    name: document.getElementById("name").value,
    species: document.getElementById("species").value,
    age: document.getElementById("age").value,
    notes: document.getElementById("notes").value,
  };

  if (!animal.notes.trim()) {
    resultDiv.textContent = "Please add a few notes about the animal first.";
    return;
  }

  resultDiv.textContent = "Writing the bio…";

  try {
    const response = await fetch("/api/bio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(animal),
    });

    if (!response.ok) throw new Error("Request failed");

    const data = await response.json();

    resultDiv.textContent = data.bio;
  } catch (error) {
    resultDiv.textContent = "Something went wrong. Please try again.";
  }
});
