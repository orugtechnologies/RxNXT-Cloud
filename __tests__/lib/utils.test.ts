import { cn, capitalize, relativeTime, formatDate } from '../../lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges tailwind classes correctly', () => {
      expect(cn('p-4', 'm-4')).toBe('p-4 m-4');
      expect(cn('p-4 text-center', { 'text-red-500': true })).toBe('p-4 text-center text-red-500');
    });

    it('handles tailwind conflicts', () => {
      // tailwind-merge resolves conflicts, p-4 overrides p-2
      expect(cn('p-2', 'p-4')).toBe('p-4');
    });
  });

  describe('capitalize', () => {
    it('capitalizes the first letter of a string', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('jOhN')).toBe('John');
    });
    
    it('handles empty strings', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('formats a date string', () => {
      const date = new Date('2024-01-01T10:00:00Z').toISOString();
      const formatted = formatDate(date);
      // Since locale is en-IN, the default output will be like '1 Jan 2024' depending on Node's Intl implementation
      expect(formatted).toContain('2024');
      expect(formatted).toContain('1');
    });
  });

  describe('relativeTime', () => {
    it('returns "Just now" for times less than 60 seconds ago', () => {
      const date = new Date(Date.now() - 30 * 1000).toISOString();
      expect(relativeTime(date)).toBe('Just now');
    });

    it('returns minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(relativeTime(date)).toBe('5m ago');
    });

    it('returns hours ago', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      expect(relativeTime(date)).toBe('3h ago');
    });

    it('returns Yesterday', () => {
      const date = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      expect(relativeTime(date)).toBe('Yesterday');
    });
  });
});
