# Contributing to serverless-scripting-examples

If you're reading this, it seems likely you're interested in contributing to our 
serverless scripting examples. Thanks a lot! We think that's awesome! Below are 
some guidelines to help you get started along with some expectations and tips to 
make the process easier.

Bug reports and pull requests (PRs) are welcome.

Before coding any new features or substantial changes, please 
[open a feature request](https://github.com/stackpath/serverless-scripting-examples/issues/new) 
to discuss the proposed changes and benefits provided to the project.

PRs comprised of whitespace fixes, code formatting changes, or other purely 
cosmetic changes are unlikely to be merged.

## Bugs

**Do not open a GitHub issue if the bug is a security vulnerability;** instead, 
email [security@stackpath.com](mailto:security@stackpath.com).

Before opening an issue, ensure the bug hasn't 
[already been reported](https://github.com/stackpath/serverless-scripting-examples/issues). 
If not, [open a new bug report](https://github.com/stackpath/serverless-scripting-examples/issues/new) 
with details demonstrating the unexpected behavior.

PRs are welcome if you've written a patch for a bug.

## Pull request guidelines

Please ensure the following when submitting a pull request against the project.

* A single commit should implement a single logical change.
* Code should match the surrounding style conventions. 
* There should be no commented out code or unneeded files.
* Documentation should be updated or extended for behavior changes or feature 
  additions.
* The commit message should be meaningful. We encourage use of the 
  [50/72 rule](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html) 
  in your commit message.

For example, here is a meaningful commit message:
```
Fix an issue serializing script id lists to JSON
```

To contrast, here is an example of of a poor commit message. Note that it says 
literally what changed, but provides no context to readers.
```
Update index.js.
```

## Opening a pull request

Please follow this process to open a pull request against this project:

* Fork the project to your personal or organizational GitHub account.
* Clone your fork.
* Create a feature branch within your fork to be used for this PR.
* Make your code updates following the guidelines above.
* Commit your changes.
* Push your feature branch to your fork.
* Open a pull request for the feature branch in your fork against the main project.

For further assistance in opening a PR, see the 
[GitHub PR documentation](https://help.github.com/articles/about-pull-requests/).
