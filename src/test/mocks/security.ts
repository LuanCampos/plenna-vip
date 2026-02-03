/**
 * Centralized security test payloads.
 * Use these for consistent security testing across the codebase.
 * 
 * IMPORTANT: When a security test fails, investigate the code FIRST.
 * Never adjust tests to pass without confirming the behavior is correct.
 */

/**
 * HTML-based XSS payloads.
 * These should be escaped by sanitization functions.
 */
export const XSS_HTML_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert("xss")>',
  '<svg onload=alert("xss")>',
  '"><script>alert("xss")</script>',
  '<iframe src="javascript:alert(1)">',
  '<div style="background:url(javascript:alert(1))">',
  '<body onload=alert("xss")>',
  '<input onfocus=alert("xss") autofocus>',
  '<a href="javascript:alert(1)">click</a>',
  '<details open ontoggle=alert(1)>',
  '<marquee onstart=alert(1)>',
] as const;

/**
 * Event handler XSS payloads.
 */
export const XSS_EVENT_PAYLOADS = [
  'onerror=alert(1)',
  'onload=alert(1)',
  'onclick=alert(1)',
  'onmouseover=alert(1)',
  'onfocus=alert(1)',
  'onblur=alert(1)',
] as const;

/**
 * Attribute injection payloads.
 */
export const XSS_ATTRIBUTE_PAYLOADS = [
  '" onclick="alert(1)" data-x="',
  "' onclick='alert(1)' data-x='",
  '" autofocus onfocus="alert(1)',
  '</script><script>alert(1)</script>',
] as const;

/**
 * JavaScript protocol payloads.
 */
export const XSS_JAVASCRIPT_PROTOCOL_PAYLOADS = [
  'javascript:alert(1)',
  'javascript:alert(document.cookie)',
  'javascript:void(0)',
  'vbscript:alert(1)',
  'data:text/html,<script>alert(1)</script>',
] as const;

/**
 * SQL Injection payloads.
 * These should be sanitized or parameterized in queries.
 */
export const SQL_INJECTION_PAYLOADS = [
  "'; DROP TABLE users; --",
  "1' OR '1'='1",
  "1; DELETE FROM users",
  "admin'--",
  "' UNION SELECT * FROM users --",
  "1' AND 1=1 --",
  "'; EXEC xp_cmdshell('dir'); --",
] as const;

/**
 * NoSQL Injection payloads.
 */
export const NOSQL_INJECTION_PAYLOADS = [
  '{"$gt": ""}',
  '{"$ne": null}',
  '{"$where": "this.password.length > 0"}',
  '{"$regex": ".*"}',
] as const;

/**
 * Path Traversal payloads.
 */
export const PATH_TRAVERSAL_PAYLOADS = [
  '../../../etc/passwd',
  '..\\..\\..\\windows\\system32\\config\\sam',
  '....//....//....//etc/passwd',
  '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
  '..%252f..%252f..%252fetc/passwd',
] as const;

/**
 * Command Injection payloads.
 */
export const COMMAND_INJECTION_PAYLOADS = [
  '; ls -la',
  '| cat /etc/passwd',
  '`whoami`',
  '$(whoami)',
  '& dir',
  '| net user',
] as const;

/**
 * Prototype Pollution payloads.
 */
export const PROTOTYPE_POLLUTION_PAYLOADS = [
  { '__proto__': { 'polluted': true } },
  { 'constructor': { 'prototype': { 'polluted': true } } },
  { '__proto__.polluted': true },
] as const;

/**
 * LDAP Injection payloads.
 */
export const LDAP_INJECTION_PAYLOADS = [
  '*)(uid=*))(|(uid=*',
  '*)(&',
  '*)(|(password=*)',
  'admin)(&)',
] as const;

/**
 * CRLF Injection payloads.
 */
export const CRLF_INJECTION_PAYLOADS = [
  '%0d%0aSet-Cookie: malicious=true',
  '\r\nX-Injected: header',
  '%0aContent-Length: 0%0a%0a',
] as const;

/**
 * Template Injection payloads.
 */
export const TEMPLATE_INJECTION_PAYLOADS = [
  '{{7*7}}',
  '${7*7}',
  '<%= 7*7 %>',
  '#{7*7}',
  '{{constructor.constructor("return this")()}}',
] as const;

/**
 * ReDoS (Regular Expression Denial of Service) payloads.
 */
export const REDOS_PAYLOADS = [
  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!',
  'a]aaaaaaaaaaaaaaaaaaaaaaaaaaa!',
] as const;

/**
 * Unicode and encoding attack payloads.
 */
export const UNICODE_ATTACK_PAYLOADS = [
  '\u202e\u0065\u0078\u0065.txt', // Right-to-left override
  '\uFEFF', // BOM
  '\u0000', // Null byte
  'test\u0000.js', // Null byte in filename
] as const;

/**
 * All XSS payloads combined for comprehensive testing.
 */
export const ALL_XSS_PAYLOADS = [
  ...XSS_HTML_PAYLOADS,
  ...XSS_ATTRIBUTE_PAYLOADS,
  ...XSS_JAVASCRIPT_PROTOCOL_PAYLOADS,
] as const;

/**
 * Helper to verify a value has been sanitized (no dangerous characters).
 */
export function assertSanitized(value: string): void {
  // Check that HTML tags are escaped
  if (value.match(/<[a-z]/i)) {
    throw new Error(`Value contains unescaped HTML tags: ${value}`);
  }
  // Check for dangerous event handlers
  if (value.match(/on\w+=/i)) {
    throw new Error(`Value contains event handlers: ${value}`);
  }
  // Check for javascript: protocol
  if (value.match(/javascript:/i)) {
    throw new Error(`Value contains javascript protocol: ${value}`);
  }
}
