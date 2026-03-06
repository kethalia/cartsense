// ── Image upload ──

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024 // 10 MB
export const BODY_SIZE_LIMIT = '11mb' // MAX_UPLOAD_SIZE + FormData overhead
export const MIN_IMAGE_DIMENSION = 300 // px

// ── Image compression (server-side storage) ──

export const MAX_STORED_BYTES = 4.5 * 1024 * 1024 // 4.5 MB — fits Claude's 5 MB vision limit

// ── Image viewer (zoom/pan) ──

export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 5
export const ZOOM_STEP = 0.5

// ── AI extraction ──

export const AI_MODEL = 'claude-sonnet-4-6'
export const AI_MAX_TOKENS = 20_000
export const AI_TEMPERATURE = 0

// ── Responsive ──

export const MOBILE_BREAKPOINT = 768
