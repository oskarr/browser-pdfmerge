// Component to render a pdf page preview
import { FunctionalComponent } from "preact";
import { useEffect, useRef } from "preact/hooks";

// Dynamic imports
const PdfJs = import(/* webpackPrefetch: true, webpackMode: "lazy-once", webpackChunkName: "pdfjs" */ "pdfjs-dist");

async function displayPDFPreview(pdfData: ArrayBuffer, canvas: HTMLCanvasElement, pageno: number) {
  // Initialize PDF.js
  const { getDocument, GlobalWorkerOptions } = await PdfJs;
  GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

  const pdf = await getDocument(pdfData).promise,
    page = await pdf.getPage(pageno),
    viewport = page.getViewport({ scale: 1 }),
    context = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    canvasContext: context as CanvasRenderingContext2D, // TODO: Deal with nulls
    viewport
  };

  page.render(renderContext);
}

type PdfPreviewProps = {
  file: File,
  page?: number,
}

const PdfPreviewCanvas: FunctionalComponent<PdfPreviewProps> = (props: PdfPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    (async () => {
      // TODO: Deal with nulls in a better way
      canvasRef.current && await displayPDFPreview(await props.file.arrayBuffer(), canvasRef.current, props.page || 1);
    })();
  }, []);

  return (
    <canvas ref={canvasRef} {...props} className="pdf-preview" />
  );
};

export default PdfPreviewCanvas;
