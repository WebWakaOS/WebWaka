const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /\+?\d{10,15}/g;
const IP_RE = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;

export function maskPII(input: string): string {
  return input
    .replace(EMAIL_RE, '[EMAIL_REDACTED]')
    .replace(PHONE_RE, '[PHONE_REDACTED]')
    .replace(IP_RE, (ip) => {
      const parts = ip.split('.');
      return `${parts[0]}.${parts[1]}.*.*`;
    });
}
