const arity: Readonly<Record<string, number>> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2 };

export function roundAbsolutePath(value: string): string {
  const tokens = [...value.matchAll(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g)];
  if (tokens[0]?.[0] !== 'M') return value;
  let end = 0;
  let command = '';
  let count = 0;
  for (const token of tokens) {
    if (!/^[\s,]*$/.test(value.slice(end, token.index))) return value;
    end = token.index + token[0].length;
    if (/^[a-zA-Z]$/.test(token[0])) {
      if (command && command !== 'Z' && (count === 0 || count % arity[command] !== 0)) return value;
      command = token[0] === 'z' ? 'Z' : token[0];
      if (command !== 'Z' && !arity[command]) return value;
      count = 0;
    } else {
      if (!arity[command] || !Number.isFinite(Number(token[0]))) return value;
      count++;
    }
  }
  if (
    !/^[\s,]*$/.test(value.slice(end)) ||
    (command !== 'Z' && (count === 0 || count % arity[command] !== 0))
  )
    return value;
  return value.replace(/[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g, (part) => {
    const parsed = Number(part);
    const rounded = Number(parsed.toFixed(2));
    return parsed !== 0 && rounded === 0 ? part : String(rounded);
  });
}
