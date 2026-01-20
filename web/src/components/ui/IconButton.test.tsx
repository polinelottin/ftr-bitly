import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IconButton } from './IconButton';

const TestIcon = () => <span data-testid="icon">🔥</span>;

describe('IconButton', () => {
  it('should render icon button with aria-label', () => {
    render(
      <IconButton ariaLabel="Delete">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button', { name: /delete/i });
    expect(button).toBeInTheDocument();
  });

  it('should render primary variant by default', () => {
    render(
      <IconButton ariaLabel="Action">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-base');
  });

  it('should render secondary variant', () => {
    render(
      <IconButton variant="secondary" ariaLabel="Action">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-white', 'border-2', 'border-blue-base');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <IconButton disabled ariaLabel="Disabled">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('should apply disabled styles for primary variant', () => {
    render(
      <IconButton variant="primary" disabled ariaLabel="Disabled">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-300', 'text-gray-500');
  });

  it('should apply disabled styles for secondary variant', () => {
    render(
      <IconButton variant="secondary" disabled ariaLabel="Disabled">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200', 'text-gray-400');
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <IconButton onClick={handleClick} ariaLabel="Click me">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick when disabled', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <IconButton disabled onClick={handleClick} ariaLabel="Disabled">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should have default type button', () => {
    render(
      <IconButton ariaLabel="Default">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should accept custom type prop', () => {
    render(
      <IconButton type="submit" ariaLabel="Submit">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should accept custom className', () => {
    render(
      <IconButton className="custom-class" ariaLabel="Custom">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should render icon children', () => {
    render(
      <IconButton ariaLabel="Icon">
        <TestIcon />
      </IconButton>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should have proper flex classes for centering icon', () => {
    render(
      <IconButton ariaLabel="Centered">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('should have focus styles', () => {
    render(
      <IconButton ariaLabel="Focusable">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('focus:outline-none', 'focus:ring-2');
  });

  it('should render with correct base classes', () => {
    render(
      <IconButton ariaLabel="Base">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-2', 'rounded-lg', 'transition-colors');
  });

  it('should handle keyboard interaction', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <IconButton onClick={handleClick} ariaLabel="Keyboard">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    
    button.focus();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should require ariaLabel prop for accessibility', () => {
    // TypeScript would catch this at compile time, but we test the runtime behavior
    render(
      <IconButton ariaLabel="Accessible">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Accessible');
  });

  it('should accept other HTML button attributes', () => {
    render(
      <IconButton 
        ariaLabel="Custom" 
        data-testid="custom-icon-button"
        tabIndex={0}
      >
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByTestId('custom-icon-button');
    expect(button).toHaveAttribute('tabIndex', '0');
  });

  it('should handle multiple clicks', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <IconButton onClick={handleClick} ariaLabel="Multiple">
        <TestIcon />
      </IconButton>
    );
    const button = screen.getByRole('button');
    
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(3);
  });
});
