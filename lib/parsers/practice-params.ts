// Utility functions for parsing practice parameters

export function getDisplayName(input: string): string {
  // Capitalize first letter of each word
  return input
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\b(ai|pte|rl|ra|di|rst|swt|we|rop|rfib|mcsa|mcma|sst|lfitb|hcs|lmcma|smw|hiw|wfd)\b/gi, 
      (match) => match.toUpperCase());
}