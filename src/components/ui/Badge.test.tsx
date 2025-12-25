import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/helpers';
import { Badge } from './Badge';
import { ReviewState } from '@/api/types';

describe('Badge', () => {
  it('renders Open state with correct color', () => {
    render(<Badge state={ReviewState.Open} />);

    const badge = screen.getByText('Open');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
    expect(badge).toHaveClass('text-green-800');
  });

  it('renders Closed state with correct color', () => {
    render(<Badge state={ReviewState.Closed} />);

    const badge = screen.getByText('Closed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveClass('text-red-800');
  });

  it('renders Merged state with correct color', () => {
    render(<Badge state={ReviewState.Merged} />);

    const badge = screen.getByText('Merged');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-purple-100');
    expect(badge).toHaveClass('text-purple-800');
  });

  it('renders Draft state with correct color', () => {
    render(<Badge state={ReviewState.Draft} />);

    const badge = screen.getByText('Draft');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100');
    expect(badge).toHaveClass('text-gray-800');
  });

  it('has accessible aria-label', () => {
    render(<Badge state={ReviewState.Open} />);

    const badge = screen.getByLabelText(/Pull request status: Open/i);
    expect(badge).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Badge state={ReviewState.Open} className="custom-class" />);

    const badge = screen.getByText('Open');
    expect(badge).toHaveClass('custom-class');
  });
});
