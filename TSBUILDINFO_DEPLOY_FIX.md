# `tsbuildinfo` Deploy Fix

## What caused the VPS `git pull` failure

The deploy server was failing on `git pull` because these generated TypeScript cache files were tracked by Git:

- `frontend/tsconfig.tsbuildinfo`
- `frontend/tsconfig.node.tsbuildinfo`

When `npm run build` runs on the VPS, TypeScript rewrites those files locally. On the next deploy, `git pull` sees local changes and refuses to overwrite them.

That is why Git showed an error like:

```text
error: Your local changes to the following files would be overwritten by merge:
  frontend/tsconfig.tsbuildinfo
```

## Repo fix applied

The repository now ignores:

```gitignore
*.tsbuildinfo
```

This prevents future generated `tsbuildinfo` files from being committed again.

## One-time cleanup in Git

Ignoring the files is not enough by itself if they were already tracked in older commits. Remove them from Git tracking once:

```bash
git rm --cached frontend/tsconfig.tsbuildinfo frontend/tsconfig.node.tsbuildinfo
git commit -m "Stop tracking tsbuildinfo files"
git push
```

`--cached` removes them from Git tracking only. It does not delete your working copy.

## One-time cleanup on the VPS

After pulling the commit that removes the tracked files, use the normal deploy flow:

```bash
cd /var/www/music_chords && git pull && npm ci && npm run build && pm2 restart music-chords-api --update-env
```

If the VPS is already stuck before that commit is pulled, clear the tracked local copies first:

```bash
cd /var/www/music_chords
git restore frontend/tsconfig.tsbuildinfo frontend/tsconfig.node.tsbuildinfo
git pull
```

If `git restore` is unavailable or those files are not present in the current checkout, remove the local generated copies and pull again:

```bash
cd /var/www/music_chords
rm -f frontend/tsconfig.tsbuildinfo frontend/tsconfig.node.tsbuildinfo
git pull
```

## Recommended deploy command

Use a fail-fast command so later steps do not run after a failed pull:

```bash
cd /var/www/music_chords && git pull && npm ci && npm run build && pm2 restart music-chords-api --update-env
```
