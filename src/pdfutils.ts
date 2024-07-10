import { PDFDocument } from "pdf-lib";

//
// Dynamic imports
//
const PDFMerger = import(/* webpackMode: "lazy-once", webpackChunkName: "pdfmergerjs" */ "pdf-merger-js/browser");

//
// Types
//
export type bookletKey = "off" | "basic" | "thin";

//
// Utility functions
//
function downloadPdfBlob(pdf: Blob) {
  const url = URL.createObjectURL(pdf);
  window.open(url, "_blank");
}

export async function getEmptyPdfPage(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.addPage();
  //   const page = pdfDoc.addPage();
  //   page.setSize(1, 1);
  const bytes = await pdfDoc.save();
  return bytes;
}

export async function getPdfPageCount(pdf: string | Uint8Array | ArrayBuffer): Promise<number> {
  const pdfDoc = await PDFDocument.load(pdf);
  return pdfDoc.getPageCount();
}

export function getPadding(pageCount: number, pagesPerSheet: number = 4) {
  return (pagesPerSheet - (pageCount % pagesPerSheet)) % pagesPerSheet;
}

export function pageOrderBooklet2A(pageCount: number): number[] {
  // Flexibility and readability over performance. For now.

  // If this warns, check the getPadding function.
  (pageCount % 4 == 0) || console.warn(`Page count (${pageCount}) is not a multiple of 4. This is a bug, and may lead to unexpected results.`);

  // Initialize the array v with values from 1 to pageCount
  const initial = Array.from({ length: pageCount }, (_, i) => i + 1);
  const rearranged = [];

  while (initial.length > 0) {
    // For each sheet, we print the last page, then the first page.
    // On the backside, we print the second page, and then the second last page.
    // We repeat this until we have printed all pages.
    rearranged.push(initial.pop()!);
    rearranged.push(initial.shift()!);
    rearranged.push(initial.shift()!);
    rearranged.push(initial.pop()!);
  }
  return rearranged;
}


//
// Main
//

export async function merge(files: File[], booklet: bookletKey) {
  const merger = new ((await PDFMerger).default)();
  for (const file of files) {
    await merger.add(file);
  }
  if (booklet === "off") {
    downloadPdfBlob(await merger.saveAsBlob());
    return;
  }
  const mergedPdf = await merger.saveAsBuffer();
  const pageCount = await getPdfPageCount(mergedPdf);
  const padding = getPadding(pageCount, 4);
  for (let i = 0; i < padding; i++) { await merger.add(await getEmptyPdfPage()); }
  const reorderer = new ((await PDFMerger).default)();
  const paddedPdf = await merger.saveAsBlob();
  const pageOrder = pageOrderBooklet2A(pageCount + padding);
  await reorderer.add(paddedPdf, pageOrder);
  downloadPdfBlob(await reorderer.saveAsBlob());
  return;
}
