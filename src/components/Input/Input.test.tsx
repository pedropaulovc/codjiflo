import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/helpers';
import { Input } from './Input';

describe('Input', () => {
    it('should render with label', () => {
        render(<Input label="Username" />);
        expect(screen.getByLabelText('Username')).toBeInTheDocument();
    });

    it('should apply accessible label for attribute', () => {
        render(<Input label="Email" />);
        const input = screen.getByLabelText('Email');
        expect(input.tagName).toBe('INPUT');
    });

    it('should hide label visually when hideLabel is true', () => {
        render(<Input label="Hidden Label" hideLabel />);
        const label = screen.getByText('Hidden Label');
        expect(label).toHaveClass('sr-only');
    });

    it('should display error message', () => {
        render(<Input label="Password" error="Password is required" />);
        expect(screen.getByText('Password is required')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('Password is required');
    });

    it('should set aria-invalid when error is present', () => {
        render(<Input label="Email" error="Invalid email" />);
        expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
    });

    it('should link error to input via aria-describedby', () => {
        render(<Input label="Email" error="Invalid email" />);
        const input = screen.getByLabelText('Email');
        const errorId = input.getAttribute('aria-describedby');
        expect(errorId).toBeTruthy();
        expect(screen.getByRole('alert')).toHaveAttribute('id', errorId);
    });

    it('should forward ref to input element', () => {
        const ref = { current: null as HTMLInputElement | null };
        render(<Input label="Test" ref={ref} />);
        expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should pass through standard input props', () => {
        render(
            <Input
                label="Test"
                type="password"
                placeholder="Enter password"
                disabled
            />
        );
        const input = screen.getByLabelText('Test');
        expect(input).toHaveAttribute('type', 'password');
        expect(input).toHaveAttribute('placeholder', 'Enter password');
        expect(input).toBeDisabled();
    });
});
