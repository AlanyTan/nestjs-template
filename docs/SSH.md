# SSH setup

Start SSH agent:

```bash
eval "$(ssh-agent -s)"
```

Generate a Codespaces specific SSH key:

```bash
ssh-keygen -t rsa -b 4096 -C "codespaces@acerta.ai"
```

You can use the default file name and no passphrase.

Add the key to the SSH agent:

```bash
ssh-add ~/.ssh/id_rsa
```

Add the SSH key in `~/.ssh/id_rsa.pub` to your GitHub settings under _SSH and GPG keys_. In GitHub, _Configure SSO_ for the added key.

If you want to reuse the same SSH key in multiple codespaces, copy both files from the codespace.
When you copy them, you will need to set the right permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_rsa
chmod 644 ~/.ssh/id_rsa.pub
```

To test the conection to GitHub:

```bash
ssh -T git@github.com
```

Write `yes`, when asked if you are sure you want to continue connecting.

To automatically setup your key after initial creation, add this to your `.bashrc`:

```bashg
if ! grep -q "(ssh-agent -s)" ~/.bashrc; then
  echo 'if [ -z "$SSH_AUTH_SOCK" ]; then eval "$(ssh-agent -s) >/dev/null 2>&1"; fi && ssh-add ~/.ssh/id_rsa >/dev/null 2>&1' >> ~/.bashrc
fi
```
