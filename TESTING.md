# Testing Guide

This project uses **Vitest** for unit testing with comprehensive test coverage for the AI scoring system.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (default)
pnpm test

# Run tests once
pnpm test:run

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage
```

## Test Structure

Tests are located next to the files they test in `__tests__` directories: