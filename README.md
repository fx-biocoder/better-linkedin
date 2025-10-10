# Better LinkedIn

A Tampermonkey userscript that automatically hides promoted posts and allows you to filter out posts containing specific keywords on LinkedIn.

## Features

- Automatically hides all promoted posts (posts with "Promoted" tag)
- Filter posts by custom keywords
- Works automatically as you scroll through your LinkedIn feed
- Clean and distraction-free LinkedIn experience

## Requirements

- A web browser (Chrome, Firefox, Edge, Safari, or Opera)
- [Tampermonkey](https://www.tampermonkey.net/) extension installed

## Installation

### Step 1: Install Tampermonkey

Download and install Tampermonkey for your browser:
- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- [Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089)
- [Opera](https://addons.opera.com/en/extensions/details/tampermonkey-beta/)

### Step 2: Enable Developer Mode (Chrome Users Only)

**Important for Chrome users:** Before using the script, you need to enable Developer Mode and user scripts:

1. Open Chrome and go to `chrome://extensions/`
2. Toggle **Developer mode** ON (switch in the top-right corner)
3. Click on the Tampermonkey extension details
4. Scroll down and ensure **user scripts** are enabled

### Step 3: Install the Script

1. Click on the Tampermonkey icon in your browser
2. Select "Create a new script"
3. Copy and paste the Better LinkedIn script
4. Save the script (File → Save or Ctrl+S / Cmd+S)

### Step 4: Configure (Optional)

To filter posts by specific keywords:

1. Open the script in Tampermonkey editor
2. Find the `muteWords` set in the script
3. Add your desired keywords to filter
4. Save the script

Example:
```javascript
const mutedWords = new Set(["lorem", "ipsum", "etcetera..."]);
```

## Usage

Once installed and configured:

1. Navigate to [LinkedIn](https://www.linkedin.com/feed/)
2. The script will automatically run and hide:
   - All promoted posts
   - Posts containing your specified keywords
3. Scroll through your feed as usual

The script works in real-time, continuously monitoring for new posts as they load.

## Troubleshooting

**Script not working?**
- Make sure Tampermonkey is enabled
- Check that the script is enabled in Tampermonkey dashboard
- For Chrome users: Verify Developer Mode and user scripts are enabled
- Try refreshing the LinkedIn page
- Check browser console for any errors (F12 → Console tab)

**Some promoted posts still showing?**
- LinkedIn may change their HTML structure occasionally
- Report this issue [HERE](https://github.com/fx-biocoder/better-linkedin/issues)

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).

## Disclaimer

This is an unofficial userscript and is not affiliated with, endorsed by, or connected to LinkedIn or Microsoft. Use at your own risk.
