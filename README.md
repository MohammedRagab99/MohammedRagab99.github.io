# Mohammed Ragab Al-Attar — Dynamic GitHub Portfolio

A responsive, vanilla HTML/CSS/JavaScript portfolio designed for GitHub Pages.

## Why this structure is easy to maintain

The layout lives in:

- `index.html`
- `style.css`
- `script.js`

Your editable portfolio content lives almost entirely in:

- `data.js`

To add a certificate, add one object to `portfolioData.certificates`.
To add a project, add one object to `portfolioData.projects`.
To add experience, edit `portfolioData.experience`.
To change skills/tools, edit `portfolioData.skills` and `portfolioData.tools`.

No framework, build step, npm install or backend is required.

## Recommended repository

Because the GitHub account in the provided screenshot is `MohammedRagab99`, the user site can be published from:

`MohammedRagab99/MohammedRagab99.github.io`

## GitHub Pages setup

1. Upload the contents of this folder into the repository.
2. Put your real CV PDF at:
   `assets/documents/Mohammed_Ragab_CV.pdf`
3. Put certificate images in:
   `assets/images/certificates/`
4. Put project images in:
   `assets/images/projects/`
5. Open repository **Settings → Pages**.
6. Choose GitHub Actions or the branch/folder source shown by GitHub for your repository.
7. Visit the published GitHub Pages URL.

## Adding a certificate

Edit `data.js`:

```js
{
  title: "My Certificate",
  provider: "Provider Name",
  year: "2026",
  category: "reliability",
  image: "assets/images/certificates/my-certificate.jpg"
}
```

Valid certificate categories used by the filters:

- `reliability`
- `oil-gas`
- `programming`
- `energy`
- `design`
- `aerospace`

## Adding a project

```js
{
  title: "My Engineering Project",
  category: "programming",
  tag: "PYTHON",
  description: "One paragraph explaining the engineering problem and result.",
  image: "assets/images/projects/project.jpg",
  repo: "https://github.com/MohammedRagab99/my-project"
}
```

Valid project categories:

- `reliability`
- `energy`
- `programming`
- `design`
- `aerospace`

## Important

Do not upload confidential refinery drawings, proprietary machine data, internal reports, passwords, API keys, or company-sensitive photographs.

## Local preview

Double-clicking `index.html` should work for most features.

For best results, use a local static server or GitHub Pages so all paths behave exactly as they will online.
