// Subcomponent for displaying a file and thumbnails.
import { FunctionalComponent } from "preact";
import { Button, Card } from "react-bulma-components";
import { filesize } from "filesize";
import PDFPreview from "./PdfPreview.tsx";

type FilePreviewProps = {
  file: File,
  onPrev?: () => void,
  onNext?: () => void,
  onDelete?: () => void,
}

const FilePreview: FunctionalComponent<FilePreviewProps> = (props: FilePreviewProps) => {
  return (
    <Card className="pdf-preview" draggable={true}>
      <Card.Header>
        <Card.Header.Title>{props.file.name}</Card.Header.Title>
        <Button>{filesize(props.file.size, { round: 1 })}</Button>
      </Card.Header>
      <PDFPreview file={props.file} />
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
