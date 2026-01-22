import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('should render input with label', () => {
    render(<Input label="TÍTULO" id="test-input" />);
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
  });

  it('should render label in uppercase', () => {
    render(<Input label="Title" id="test-input" />);
    const label = screen.getByText(/title/i);
    expect(label).toHaveClass('uppercase');
  });

  it('should have correct label classes', () => {
    render(<Input label="LABEL" id="test-input" />);
    const label = screen.getByText(/label/i);
    expect(label).toHaveClass('text-xs', 'uppercase', 'text-gray-400');
  });

  it('should show required indicator when required', () => {
    render(<Input label="REQUIRED" id="test-input" required />);
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
    expect(asterisk).toHaveClass('text-danger');
  });

  it('should not show required indicator when not required', () => {
    render(<Input label="NOT REQUIRED" id="test-input" />);
    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should render placeholder', () => {
    render(<Input label="INPUT" id="test-input" placeholder="Placeholder text" />);
    const input = screen.getByPlaceholderText(/placeholder text/i);
    expect(input).toBeInTheDocument();
  });

  it('should display input value', () => {
    render(<Input label="INPUT" id="test-input" value="Test value" onChange={() => {}} />);
    const input = screen.getByDisplayValue(/test value/i);
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when input value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<Input label="INPUT" id="test-input" onChange={handleChange} />);
    const input = screen.getByLabelText(/input/i);
    
    await user.type(input, 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should display error message when error prop is provided', () => {
    render(<Input label="INPUT" id="test-input" error="Error message" />);
    expect(screen.getByText(/error message/i)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should apply error styles when error is present', () => {
    render(<Input label="INPUT" id="test-input" error="Error" />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toHaveClass('border-danger');
  });

  it('should apply default border styles when no error', () => {
    render(<Input label="INPUT" id="test-input" />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toHaveClass('border-gray-200');
  });

  it('should have correct input classes', () => {
    render(<Input label="INPUT" id="test-input" />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toHaveClass(
      'w-full',
      'px-4',
      'py-2',
      'rounded-lg',
      'border-2',
      'transition-colors',
      'text-md'
    );
  });

  it('should have focus styles', () => {
    render(<Input label="INPUT" id="test-input" />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toHaveClass('focus:outline-none', 'focus:ring-blue-base');
  });

  it('should have focus styles for error state', () => {
    render(<Input label="INPUT" id="test-input" error="Error" />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toHaveClass('focus:border-danger', 'focus:ring-danger');
  });

  it('should have correct aria attributes when error is present', () => {
    render(<Input label="INPUT" id="test-input" error="Error message" />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
  });

  it('should link error message with input via aria-describedby', () => {
    render(<Input label="INPUT" id="test-input" error="Error" />);
    const input = screen.getByLabelText(/input/i);
    const errorMessage = screen.getByRole('alert');
    
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error');
    expect(errorMessage).toHaveAttribute('id', 'test-input-error');
  });

  it('should have correct error message classes', () => {
    render(<Input label="INPUT" id="test-input" error="Error" />);
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toHaveClass('text-xs', 'text-danger');
  });

  it('should accept custom className', () => {
    render(<Input label="INPUT" id="test-input" className="custom-class" />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toHaveClass('custom-class');
  });

  it('should accept other HTML input attributes', () => {
    render(
      <Input 
        label="INPUT" 
        id="test-input"
        type="email"
        autoComplete="email"
        maxLength={100}
      />
    );
    const input = screen.getByLabelText(/input/i);
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('autocomplete', 'email');
    expect(input).toHaveAttribute('maxLength', '100');
  });

  it('should be required when required prop is true', () => {
    render(<Input label="INPUT" id="test-input" required />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toBeRequired();
  });

  it('should not be required when required prop is false', () => {
    render(<Input label="INPUT" id="test-input" required={false} />);
    const input = screen.getByLabelText(/input/i);
    expect(input).not.toBeRequired();
  });

  it('should work with forwardRef', () => {
    const ref = vi.fn();
    render(<Input label="INPUT" id="test-input" ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });

  it('should handle controlled input', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(
      <Input 
        label="INPUT" 
        id="test-input" 
        value="controlled"
        onChange={handleChange}
      />
    );
    const input = screen.getByLabelText(/input/i) as HTMLInputElement;
    
    expect(input.value).toBe('controlled');
    await user.clear(input);
    await user.type(input, 'new value');
    expect(handleChange).toHaveBeenCalled();
  });

  it('should handle uncontrolled input', async () => {
    const user = userEvent.setup();
    
    render(<Input label="INPUT" id="test-input" defaultValue="uncontrolled" />);
    const input = screen.getByLabelText(/input/i) as HTMLInputElement;
    
    expect(input.value).toBe('uncontrolled');
    await user.clear(input);
    await user.type(input, 'new value');
    expect(input.value).toBe('new value');
  });

  it('should have proper label htmlFor attribute', () => {
    render(<Input label="INPUT" id="test-input" />);
    const label = screen.getByText(/input/i);
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('should display error icon in error message', () => {
    render(<Input label="INPUT" id="test-input" error="Error" />);
    const errorMessage = screen.getByRole('alert');
    const icon = errorMessage.querySelector('.bg-danger.rounded-full');
    expect(icon).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(<Input label="INPUT" id="test-input" disabled />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toBeDisabled();
  });

  it('should handle readonly state', () => {
    render(<Input label="INPUT" id="test-input" readOnly />);
    const input = screen.getByLabelText(/input/i);
    expect(input).toHaveAttribute('readonly');
  });
});
