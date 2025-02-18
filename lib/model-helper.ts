export function getSelectedModel(): string {
  if (typeof window !== 'undefined') {
    const storedModel = localStorage.getItem('selectedModel');
    return storedModel || 'gpt-4o-mini';
  } else {
    // Default model
    return 'gpt-4o-mini';
  }
}
