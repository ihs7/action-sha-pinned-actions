# Contributing to GitHub Action: Enforce Full SHA Commit Pinning in GitHub Actions

Thank you for your interest in contributing to this project! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct: be respectful, considerate, and collaborative.

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) (version specified in `.bun-version`)
- Git

### Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/action-sha-pinned-actions.git
   cd action-sha-pinned-actions
   ```
3. Add the original repository as a remote to keep your fork in sync:
   ```bash
   git remote add upstream https://github.com/ihs7/action-sha-pinned-actions.git
   ```
4. Install dependencies:
   ```bash
   bun install
   ```
5. Run the development commands:
   ```bash
   bun run build     # Build the project
   bun run format    # Format code
   bun run lint      # Run linting
   bun run test      # Run tests
   bun run all       # Run all of the above
   ```

## Keeping Your Fork Updated

Before starting work on a new contribution, ensure your fork is up to date:

```bash
git checkout main
git pull upstream main
git push origin main
```

## Project Structure

- `src/` - Source code for the action
- `__tests__/` - Test files
- `.github/workflows/` - GitHub Actions workflow files
- `dist/` - Built files (generated when running `bun run build`)

## Coding Standards

This project uses [Biome](https://biomejs.dev/) for code formatting and linting:

- All code must pass the linting rules
- Ensure all tests pass before submitting a pull request
- Write tests for new functionality

## Making Changes

1. Create a new branch for your changes from the updated main branch:
   ```bash
   git checkout -b your-feature-branch
   ```

2. Make your changes. Be sure to:
   - Write clear, descriptive commit messages
   - Follow the coding style and standards
   - Include tests for new features
   - Update documentation as needed

3. Run tests and linting to ensure quality:
   ```bash
   bun run all
   ```

4. Commit your changes with a descriptive commit message:
   ```bash
   git commit -m "Add feature: description of your changes"
   ```

5. Push your changes to your fork:
   ```bash
   git push origin your-feature-branch
   ```

## Pull Request Process

1. Go to the original repository on GitHub and click "New pull request"

2. Select "compare across forks" and select your fork and branch

3. Ensure your PR includes:
   - A clear title and description of the changes
   - Any related issue numbers using keywords like "Fixes #123" or "Resolves #123"
   - Documentation updates if applicable
   - Test coverage for new functionality

4. After submitting your PR:
   - Respond to any feedback or requested changes
   - Make additional commits to your branch if needed
   - The maintainers will review your PR and either merge it, request changes, or close it with an explanation

5. The version numbers will be updated as part of the release process

## Helpful Resources for First-Timers

- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [About Pull Requests](https://help.github.com/articles/about-pull-requests/)

## Style Guide

- Write clear, readable, and well-documented code
- Include comments where necessary
- Follow the existing code style
- Use meaningful variable and function names

## Release Process

The project maintainers will handle the release process, which includes:

1. Creating a version PR using the `create-version-pr.yml` workflow
2. Once merged, tagging and releasing using the `tag-and-release.yml` workflow

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

## Questions?

If you have questions or need help, feel free to open an issue and ask for guidance.

Thank you for contributing!
