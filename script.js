function loadPage(page) {
  const contentDiv = document.getElementById("content");
  fetch(page)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((html) => {
      contentDiv.innerHTML = html;
    })
    .catch((error) => {
      contentDiv.innerHTML = `<p>Error loading page: ${error.message}</p>`;
    });
}
