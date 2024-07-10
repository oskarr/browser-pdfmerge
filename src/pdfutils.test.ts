import { expect, test } from "vitest";
import { getEmptyPdfPage, getPadding, getPdfPageCount, pageOrderBooklet2A } from "./pdfutils";
import PDFMerger from "pdf-merger-js/browser";

test("Basic 2-page booklet ordering", () => {
  expect(pageOrderBooklet2A(4)).toEqual([4, 1, 2, 3]);
  expect(pageOrderBooklet2A(8)).toEqual([8, 1, 2, 7, 6, 3, 4, 5]);
  expect(pageOrderBooklet2A(16)).toEqual([16, 1, 2, 15, 14, 3, 4, 13, 12, 5, 6, 11, 10, 7, 8, 9]);
});

test("Padding page calculations", () => {
  // expect(getPadding(0, 4)).toBe(3) // Currently undefined behavor...
  expect(getPadding(1, 4)).toBe(3);
  expect(getPadding(2, 4)).toBe(2);
  expect(getPadding(3, 4)).toBe(1);
  expect(getPadding(4, 4)).toBe(0);

  expect(getPadding(16, 4)).toBe(0);
  expect(getPadding(13, 4)).toBe(3);

  expect(getPadding(20, 5)).toBe(0);
  expect(getPadding(18, 5)).toBe(2);
});

test("Empty Page Generation", async () => {
  const onePagePdf = await getEmptyPdfPage();
  expect(onePagePdf.byteLength).toBeGreaterThan(100);
  expect(await getPdfPageCount(onePagePdf)).toBe(1);
});

test("Pdf page counter", async () => {
  const merger = new PDFMerger();
  const onePagePdf = await getEmptyPdfPage();
  for (let i = 1; i < 5; i++) {
    await merger.add(onePagePdf);
    expect(await getPdfPageCount(await merger.saveAsBuffer())).toBe(i);
  }
});