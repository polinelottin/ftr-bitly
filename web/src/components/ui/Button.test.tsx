import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

const TestIcon = () => <span data-testid="icon">🔥</span>;

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

  // Icon-only button tests (formerly IconButton tests)
  it('should render icon button with ariaLabel when iconOnly is true', () => {
    render(
      <Button iconOnly ariaLabel="Delete">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
  });

  it('should render primary variant by default for icon-only button', () => {
    render(
      <Button iconOnly ariaLabel="Action">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-base');
  });

  it('should render secondary variant for icon-only button', () => {
    render(
      <Button variant="secondary" iconOnly ariaLabel="Action">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white', 'border-2', 'border-blue-base');
  });

  it('should apply icon-only padding (p-2) when iconOnly is true', () => {
    render(
      <Button iconOnly ariaLabel="Icon">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-2');
    expect(button).not.toHaveClass('px-6', 'py-2');
  });

  it('should apply regular padding when iconOnly is false', () => {
    render(<Button>Text</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-2');
    expect(button).not.toHaveClass('p-2');
  });

  it('should have proper flex classes for centering icon when iconOnly is true', () => {
    render(
      <Button iconOnly ariaLabel="Centered">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should not have flex classes when iconOnly is false', () => {
    render(<Button>Text</Button>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should not have font classes when iconOnly is true', () => {
    render(
      <Button iconOnly ariaLabel="Icon">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('font-semibold', 'text-md');
  });

  it('should have font classes when iconOnly is false', () => {
    render(<Button>Text</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('font-semibold', 'text-md');
  });

  it('should render icon children when iconOnly is true', () => {
    render(
      <Button iconOnly ariaLabel="Icon">
        <TestIcon />
      </Button>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should apply disabled styles for primary variant icon-only button', () => {
    render(
      <Button variant="primary" disabled iconOnly ariaLabel="Disabled">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-300', 'text-gray-500');
  });

  it('should apply disabled styles for secondary variant icon-only button', () => {
    render(
      <Button variant="secondary" disabled iconOnly ariaLabel="Disabled">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200', 'text-gray-400');
  });

  it('should use ariaLabel prop for accessibility', () => {
    render(
      <Button iconOnly ariaLabel="Accessible">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Accessible');
  });

  it('should handle keyboard interaction for icon-only button', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Button onClick={handleClick} iconOnly ariaLabel="Keyboard">
        <TestIcon />
      </Button>
    );
    const button = screen.getByRole('button');
    
    button.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
