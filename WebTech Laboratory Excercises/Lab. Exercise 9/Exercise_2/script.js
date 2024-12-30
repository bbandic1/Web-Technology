function stripHTMLTags() {
    const input = document.getElementById("inputArea").value;

    let text = input.replace(/<[^>]*>/g, "");

    text = text.replace(/&amp;/g, "&")
               .replace(/&nbsp;/g, " ")
               .replace(/&quot;/g, '"');

    document.getElementById("output").textContent = text;
}