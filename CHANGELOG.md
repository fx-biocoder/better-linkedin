# Better LinkedIn Changelog

## v3.0.1

- Fixed a long standing issue where the extension didn't work until reloading the page manually. LinkedIn is a single page application, so `manifest.json` needs to include `https://www.linkedin.com/` for the content script `content-feed.js` to be properly loaded when the user navigates to https://linkedin.com instead of https://linkedin.com/feed

## v3.0.0

- **Major Update:** Full Internationalization (i18n) support added for English, Spanish, Portuguese, and Italian across the entire extension.
- **New Feature:** Added Private Notes and Tags functionality for LinkedIn profiles.
- **New Feature:** Added advanced dashboard filters for more granular control over your feed and profile visibility.
- Added new onboarding pages (`welcome.html` and `whats-new.html`) with a premium dark mode design to welcome new users and announce updates.
- Added `background.js` Service Worker to manage installation and version update events.
- Updated `PRIVACY_POLICY.md` to clarify the integration of third-party services like Truthscan for AI image detection, ensuring no user data is shared.

## v2.2.0

- This new version is licensed under GPL v3.0.
- New content script `content-jobs.js` for blocking promoted jobs at https://linkedin.com/jobs/. The old content script has been renamed to `content-feed.js`.
- CSS files `donations.css` and `popup.css` were moved to the `styles/` directory.

## v2.1.1

- Small update for blocking suggested posts in Spanish.

## v2.1.0

- New experimental filter to remove AI-generated posts
- New filter to remove suggested posts
- New filter to remove posts containing emojis
- Add landing page button
- Add workflow to upload the extension to Google Developer Dashboard
