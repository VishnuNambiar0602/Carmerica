import crypto from 'crypto';
import { getSupabaseClient } from './supabase.js';

const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

export async function validateAndStoreKyvDocument(input: any, vendorId: string) {
  const documentType = String(input.documentType || input.document_type || '').trim();
  if (!documentType) throw new Error('Document type is required.');

  const fileName = String(input.fileName || input.file_name || `${documentType}.pdf`).replace(/[^\w.\- ]+/g, '');
  const mimeType = String(input.mimeType || input.mime_type || 'application/pdf');
  if (!allowedMimeTypes.has(mimeType)) {
    throw new Error('Unsupported KYV file type. Use PDF, JPG, PNG, or WebP.');
  }

  let fileUrl = String(input.fileUrl || input.file_url || '');
  let fileHash = String(input.fileHash || input.file_hash || '');
  let fileSize = Number(input.fileSize || input.file_size || 0);

  if (input.fileBase64) {
    const base64 = String(input.fileBase64).replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64, 'base64');
    fileSize = buffer.length;
    if (fileSize > Number(process.env.KYV_MAX_BYTES || 10 * 1024 * 1024)) {
      throw new Error('KYV file is too large.');
    }
    fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

    const client = getSupabaseClient();
    const bucket = process.env.SUPABASE_KYV_BUCKET || 'kyv-documents';
    if (!client) {
      if (process.env.NODE_ENV === 'production') throw new Error('Supabase storage is required for KYV uploads.');
      fileUrl = `pending-storage://${vendorId}/${fileName}`;
    } else {
      const path = `${vendorId}/${Date.now()}-${fileName}`;
      const { error } = await client.storage.from(bucket).upload(path, buffer, {
        contentType: mimeType,
        upsert: false,
      });
      if (error) throw new Error(`KYV upload failed: ${error.message}`);
      const { data } = client.storage.from(bucket).getPublicUrl(path);
      fileUrl = data.publicUrl;
    }
  }

  if (!fileUrl) throw new Error('A KYV document file is required.');

  return {
    documentType,
    fileName,
    fileUrl,
    fileHash,
    fileSize,
    mimeType,
  };
}
