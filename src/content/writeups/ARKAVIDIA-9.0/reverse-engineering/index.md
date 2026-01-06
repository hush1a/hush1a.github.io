---
title: "Wibu"
description: "Katanya di ITB banyak wibunya. author: msfir"
date: 2025-01-04
ctf: "ARKAVIDIA 9.0"
category: "Reverse Engineering"
difficulty: "Medium"
points: 100
tags: ["re", "decompilation", "elixir"]
---

## Challenge Description

We are given a `.beam` file and an encoded string:

```
滒珁祻绰统绮苭肯蓡蕧纯蕯襥葟腡襯蝩衟菡蓵淽
```

## Solution

### Step 1: Decompiling the BEAM File

To decompile the `.beam` file, I used `iex` with the following command:

```elixir
:beam_disasm.file(Wibufication)
```

This produced Erlang bytecode which I then analyzed to understand the encoding logic.

### Step 2: Converting to Elixir

After analyzing the BEAM disassembly, I converted the logic to readable Elixir code:

```elixir
defmodule Wibufication do
  @moduledoc false

  def convert(str) do
    str
    |> String.codepoints()
    |> Enum.chunk_every(2, 2, nil)
    |> Enum.map_join(&process_chunk/1)
  end

  def main do
    System.argv()
    |> Enum.join(" ")
    |> convert()
    |> IO.puts()
  end

  # Processes a two-codepoint chunk.
  def process_chunk([a, b]) do
    a_val = :binary.first(a)
    b_val = :binary.first(String.trim(b))
    codepoint = a_val * 128 + b_val + 19968
    <<codepoint::utf8>>
  end

  # Fallback when there is only one codepoint.
  def process_chunk([a]) do
    a_val = :binary.first(a)
    codepoint = a_val * 128 + 19968
    <<codepoint::utf8>>
  end
end
```

### Step 3: Reversing the Encoding

Understanding the encoding algorithm:
- Each output character represents a combination of two input characters
- The formula: `codepoint = a_val * 128 + b_val + 19968`
- To reverse: subtract 19968, then divide by 128 to get `a_val` and use remainder for `b_val`

### Step 4: Writing the Decoder

I created a decoder to reverse the process:

```elixir
defmodule Decoder do
  @moduledoc false

  def decode(encoded) do
    encoded
    |> String.graphemes()
    |> Enum.map(&reverse_char/1)
    |> List.flatten()
    |> Enum.join("")
  end

  defp reverse_char(char) do
    cp = char |> String.to_charlist() |> hd
    value = cp - 19968
    a_val = div(value, 128)
    b_val = rem(value, 128)

    # If b_val is 0, assume this chunk was produced from a single input codepoint.
    if b_val == 0 do
      [<<a_val::utf8>>]
    else
      [<<a_val::utf8>>, <<b_val::utf8>>]
    end
  end

  def main do
    encoded =
      System.argv()
      |> Enum.join(" ")

    IO.puts(decode(encoded))
  end
end

Decoder.main()
```

### Step 5: Running the Decoder

Execute the decoder with the encoded string:

```bash
elixir solve.ex "滒珁祻绰统绮苭肯蓡蕧纯蕯襥葟腡襯蝩衟菡蓵淽"
```

## Flag

```
ARKAV{apa_anime/manga/novel_favorit_kamu?}
```


