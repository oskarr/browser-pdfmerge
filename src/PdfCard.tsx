import { FunctionalComponent } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { Button, Card } from "react-bulma-components";
import { filesize } from "filesize";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";

async function displayPDFPreview(pdfData: ArrayBuffer, canvas: HTMLCanvasElement) {
  // Initialize PDF.js
  const pdf = await getDocument(pdfData).promise,
    page = await pdf.getPage(1),
    viewport = page.getViewport({ "scale": 1 }),
    context = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const renderContext = {
    "canvasContext": context,
    viewport
  };

  page.render(renderContext);
}

type FilePreviewProps = {
  file: File,
  onPrev?: () => void,
  onNext?: () => void,
  onDelete?: () => void,
}

const FilePreview: FunctionalComponent<FilePreviewProps> = (props: FilePreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    (async () => {
      await displayPDFPreview(await props.file.arrayBuffer(), canvasRef.current);
    })();
  }, []);

  return (
    <Card className="pdf-preview">
      <Card.Header>
        <Card.Header.Title>{props.file.name}</Card.Header.Title>
        <Button style="margin: auto 3px;">{filesize(props.file.size, { "round": 1 })}</Button>
        {/* TODO: Don't hard-code margins. */}
      </Card.Header>
      <canvas ref={canvasRef} {...props} className="pdf-preview" />
      {(props.onPrev || props.onDelete || props.onNext) &&
        <Card.Footer>
          {props.onPrev && <Card.Footer.Item onClick={props.onPrev}>&larr;</Card.Footer.Item>}
          {props.onDelete && <Card.Footer.Item onClick={props.onDelete}>&#10060;</Card.Footer.Item>}
          {props.onNext && <Card.Footer.Item onClick={props.onNext}>&rarr;</Card.Footer.Item>}
        </Card.Footer>
      }
    </Card>
  );
};

export default FilePreview;
