const url = '../docs/sample.pdf';

let pdfDoc = null,
  pageNum = 1, 
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 1,
  canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d');

// Render the page.
const renderPage = num => {
  pageIsRendering = true;

  // Get page.
  pdfDoc.getPage(num).then(page => {
    // Set scale.
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending != null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    // Output current page number.
    document.querySelector('#page-num').textContent = num;
  });
};

// Get document.
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;

  document.querySelector('#page-count').textContent = pdfDoc.numPages;

  renderPage(pageNum);
});