import html2pdf from "html2pdf.js";

/**
 * Export a DOM element to PDF
 * @param {HTMLElement} element - The DOM element to convert
 * @param {string} filename - The output filename
 */
export const exportToPdf = (element, filename = "promptly-export.pdf") => {
  const opt = {
    margin: [10, 10, 10, 10],
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf().set(opt).from(element).save();
};

/**
 * Download an image from a URL
 * @param {string} url - The image URL (Cloudinary)
 * @param {string} filename - The output filename
 */
export const downloadImage = async (url, filename = "promptly-image.png") => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("Download failed:", error);
    // Fallback: open in new tab
    window.open(url, "_blank");
  }
};
