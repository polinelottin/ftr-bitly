import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should render primary variant by default', () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-base');
  });

  it('should render secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white', 'border-2', 'border-blue-base');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('should apply disabled styles for primary variant', () => {
    render(<Button variant="primary" disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-300', 'text-gray-500');
  });

  it('should apply disabled styles for secondary variant', () => {
    render(<Button variant="secondary" disabled>Disabled</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200', 'text-gray-400');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have default type button', () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should accept custom type prop', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should accept custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should accept other HTML button attributes', () => {
    render(<Button data-testid="custom-button" aria-label="Custom label">Button</Button>);
    const button = screen.getByTestId('custom-button');
    expect(button).toHaveAttribute('aria-label', 'Custom label');
  });

  it('should have focus styles', () => {
    render(<Button>Focusable</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('should render with correct base classes', () => {
    render(<Button>Base</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-2', 'rounded-lg', 'transition-colors', 'font-semibold', 'text-md');
  });

  it('should handle multiple clicks', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Multiple clicks</Button>);
    const button = screen.getByRole('button');
    
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it('should handle keyboard interaction', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Keyboard</Button>);
    const button = screen.getByRole('button');
    
    button.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it('should render complex children', () => {
    render(
      <Button>
        <span>Icon</span> Text
      </Button>
    );
    expect(screen.getByRole('button')).toHaveTextContent('Icon Text');
  });
});
