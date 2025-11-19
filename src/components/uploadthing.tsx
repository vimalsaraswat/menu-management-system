// "use client";

// import type { ourFileRouter } from "~/server/uploadthing";

// export { UploadDropzone } from "@uploadthing/react";

// export type OurFileRouter = typeof ourFileRouter;

import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { OurFileRouter } from "~/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
