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
    expect(button).toHaveClass('bg-gray-200', 'border', 'border-gray-300');
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
    expect(button).toHaveClass('bg-blue-base', 'text-white', 'opacity-50', 'cursor-not-allowed');
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
  // IconOnly é inferido automaticamente quando há icon mas não há children
  it('should render icon button with ariaLabel when icon is provided without children', () => {
    render(
      <Button icon="trash" ariaLabel="Delete" />
    );
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
  });

  it('should render primary variant by default for icon-only button', () => {
    render(
      <Button icon="copy" ariaLabel="Action" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-base');
  });

  it('should render secondary variant for icon-only button', () => {
    render(
      <Button variant="secondary" icon="link" ariaLabel="Action" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200', 'border', 'border-gray-300');
  });

  it('should apply icon-only padding (p-2) when icon is provided without children', () => {
    render(
      <Button icon="warning" ariaLabel="Icon" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-2');
    expect(button).not.toHaveClass('px-6', 'py-2');
  });

  it('should apply regular padding when button has text', () => {
    render(<Button>Text</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-2');
    expect(button).not.toHaveClass('p-2');
  });

  it('should have proper flex classes for centering icon when icon-only', () => {
    render(
      <Button icon="copy" ariaLabel="Centered" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should not have flex classes when button has only text', () => {
    render(<Button>Text</Button>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should have flex classes when button has icon with text', () => {
    render(
      <Button icon="copy">Copy</Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should not have font classes when icon-only', () => {
    render(
      <Button icon="trash" ariaLabel="Icon" />
    );
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('font-semibold', 'text-md');
  });

  it('should have font classes when button has text', () => {
    render(<Button>Text</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('font-semibold', 'text-md');
  });

  it('should render icon when icon-only', () => {
    render(
      <Button icon="copy" ariaLabel="Icon" />
    );
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should apply disabled styles for primary variant icon-only button', () => {
    render(
      <Button variant="primary" disabled icon="trash" ariaLabel="Disabled" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-base', 'text-white', 'opacity-50', 'cursor-not-allowed');
  });

  it('should apply disabled styles for secondary variant icon-only button', () => {
    render(
      <Button variant="secondary" disabled icon="trash" ariaLabel="Disabled" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200', 'text-gray-400');
  });

  it('should use ariaLabel prop for accessibility', () => {
    render(
      <Button icon="copy" ariaLabel="Accessible" />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Accessible');
  });

  it('should handle keyboard interaction for icon-only button', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Button onClick={handleClick} icon="copy" ariaLabel="Keyboard" />
    );
    const button = screen.getByRole('button');
    
    button.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
