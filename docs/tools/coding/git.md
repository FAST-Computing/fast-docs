---
outline: deep
---

# <img src="/logos/githublogo.png" style="display: inline-block; vertical-align: middle; height: 48px; margin-right: 8px;"> Git / GitHub

Git is the engine under the hood, and GitHub is the shiny showroom where everyone sees your work. Mastering a handful of core commands will handle 90% of your daily workflow.

## Installation

### Arch Linux 

```bash
pacman -S git
```

## SSH Key

You will need an SSH key so that your computer and GitHub will have a "secret handshake" that identifies you automatically, without needing any further authentication.

**1. Generate the key**

The following command will ask "Enter file in which to save the key." Just hit Enter to accept the default location.

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

**2. Copy the Public Key**

```bash
cat ~/.ssh/id_ed25519.pub 
```

(then manually highlight and copy the text)

**3. Add the Key to GitHub**

Login to **GitHub**, and go to **Settings**. In the left sidebar, click **SSH and GPG keys**. Then, click the green **New SSH key** button. Give it a title, paste your key and click **Add SSH key**.

**4. Test the Connection**

```bash
ssh -T git@github.com
```

If you see *"Hi [YourUsername]! You've successfully authenticated"*, everything is set and you are ready to go.


## Repository Initialization

- `git clone <URL>`: Download an existing GitHub repository to your computer

![Git URL](/gitremote.png)
You can get the required URL pushing the green "Code" button and copying the SSH URL.

- `git init`: Git initialization in current folder
- `git remote add origin <URL>`: Connect the local repository to the GitHub one


## Core Workflow

Think of Git as a three-stage process for saving your work. You move files from your folder to a "staging area" before finally sealing them into the permanent history (the repository).

- `git add <file>`: Move changes to the Staging Area. Use `git add .` to stage everything instead.
- `git commit -m "Your message"`: Record the staged changes permanently. Remember, keep messages descriptive (e.g., "Fix login button styling").

However, you would normally like to work on your, personal branch, unless stated otherwise. Branches allow you to work on new features without breaking the "Main" (stable) version of the project.

- `git checkout -b <branch_name>`: Create and switch to a new branch.

![Branch check](/branchcheck.png)
In VSCode, you can monitor the branch you're working in by looking at the bottom left of the screen.

- `git status`: A very helpful command you can always run to check files status and the current branch.

## Pushing to GitHub

To share your code, you need to link your local folder to the remote repository on GitHub.

- `git push -u origin main`: Send your local commits to GitHub. The `-u` flag remembers your preferences for next time.
- `git pull`: Grab the latest changes from GitHub and merge them into your local files. Use this often to stay up to date with workmates. Alternatively, you can use `git fetch` and then `git merge` to have a safe peek at the changes before merging in.

## Pull Requests

A **Pull Request** (PR) isn't a Git command; it’s a GitHub feature. It’s a formal request to merge your branch into the main project and you can do it by going to the GitHub repository page. It allows for:

- Code Review: Others can comment on specific lines.
- Testing: Automated tools can check if your code breaks anything.
- Discussion: A place to talk about why the changes were made.