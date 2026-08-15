const API_URL = "https://6dmzf26rsf.execute-api.us-east-1.amazonaws.com/upload-url";

const uploadForm = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const status = document.getElementById("status");
const metadata = document.getElementById("metadata");

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = imageInput.files[0];

    if (!file) {
        status.textContent = "Please select an image.";
        return;
    }

    status.textContent = "Preparing upload...";
    metadata.style.display = "none";

    try {
        // Step 1: Request a presigned S3 URL
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type
            })
        });

        if (!response.ok) {
            throw new Error("Failed to generate upload URL.");
        }

        const data = await response.json();

        // Step 2: Upload the image directly to S3
        status.textContent = "Uploading image...";

        const uploadResponse = await fetch(data.uploadUrl, {
            method: "PUT",
            headers: {
                "Content-Type": file.type
            },
            body: file
        });

        if (!uploadResponse.ok) {
            throw new Error("Image upload failed.");
        }

        // Step 3: Display upload information
        status.textContent = "Image uploaded successfully.";

        metadata.innerHTML = `
            <p><strong>Image ID:</strong> ${data.imageId}</p>
            <p><strong>File Name:</strong> ${file.name}</p>
            <p><strong>S3 Key:</strong> ${data.key}</p>
        `;

        metadata.style.display = "block";

    } catch (error) {
        console.error(error);
        status.textContent = error.message;
    }
});
