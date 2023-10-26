import { FunctionalComponent } from "preact";
import { useDropzone } from "react-dropzone";
import PDFMerger from "pdf-merger-js/browser";
import FilePreview from "./PdfCard.js";
import { Button, Container, Form, Navbar } from "react-bulma-components";
import { useState } from "preact/hooks";

async function merge(files: File[]) {
  const merger = new PDFMerger();
  for (const file of files) {
    await merger.add(file);
  }
  const mergedPdf = await merger.saveAsBlob(),
    url = URL.createObjectURL(mergedPdf);
  window.open(url, "_blank");
}

const DropZone: FunctionalComponent = () => {
  type sortingKey = "name" | "lastModified" | "size";
  const [files, setFiles] = useState<File[]>([]),
    [lastSort, setLastSort] = useState<undefined | sortingKey>(),
    [ascending, setAscending] = useState<boolean>(false),
    { getRootProps, getInputProps, open } = useDropzone({
      "noClick": true,
      "accept": { "application/pdf": [] },
      "onDrop": (acceptedFiles) => {
        setFiles([...files, ...acceptedFiles]);
      }
    }),

    sortFiles = (prop: sortingKey) => {
      setFiles(files.slice(0).sort((a, b) => a[prop] === b[prop] ? 0 : (((a[prop] > b[prop]) !== ascending) ? -1 : 1)));
      setLastSort(prop);
    },
    moveFile = (index: number, offset: -1 | 1) => {
      // TODO: Generalize instead of using cases
      switch (offset) {
      case -1:
        setFiles([...files.slice(0, index - 1), files[index], files[index - 1], ...files.slice(index + 1)]);
        break;
      case 1:
        setFiles([...files.slice(0, index), files[index + 1], files[index], ...files.slice(index + 2)]);
        break;
      }
      setLastSort(undefined);
    };

  return (
    <>
      <Navbar style={{ "borderRadius": 0 }}>
        <Navbar.Brand>
          <Navbar.Item>PDF Merger</Navbar.Item>
        </Navbar.Brand>
      </Navbar>
      <div id="main">
        <Container className="controls-container">
          <Form.Field className="has-addons is-horizontal">{/* TODO: Don't use className for bulma stuff */}
            <Form.Control><Button isStatic>{files.length} files: </Button></Form.Control>
            <Form.Control>
              <Button color={files.length == 0 ? "danger" : "success"} disabled={files.length == 0}
                onClick={async () => await merge(files)}
              >Merge</Button>
            </Form.Control>
          </Form.Field>
          <Form.Field className="has-addons is-horizontal">{/* TODO: Don't use className for bulma stuff */}
            <Form.Control><Button isStatic>Sort by: </Button></Form.Control>
            <Form.Control><Button color={lastSort === "name" ? "link" : undefined} onClick={() => sortFiles("name")}>Name</Button></Form.Control>
            <Form.Control><Button color={lastSort === "lastModified" ? "link" : undefined} onClick={() => sortFiles("lastModified")}>Last modified</Button></Form.Control>
            <Form.Control><Button color={lastSort === "size" ? "link" : undefined} onClick={() => sortFiles("size")}>Size</Button></Form.Control>
            <Form.Control><Button isStatic>Order: </Button></Form.Control>
            <Form.Control><Button onClick={() => {
              setAscending(true); lastSort && sortFiles(lastSort);
            }} color={ascending ? "link" : undefined}>&darr;</Button></Form.Control>
            <Form.Control><Button onClick={() => {
              setAscending(false); lastSort && sortFiles(lastSort);
            }} color={ascending ? undefined : "link"}>&uarr;</Button></Form.Control>
          </Form.Field>
          <Form.Field className="has-addons is-horizontal">
            <Form.Control><Button isStatic>Selected </Button></Form.Control>
            <Form.Control>
              <Button color="danger" disabled>Delete</Button>
            </Form.Control>
          </Form.Field>
        </Container>
        <br />
        <Container>
          <div {...getRootProps({ "className": "dropzone" })} onClick={() => files.length == 0 && open()}>
            <input {...getInputProps({})} />
            {files.length == 0 && <p>Drag &apos;n&apos; drop some files here, or click to select files</p>}
            {files.length > 0 && <div className="file-list">{files.map((file, i) =>
              (<FilePreview key={file} file={file}
                onPrev={i == 0 ? undefined : () => {
                  moveFile(i, -1);
                }}
                onDelete={() => {
                  setFiles(files.filter((f) => f !== file));
                }}
                onNext={i == files.length - 1 ? undefined : () => {
                  moveFile(i, 1);
                }}
              />)
            )}</div>}
          </div>
        </Container>
      </div>
    </>
  );
};

export default DropZone;
