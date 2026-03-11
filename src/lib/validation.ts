// Input validation utilities for production safety

export function sanitizeText(text: string, maxLength: number = 500): string {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
}

export function validateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Name is required' };
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }
  
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { valid: true };
}

export function validateGalaTitle(title: string): { valid: boolean; error?: string } {
  const trimmed = title.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Title is required' };
  }
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Title must be at least 3 characters' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Title must be less than 100 characters' };
  }
  
  return { valid: true };
}

export function validateDescription(description: string): { valid: boolean; error?: string } {
  const trimmed = description.trim();
  
  if (trimmed.length > 500) {
    return { valid: false, error: 'Description must be less than 500 characters' };
  }
  
  return { valid: true };
}

export function validateInviteCode(code: string): { valid: boolean; error?: string } {
  const trimmed = code.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'Invite code is required' };
  }
  
  if (trimmed.length !== 8) {
    return { valid: false, error: 'Invite code must be exactly 8 characters' };
  }
  
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Invite code can only contain letters and numbers' };
  }
  
  return { valid: true };
}

export function validateAmount(amount: string | number): { valid: boolean; error?: string } {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) {
    return { valid: false, error: 'Amount must be a valid number' };
  }
  
  if (num < 0) {
    return { valid: false, error: 'Amount cannot be negative' };
  }
  
  if (num > 999999) {
    return { valid: false, error: 'Amount is too large' };
  }
  
  return { valid: true };
}

export function validateURL(url: string): { valid: boolean; error?: string } {
  const trimmed = url.trim();
  
  if (!trimmed) {
    return { valid: false, error: 'URL is required' };
  }
  
  try {
    new URL(trimmed);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

export function validateImageSize(file: File): { valid: boolean; error?: string } {
  const maxSize = 2 * 1024 * 1024; // 2MB
  
  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be less than 2MB' };
  }
  
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Image must be JPEG, PNG, GIF, or WebP' };
  }
  
  return { valid: true };
}
