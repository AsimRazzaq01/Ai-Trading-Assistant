// frontend/src/lib/utils.ts

/**
 * Capitalize a name properly (title case).
 * Converts "john doe" to "John Doe", "MARY JANE" to "Mary Jane", etc.
 * 
 * @param name - The name string to capitalize, or null/undefined
 * @returns The capitalized name string, or the original value if null/undefined/empty
 */
export function capitalizeName(name: string | null | undefined): string | null | undefined {
  if (!name || !name.trim()) {
    return name;
  }
  
  // Split by spaces and capitalize each word
  const words = name.trim().split(/\s+/);
  const capitalizedWords = words.map(word => {
    if (!word) return word;
    // Convert to title case (first letter uppercase, rest lowercase)
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
  
  return capitalizedWords.join(' ');
}

