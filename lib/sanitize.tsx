/**
 * Text sanitization utility for XSS protection
 *
 * IMPORTANT: This uses a lightweight approach that preserves formatting
 * while preventing XSS attacks. For HTML content, consider using DOMPurify.
 */

/**
 * Sanitizes text input by escaping HTML special characters
 * while preserving line breaks and basic formatting.
 *
 * This is safe for displaying user input and AI responses in React components.
 * React will handle the escaped content correctly.
 */
export function sanitizeText(text: string): string {
  if (!text) return ""

  // Escape HTML special characters to prevent XSS
  // but preserve line breaks and basic text formatting
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Sanitizes text for display, preserving line breaks as <br> tags
 * Use this when you need to render line breaks in HTML
 */
export function sanitizeTextWithLineBreaks(text: string): string {
  const sanitized = sanitizeText(text)
  return sanitized.replace(/\n/g, "<br>")
}

/**
 * For rich text content (AI responses with markdown), use this
 * It escapes HTML but preserves markdown-like formatting
 */
export function sanitizeMarkdown(text: string): string {
  // First sanitize to prevent XSS
  const sanitized = sanitizeText(text)

  // Preserve common markdown patterns (they're already escaped, so safe)
  // This is for display purposes - the escaped characters will show correctly
  return sanitized
}
