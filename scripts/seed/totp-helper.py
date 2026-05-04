#!/usr/bin/env python3
"""
Quick TOTP code generator for WebWaka QA seed users.
Usage: python3 scripts/seed/totp-helper.py [SECRET]
Default secret is for USR-001 (super_admin): JBSWY3DPEHPK3PXP

Example:
  python3 scripts/seed/totp-helper.py
  python3 scripts/seed/totp-helper.py JBSWY3DPEHPK3PXP
"""
import sys, time, struct, hmac, hashlib, base64

def base32_decode(b32):
    b32 = b32.upper().rstrip('=')
    pad = (8 - len(b32) % 8) % 8
    return base64.b32decode(b32 + '=' * pad)

def totp(secret, t=None):
    if t is None:
        t = int(time.time()) // 30
    key = base32_decode(secret)
    msg = struct.pack('>Q', t)
    h = hmac.new(key, msg, hashlib.sha1).digest()
    offset = h[19] & 0x0f
    code = (
        ((h[offset]   & 0x7f) << 24) |
        ((h[offset+1] & 0xff) << 16) |
        ((h[offset+2] & 0xff) <<  8) |
         (h[offset+3] & 0xff)
    ) % 1_000_000
    return str(code).zfill(6)

secret = sys.argv[1] if len(sys.argv) > 1 else 'JBSWY3DPEHPK3PXP'
now_t = int(time.time()) // 30
remaining = 30 - (int(time.time()) % 30)

print(f"Secret:  {secret}")
print(f"Time:    {time.strftime('%H:%M:%S UTC', time.gmtime())} ({remaining}s remaining in window)")
print()
print(f"  Previous: {totp(secret, now_t - 1)}")
print(f"  Current:  {totp(secret, now_t)}  ← use this")
print(f"  Next:     {totp(secret, now_t + 1)}")
