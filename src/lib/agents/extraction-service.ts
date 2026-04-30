// FastAPI extraction sidecar (extract-api). Runs MarkItDown server-side
// for binary file types (PDF/DOCX/XLSX/PPTX). Text-extractable formats
// are handled client-side via FileReader and never reach this service.
const EXTRACT_API_URL =
  import.meta.env.VITE_EXTRACT_API_URL || 'http://localhost:8001'

export type ExtractionErrorCode =
  | 'unsupported_type'
  | 'too_large'
  | 'extraction_failed'
  | 'needs_ocr'
  | 'timeout'
  | 'network'

export interface ExtractionResult {
  success: boolean
  text: string
  wordCount: number
  errorCode?: ExtractionErrorCode
  errorMessage?: string
}

interface ServerExtractResponse {
  success: boolean
  filename: string
  text?: string | null
  word_count?: number | null
  duration_ms?: number | null
  error?: string | null
  error_detail?: string | null
}

/**
 * Upload a binary file to extract-api for Markdown extraction.
 *
 * Pass an `AbortSignal` to enforce a client-side timeout — the server
 * also enforces its own 60s timeout, but a slightly longer client
 * timeout (e.g. 90s) lets the server-side error message win.
 */
export async function extractFile(
  file: File,
  signal?: AbortSignal,
): Promise<ExtractionResult> {
  const formData = new FormData()
  formData.append('file', file, file.name)

  let response: Response
  try {
    response = await fetch(`${EXTRACT_API_URL}/api/extract`, {
      method: 'POST',
      body: formData,
      signal,
    })
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === 'AbortError'
    return {
      success: false,
      text: '',
      wordCount: 0,
      errorCode: aborted ? 'timeout' : 'network',
      errorMessage: aborted
        ? 'Extraction aborted'
        : 'Could not reach extract service',
    }
  }

  if (!response.ok) {
    return {
      success: false,
      text: '',
      wordCount: 0,
      errorCode: 'network',
      errorMessage: `Server returned ${response.status}`,
    }
  }

  let data: ServerExtractResponse
  try {
    data = await response.json()
  } catch {
    return {
      success: false,
      text: '',
      wordCount: 0,
      errorCode: 'extraction_failed',
      errorMessage: 'Invalid response from extract service',
    }
  }

  if (data.success && typeof data.text === 'string') {
    return {
      success: true,
      text: data.text,
      wordCount: data.word_count ?? 0,
    }
  }

  const code = (data.error as ExtractionErrorCode | undefined) ?? 'extraction_failed'
  return {
    success: false,
    text: '',
    wordCount: 0,
    errorCode: code,
    errorMessage: data.error_detail ?? code,
  }
}
