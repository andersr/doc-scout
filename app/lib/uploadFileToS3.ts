export async function uploadFileToS3({
  file,
  signedUrl,
}: {
  file: File;
  signedUrl: string;
}) {
  const s3UploadData = new FormData();

  s3UploadData.append("file", new Blob([file], { type: file.type }), file.name);
  await fetch(signedUrl, {
    body: s3UploadData,
    headers: {
      "Content-Type": file.type,
    },
    method: "PUT",
  });
}
