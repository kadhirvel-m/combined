/**
 * JSON-serialize a value so it can be embedded inside an inline <script>
 * without terminating it early (`</script>`) or opening an HTML comment.
 */
export function serializeForInlineScript(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
