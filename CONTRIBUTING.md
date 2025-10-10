# Contributing to Better LinkedIn

Thank you for your interest in contributing to Better LinkedIn! I welcome contributions from the community and appreciate your effort to make this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [Code Contributions](#code-contributions)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please:

- Be respectful and considerate in your communication
- Welcome newcomers and help them get started
- Accept constructive criticism gracefully
- Focus on what is best for the community and the project

## How Can I Contribute?

There are several ways you can contribute to Better LinkedIn:

### Reporting Bugs

If you find a bug, please create an issue with the following information:

- **Clear title** describing the problem
- **Detailed description** of the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details**:
  - Browser name and version
  - Tampermonkey version
  - Operating system
  - LinkedIn page URL where the issue occurs

### Suggesting Enhancements

When suggesting an enhancement:

- Check if the feature has already been suggested
- Provide a clear and detailed explanation of the feature
- Explain why this feature would be useful
- Include examples of how the feature would work

### Code Contributions

Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch** from `main`
3. **Make your changes**
4. **Test thoroughly** in multiple browsers if possible
5. **Submit a pull request**

## Style Guidelines

### JavaScript Code Style

- Use **ES6+ syntax** where appropriate
- Use **meaningful variable names**
- Keep functions **small and focused**
- Add **comments** for complex logic
- Use **const** and **let** instead of **var**
- Follow **camelCase** naming convention

Example:
```javascript
// Good
const hiddenPosts = new Set();

function hidePromotedPost(postElement) {
    if (!postElement) return;
    postElement.style.display = 'none';
}

// Avoid
var hidden_posts = new Set();

function hide(p) {
    p.style.display = 'none';
}
```

### Code Organization

- Group related functionality together
- Separate concerns (filtering, hiding, observing)
- Keep the main script logic clean and readable

### Testing

Before submitting your contribution:

- Test on LinkedIn's feed page
- Verify promoted posts are hidden correctly
- Test keyword filtering functionality
- Check that the script doesn't break LinkedIn's functionality
- Test in at least two different browsers (Chrome and Firefox recommended)

## Commit Messages

Write clear and descriptive commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 50 characters
- Add detailed description after a blank line if needed

Examples:
```
Good commit messages:
- Add support for filtering by multiple keywords
- Fix promoted posts appearing after scroll
- Improve performance of DOM observer
- Update README with installation instructions

Bad commit messages:
- fixed stuff
- updates
- asdfg
- Changed some code
```

## Pull Request Process

1. **Update documentation** if you're adding new features
2. **Update the README.md** with details of changes if needed
3. **Reference any related issues** in your PR description
4. **Provide a clear description** of what your PR does
5. **Wait for review** - a maintainer will review your PR

### Pull Request Template

When creating a pull request, please include:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Enhancement
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots to demonstrate the changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have tested my changes
- [ ] I have updated the documentation
- [ ] My changes don't break existing functionality
```

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with your question
- Check existing issues and discussions
- Review the README.md for project details

## License

By contributing to Better LinkedIn, you agree that your contributions will be licensed under the same [CC BY-NC 4.0 license](https://creativecommons.org/licenses/by-nc/4.0/) as the project.

---

Thank you for contributing to Better LinkedIn! Your efforts help make LinkedIn a better experience for everyone.
