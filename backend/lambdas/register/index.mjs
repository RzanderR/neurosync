import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const PATIENTS_BUCKET = process.env.PATIENTS_BUCKET ?? "";
const BUCKET_REGION =
  process.env.BUCKET_REGION ?? process.env.AWS_REGION ?? "us-west-2";

const s3 = PATIENTS_BUCKET ? new S3Client({ region: BUCKET_REGION }) : null;

const JSON_HEADERS = { "Content-Type": "application/json" };

function errorResponse(status, code, message) {
  return {
    statusCode: status,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: { code, message } }),
  };
}

function generatePatientId() {
  return `patient-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export const handler = async (event) => {
  let patient;
  try {
    patient = JSON.parse(event?.body || "{}");
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be JSON.");
  }

  const id = patient.id || generatePatientId();
  const record = { ...patient, id };

  if (s3) {
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: PATIENTS_BUCKET,
          Key: `patients/${id}.json`,
          Body: JSON.stringify(record),
          ContentType: "application/json",
        })
      );
    } catch (err) {
      console.error("S3 PutObject failed", err);
      return errorResponse(
        502,
        "STORAGE_ERROR",
        err?.message || "Could not persist patient record."
      );
    }
  }

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({
      patientId: id,
      patient: record,
    }),
  };
};
