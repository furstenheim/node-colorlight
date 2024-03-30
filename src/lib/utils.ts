export function times (n: number): number[] {
  return Array.from(Array(n).keys())
}

export async function delay (timeInMs: number): Promise<void> {
  await new Promise<void>(resolve => setTimeout(() => { resolve() }, timeInMs))
}
