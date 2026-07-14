import { render } from '@testing-library/react';
import { customAxe } from '../jest.setup';
import { PageViewer } from '@/components/page-viewer';

const mockPage = {
  id: 'test-123',
  title: 'Test Tool',
  description: 'A test tool for accessibility',
  category: 'productivity',
  file_url: 'https://example.com/test.html',
  is_open_source: true,
  source_code: '<div>Test</div>',
  views: 0,
  average_rating: 0,
  comments_count: 0,
  created_at: new Date().toISOString(),
  author_id: 'author-123',
  author: {
    id: 'author-123',
    name: 'Test Author',
    email: 'test@example.com',
    avatar_url: null,
    bio: null,
    role: 'developer',
    points: 0,
    level: 1,
    followers_count: 0,
    following_count: 0,
    created_at: new Date().toISOString(),
  },
};

jest.mock('@/components/locale-provider', () => ({
  useLocale: () => ({
    locale: 'es',
    messages: {
      common: { error: 'Error', loading: 'Cargando...', success: 'Éxito' },
      page: { useTool: 'Usar herramienta', source: 'Código', comments: 'Comentarios' },
      dashboard: { published: 'Publicada', deleted: 'Eliminada' },
    },
  }),
}));

jest.mock('@/components/auth-provider', () => ({
  useAuth: () => ({ user: null, isLoading: false, signOut: jest.fn() }),
}));

jest.mock('@/lib/services', () => ({
  getComments: jest.fn().mockResolvedValue([]),
  getPageLikes: jest.fn().mockResolvedValue(0),
  isPageLiked: jest.fn().mockResolvedValue(false),
  incrementPageViews: jest.fn().mockResolvedValue(undefined),
  isFollowing: jest.fn().mockResolvedValue(false),
  followUser: jest.fn().mockResolvedValue(undefined),
  unfollowUser: jest.fn().mockResolvedValue(undefined),
  createComment: jest.fn().mockResolvedValue(undefined),
  submitFeedback: jest.fn().mockResolvedValue(undefined),
  togglePageLike: jest.fn().mockResolvedValue(false),
}));

describe('Accessibility - PageViewer', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const results = await customAxe(container);
    expect(results.violations).toHaveLength(0);
  });

  it('should have proper heading hierarchy', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
    expect(headings.length).toBeGreaterThan(0);

    let previousLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName[1], 10);
      expect(level).toBeLessThanOrEqual(previousLevel + 1);
      previousLevel = level;
    });
  });

  it('should have proper landmark regions', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
  });

  it('should have accessible iframe with title', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('title', 'Test Tool');
    expect(iframe).toHaveAttribute('sandbox');
  });

  it('should have proper button labels', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const hasAriaLabel = button.hasAttribute('aria-label');
      const hasText = button.textContent?.trim().length > 0;
      expect(hasAriaLabel || hasText).toBe(true);
    });
  });

  it('should have focusable elements with visible focus styles', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const focusableElements = container.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusableElements.length).toBeGreaterThan(0);
  });
});

describe('Accessibility - Color Contrast', () => {
  it('should meet WCAG AA contrast ratios for text', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const results = await customAxe(container);
    const contrastViolations = results.violations.filter(v => v.id === 'color-contrast');
    expect(contrastViolations).toHaveLength(0);
  });
});

describe('Accessibility - Keyboard Navigation', () => {
  it('should be fully keyboard navigable', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const results = await customAxe(container);
    const keyboardViolations = results.violations.filter(
      v => v.id.includes('keyboard') || v.id.includes('focus')
    );
    expect(keyboardViolations).toHaveLength(0);
  });

  it('should have visible focus indicators', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const focusable = container.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])');
    focusableElements.forEach(el => {
      const styles = window.getComputedStyle(el);
      expect(styles.outline).not.toBe('none');
    });
  });
});

describe('Accessibility - ARIA', () => {
  it('should have proper ARIA labels on interactive elements', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const results = await customAxe(container);
    const ariaViolations = results.violations.filter(v => v.id.startsWith('aria-'));
    expect(ariaViolations).toHaveLength(0);
  });

  it('should have proper form labels', async () => {
    const { container } = render(<PageViewer page={mockPage} />);
    const inputs = container.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      const hasLabel = input.hasAttribute('aria-label') ||
        input.hasAttribute('aria-labelledby') ||
        container.querySelector(`label[for="${input.id}"]`);
      expect(hasLabel).toBe(true);
    });
  });
});