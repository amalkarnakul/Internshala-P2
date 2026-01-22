import React, { forwardRef, useCallback } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onToggle: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  placeholder: string;
  disabled: boolean;
  isOpen: boolean;
  isLoading: boolean;
  'aria-activedescendant'?: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    {
      value,
      onChange,
      onToggle,
      onKeyDown,
      placeholder,
      disabled,
      isOpen,
      isLoading,
      'aria-activedescendant': ariaActiveDescendant,
    },
    ref
  ): JSX.Element {
    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
      },
      [onChange]
    );

    const handleInputKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle special keys for combobox behavior
        switch (event.key) {
          case 'ArrowDown':
            event.preventDefault();
            if (!isOpen) {
              onToggle();
            } else {
              onKeyDown(event);
            }
            break;
          case 'ArrowUp':
            if (isOpen) {
              event.preventDefault();
              onKeyDown(event);
            }
            break;
          case 'Escape':
          case 'Tab':
            onKeyDown(event);
            break;
          case 'Enter':
            if (isOpen) {
              onKeyDown(event);
            }
            break;
          default:
            onKeyDown(event);
            break;
        }
      },
      [isOpen, onToggle, onKeyDown]
    );

    const handleButtonClick = useCallback(() => {
      if (!disabled) {
        onToggle();
      }
    }, [disabled, onToggle]);

    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-autocomplete="list"
          aria-activedescendant={ariaActiveDescendant}
          className={`
            w-full px-3 py-2 pr-10 text-sm border rounded-md
            transition-colors duration-150
            ${
              disabled
                ? 'bg-neutral-100 border-neutral-300 text-neutral-500 cursor-not-allowed'
                : 'bg-white border-neutral-300 text-neutral-900 hover:border-neutral-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'
            }
            ${isOpen ? 'border-primary-500 ring-1 ring-primary-500' : ''}
          `}
          data-testid="search-input"
        />

        {/* Toggle button */}
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={disabled}
          aria-label={isOpen ? 'Close options' : 'Open options'}
          className={`
            absolute right-1 top-1/2 transform -translate-y-1/2
            w-8 h-8 flex items-center justify-center rounded-sm
            transition-colors duration-150
            ${
              disabled
                ? 'text-neutral-400 cursor-not-allowed'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus-visible'
            }
          `}
          tabIndex={-1}
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <svg
              className={`w-4 h-4 transition-transform duration-150 ${
                isOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </button>
      </div>
    );
  }
);