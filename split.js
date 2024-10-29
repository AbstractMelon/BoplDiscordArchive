const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

function splitHtml(inputFile, chunkSize) {
  fs.readFile(inputFile, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    const $ = cheerio.load(data);
    const content = $(".chatlog");
    const messages = content.children(".chatlog__message-group");
    const totalMessages = messages.length;

    // Extract content outside of chatlog and replace with chat-messages div
    const outsideContent = data
      .replace(
        /<div class="chatlog">[\s\S]*?<\/div>/,
        "<div class='chat-messages'></div>"
      )
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");

    // Define output directory for main.html and chunk files
    const outputDir = path.join(__dirname, "pages", "feedback");

    // Create output directory if it doesn't exist
    fs.mkdirSync(outputDir, { recursive: true });

    // Save the main content in the same directory as chunks
    const mainFilePath = path.join(outputDir, "main.html");

    let chunkIndex = 0;
    let chunkContent = "";

    // Loop through messages and create chunks
    messages.each((index) => {
      const message = messages.eq(index);
      chunkContent += message.prop("outerHTML");

      // Check if chunk size is reached
      if ((index + 1) % chunkSize === 0 || index === totalMessages - 1) {
        // Create a new chunk file
        const chunkFileName = path.join(
          outputDir,
          `chunk${chunkIndex + 1}.html`
        );
        const fullChunkHtml = `<div class="chatlog">${chunkContent}</div>`; // Wrap in chatlog div

        fs.writeFile(chunkFileName, fullChunkHtml, (err) => {
          if (err) {
            console.error(`Error writing chunk ${chunkIndex + 1}:`, err);
          } else {
            console.log(`Chunk ${chunkIndex + 1} saved as ${chunkFileName}`);
          }
        });

        // Delete the messages from the main html
        message.remove();

        // Reset for the next chunk
        chunkContent = "";
        chunkIndex++;
      }
    });

    // Save the main content again without the messages
    fs.writeFile(mainFilePath, $.html(), (err) => {
      if (err) {
        console.error("Error writing main.html (after chunks):", err);
      } else {
        console.log("main.html saved successfully at", mainFilePath);
      }
    });
  });
}

// Usage
const inputFile = "./pages/feedback.html";
const chunkSize = 250;
splitHtml(inputFile, chunkSize);
