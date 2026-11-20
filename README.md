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

## Site structure

- **Home** introduces the portfolio and links to the main pages.
- **Work**, **Research**, and **Credentials** contain the original engineering content, projects, research and certifications.
- **Studio** contains the characters, episode filters, and content pillars.
- **Contact** links to the personal Outlook address and the Ain Shams University Faculty of Engineering site and email. The contact form prepares a draft in the visitor's email client.

## Connect the Studio archive to Google Sheets

1. Create a tab named **Public Episodes** in a Google Sheet. In columns A–D, use the headers `ep`, `status`, `date`, and `youtubeId`. For example, a row can start with `1, planned`. Allowed statuses are `planned`, `filming`, and `published`; dates use `YYYY-MM-DD` and video IDs are 11 characters.
2. In Google Apps Script, copy the contents of `integrations/episode-feed.gs` into your project. Add the spreadsheet ID as the `EPISODE_SHEET_ID` script property.
3. Deploy the script as a [web app](https://developers.google.com/apps-script/guides/web) running as the owner with anonymous read access, if the account permits it. Open the deployment's `/exec` URL in a signed-out session to verify it returns JSON.
4. Set `portfolioData.integrations.episodeFeedUrl` in `data.js` to that URL. The site reads only matching episode statuses, public dates and published video IDs. Episode titles and descriptions remain in `data.js`. The original archive is available if Google is unreachable.

Keep the spreadsheet private. The web app exposes the four fields above publicly, so use this tab for release metadata. Contact messages travel through the visitor's email app.

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
