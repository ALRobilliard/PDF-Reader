let url = '../docs/sample.pdf';

let pdfDoc = null,
  pageNum = 1, 
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 1,
  canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d'),
  base64_marker = ';base64,';

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

// Check for pages rendering.
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num
  } else {
    renderPage(num);
  }
};

// Show previous page.
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

// Show next page.
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

const convertDataURIToBinary = dataURI => {
  var base64Index = dataURI.indexOf(base64_marker) + base64_marker.length;
  var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(var i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

// If document is base64 data, conver to binary first.
if (url.indexOf(base64_marker) > -1) {
  url = convertDataURIToBinary(url);
}

// Get document.
pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
  pdfDoc = pdfDoc_;

  document.querySelector('#page-count').textContent = pdfDoc.numPages;

  renderPage(pageNum);
}).catch(error => {
  // Display error.
  const div = document.createElement('div');
  div.className = 'error';
  div.appendChild(document.createTextNode(error.message));
  document.querySelector('body').insertBefore(div, canvas);
  // Remove top bar.
  document.querySelector('.top-bar').style.display = 'none';
})

// Button events.
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);