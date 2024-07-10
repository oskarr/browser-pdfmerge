import { FunctionalComponent } from "preact";
import { DropzoneOptions, useDropzone } from "react-dropzone";
import FilePreview from "./PdfCard.js";
import { Button, Container, Form, Navbar } from "react-bulma-components";
import { useState } from "preact/hooks";
import { bookletKey, merge } from "./pdfutils.js";

const DropZone: FunctionalComponent = () => {
  type sortingKey = "name" | "lastModified" | "size" | undefined;
  const [files, setFiles] = useState<File[]>([]),
    [lastSortKey, setLastSortKey] = useState<sortingKey>(),
    [isAscending, setIsAscending] = useState<boolean>(false),
    [booklet, setBooklet] = useState<bookletKey>("off"),
    { getRootProps, getInputProps, open } = useDropzone({
      noClick: true,
      accept: { "application/pdf": [] },
      onDrop: (acceptedFiles: File[]) => {
        setFiles([...files, ...acceptedFiles]);
        setLastSortKey(undefined);
      }
    } as unknown as DropzoneOptions), // TODO: Why does DropzoneOptions seem to be incorrect?

    sortFiles = (key: sortingKey, asc: boolean) => {
      key && setFiles(files.slice(0).sort((a, b) => a[key] === b[key] ? 0 : (((a[key] > b[key]) !== asc) ? -1 : 1)));
      setLastSortKey(key);
      setIsAscending(asc);
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
      setLastSortKey(undefined);
    };

  return (
    <>
      <Navbar style={{ borderRadius: 0 }}>
        <Navbar.Brand>
          <Navbar.Item>PDF Merger</Navbar.Item>
        </Navbar.Brand>
      </Navbar>
      <div id="main">
        <Container className="controls-container">
          {/* File count and merge button. */}
          <Form.Field className="has-addons is-horizontal">{/* TODO: Don't use className for bulma stuff */}
            <Form.Control><Button isStatic>{files.length} files: </Button></Form.Control>
            <Form.Control>
              <Button color={files.length == 0 ? "danger" : "success"} disabled={files.length == 0}
                onClick={async () => await merge(files, booklet)}
              >Merge</Button>
            </Form.Control>
          </Form.Field>
          {/* Sorting controls. */}
          <Form.Field className="has-addons is-horizontal">{/* TODO: Don't use className for bulma stuff */}
            <Form.Control><Button isStatic>Sort by: </Button></Form.Control>
            <Form.Control><Button color={lastSortKey === "name" ? "link" : undefined} onClick={() => { sortFiles("name", isAscending); }}>Name</Button></Form.Control>
            <Form.Control><Button color={lastSortKey === "lastModified" ? "link" : undefined} onClick={() => { sortFiles("lastModified", isAscending); }}>Last modified</Button></Form.Control>
            <Form.Control><Button color={lastSortKey === "size" ? "link" : undefined} onClick={() => { sortFiles("size", isAscending); }}>Size</Button></Form.Control>
            <Form.Control><Button isStatic>Order: </Button></Form.Control>
            <Form.Control><Button onClick={() => {
              sortFiles(lastSortKey, true);
            }} color={isAscending ? "link" : undefined}>&darr;</Button></Form.Control>
            <Form.Control><Button onClick={() => {
              sortFiles(lastSortKey, false);
            }} color={isAscending ? undefined : "link"}>&uarr;</Button></Form.Control>
          </Form.Field>
          {/* Selection controls. */}
          {/* <Form.Field className="has-addons is-horizontal">
            <Form.Control><Button isStatic>Selected </Button></Form.Control>
            <Form.Control>
              <Button color="danger" disabled>Delete</Button>
            </Form.Control>
          </Form.Field> */}
          {/* Booklet controls */}
          <Form.Field className="has-addons is-horizontal">
            <Form.Control><Button isStatic>Booklet</Button></Form.Control>
            <Form.Control>
              <Form.Select onChange={(e: Event) => setBooklet(((e.target as HTMLSelectElement | undefined)?.value || "off") as bookletKey)}>
                <option value="off">Off</option>
                <option value="basic">2-fold</option>
              </Form.Select>
            </Form.Control>
          </Form.Field>
        </Container>
        <br />
        {/* File drop area */}
        <Container>
          <div {...getRootProps({ className: "dropzone" })} onClick={() => files.length == 0 && open()}>
            <input {...getInputProps({})} />
            {files.length == 0 && <p>Drag &apos;n&apos; drop some files here, or click to select files</p>}
            {files.length > 0 && <div className="file-list">{files.map((file, i) =>
              (<FilePreview key={file} file={file}
                onPrev={i == 0 ? undefined : () => { moveFile(i, -1); }}
                onDelete={() => { setFiles(files.filter((f) => f !== file)); }}
                onNext={i == files.length - 1 ? undefined : () => { moveFile(i, 1); }}
              />)
            )}</div>}
          </div>
        </Container>
        <br/>
        {/* Footer */}
        <p style="font-size:8px;opacity:0.5;">
          <a href="https://github.com/oskarr/browser-pdfmerge/">Source code</a>.
          This page uses pdf-lib, which may contain security bugs.
          Don&apos;t merge pdf:s you don&apos;t trust.
        </p>
      </div>
    </>
  );
};

export default DropZone;
