# GitHub Action: Enforce Full SHA Commit Pinning in GitHub Actions

This action enforces that all third-party GitHub Actions used in your workflows are pinned to full SHA commits rather than tags or branch names. This is a security best practice to prevent supply chain attacks.

## Usage

```yaml
name: CI
on: [push]

jobs:
  enforce-sha:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
      - uses: ihs7/action-sha-pinned-actions@56a520491ac872504b268a39eacaaf729f7ea20a # v0.1.0
```

## Inputs

| Input               | Description                                               | Required | Default             |
| ------------------- | --------------------------------------------------------- | -------- | ------------------- |
| `workflows-path`    | Path to workflows directory                               | Yes      | `.github/workflows` |
| `fail-on-violation` | Whether to fail the action if violations are found        | Yes      | `true`              |
| `exclude`           | Patterns to exclude from checking                         | Yes      | ``                  |

### Exclude Patterns

The `exclude` input can be provided in two formats:

1. **Comma-separated list**:
   ```yaml
   exclude: azure/,actions/checkout
   ```

2. **Multi-line format with comments**:
   ```yaml
   exclude: |
     azure/          # Exclude all azure actions from check
     actions/checkout   # Exclude actions/checkout action from check
   ```

## Examples of Valid and Invalid SHA Pinning

### ✅ Allowed - Full SHA Pinning

```yaml
# Full SHA (40 characters)
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2

# Local actions (relative paths)
- uses: ./
- uses: ./my-local-action
- uses: ../another-repo-action
```

### ❌ Not Allowed - Non-SHA References

```yaml
# Tag references
- uses: actions/checkout@v4
- uses: actions/setup-node@v3.8.1

# Branch references
- uses: some-org/action@main
- uses: other-org/action@develop

# Short SHA (less than 40 characters)
- uses: actions/checkout@11bd719

# Malformed references without @
- uses: actions/checkout-v4
```

## Why Pin to SHA?

Pinning an action to a full length commit SHA is currently the **only way** to use an action as an immutable release. This is critical for maintaining security in your CI/CD pipeline for several reasons:

1. **Prevents Moving Targets**: Tags like `actions/checkout@v4` or branch references like `some-org/action@main` can be updated to point to different commits at any time.

2. **Protects Against Supply Chain Attacks**: If a repository is compromised, an attacker could inject malicious code into a tagged version.

3. **Cryptographic Verification**: Using full-length SHAs helps mitigate the risk as bad actors would need to generate a SHA-1 collision for a valid Git object payload.

4. **Ensures Reproducibility**: You'll always get the exact same code running in your workflows.

By pinning to a full SHA commit hash (e.g., `actions/checkout@a12a3456b78912345c6d78912345d6e7f8901234`), you ensure the exact version of the action is used.

## Best Practices

- Always verify that the SHA comes from the original action repository, not a fork
- Use the full 40-character SHA, not the shortened version
- Periodically review and update your pinned SHAs to get security updates
- Consider using a dependency update tool like Dependabot to help manage updates

## How to Update from Tags to SHAs

1. Find the action in the [GitHub Marketplace](https://github.com/marketplace?type=actions)
2. Navigate to the action's repository
3. Find the specific tag you're using (e.g., `v4`)
4. Get the full SHA for that tag, which is displayed on the tag's page
5. Replace the tag reference with the full SHA in your workflow file

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

## License

MIT
