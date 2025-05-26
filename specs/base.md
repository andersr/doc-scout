# Base Instructions

Follow these guidelines for all development tasks to ensure code quality, maintainability, and consistency.

## Code Quality

### General Principles

- Write self-documenting code with meaningful variable and function names
- Keep code DRY (Don't Repeat Yourself) - extract repeated logic into reusable functions
- Use meaningful constants instead of magic numbers or strings
- Follow the single responsibility principle - each function should do one thing well
- Prefer composition over inheritance
- Handle edge cases and error conditions explicitly

### Comments and Documentation

- Avoid comments that explain _what_ the code does - the code should be self-explanatory
- Only if needed, add comments to explain _why_ a piece of code was added if not self-evident from the code itself
- Document public APIs and complex algorithms
- Keep comments up-to-date with code changes

### Type Safety

- Avoid type assertions (`as` keyword) unless absolutely necessary
- When type assertions are required, add a comment explaining the reasoning
- Avoid use of the "any" type. Try to use "unknown" instead. If using any is unavoidable, add a comment explaining why it is needed and also add a eslint disable no-explicit-any for that line
- Prefer type guards and runtime validation over type assertions
- Use strict TypeScript configuration

## Styling and UI

### Tailwind CSS

- Include `cursor-pointer` class on all interactive buttons
- Use consistent spacing scale (prefer `space-y-4`, `gap-4`, etc.)
- Leverage Tailwind's design tokens for colors, spacing, and typography
- Use responsive design classes (`sm:`, `md:`, `lg:`) for mobile-first design
- Group related classes logically: layout, spacing, colors, typography, effects

### Accessibility

- Include proper ARIA labels and roles
- Ensure sufficient color contrast ratios
- Support keyboard navigation
- Use semantic HTML elements
- Test with screen readers when possible

### Component Design

- Create reusable UI components in `app/components/ui/`
- Follow consistent naming conventions for props
- Use TypeScript interfaces for component props
- Implement proper loading and error states

## Testing

### Unit Testing

- Write unit tests for all new functionality using Vitest and React Testing Library
- Aim for high test coverage, especially for business logic
- Test both happy paths and error conditions
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks

### Test Structure

- Follow the Arrange-Act-Assert pattern
- Mock external dependencies appropriately
- Use test utilities for common setup operations
- Keep tests isolated and independent

### Integration Testing

- Test user workflows end-to-end with Playwright
- Focus on critical user journeys
- Test across different browsers and devices

## Imports and Dependencies

- import modules and make the corresponding updates at the same time

### Import Organization

- Import React without default alias: `import React from "react"`
- Use named imports when importing specific functions or components
- Avoid wildcard imports unless necessary
- Add files in folders to index files to allow for cleaner "barrel" imports. Only do this for folders that contain a small number of files.

### Dependency Management

- Keep dependencies up-to-date and audit regularly
- Prefer smaller, focused libraries over large frameworks
- Document any unusual or complex dependencies

## Development Workflow

### Commands

- Use `npm run dev` to run both the dev server and unit test runner
- Use `npm run build` to create production builds
- Use `npm run test` to run tests in CI mode
- Use `npm run lint` to check code quality

## Forms and Validation

### Schema Validation

- Use Zod schemas for all form validation
- Apply validation on both client and server sides
- Create reusable validation schemas in `app/lib/schemas/`
- Provide clear, user-friendly error messages

### Form Handling

- Use React Hook Form for complex forms
- Implement proper loading states during submission
- Handle both success and error scenarios
- Provide immediate feedback for user actions

## State Management

### Component State

- Prefer React hooks over Context API for local state
- Use `useState` for simple component state
- Use `useReducer` for complex state logic
- Lift state up only when necessary

### Global State

- Use Context API sparingly, only for truly global state
- Consider state management libraries for complex applications
- Keep state as close to where it's used as possible
- Avoid prop drilling by restructuring components when needed

## Performance

### React Optimization

- Use `React.memo` for expensive components that re-render frequently
- Implement proper dependency arrays in `useEffect` and `useMemo`
- Avoid creating objects and functions in render methods
- Use `useCallback` for event handlers passed to child components

### Bundle Optimization

- Implement code splitting for large routes
- Optimize images and assets
- Use lazy loading for non-critical components
- Monitor bundle size and performance metrics

## Security

### Data Handling

- Validate all user inputs on both client and server
- Use Zod schemas for validation whenever possible
- Sanitize data before displaying or storing
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization

### API Security

- Use HTTPS for all API communications
- Implement rate limiting
- Validate API keys and tokens
- Log security-relevant events

## Error Handling

### Client-Side Errors

- Implement error boundaries for React components
- Provide meaningful error messages to users
- Log errors for debugging purposes
- Gracefully degrade functionality when possible

### Server-Side Errors

- Return appropriate HTTP status codes
- Log errors with sufficient context
- Avoid exposing sensitive information in error messages
- Implement proper error recovery mechanisms

## File Organization

### Project Structure

- Keep related files close together
- Use consistent naming conventions
- Separate concerns (components, hooks, utilities, types)

### Naming Conventions

- Use PascalCase for React components
- Use camelCase for functions and variables
- Match file names to their content, ie camelCase for functions and PascalCase for React components
- Use UPPER_CASE for constants
