const fs = require('fs');
const path = require('path');

const localesPath = path.join(__dirname, 'public', 'locales');

const updateTranslation = (lang, newTranslations) => {
  const filePath = path.join(localesPath, lang, 'translation.json');
  let data = {};
  
  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      data = JSON.parse(fileContent);
    } catch (e) {
      console.error(`Error reading ${filePath}:`, e);
    }
  }

  data = { ...data, ...newTranslations };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${lang}/translation.json`);
};

const arg = process.argv[2];
if (arg) {
  try {
    const translations = JSON.parse(arg);
    for (const [lang, strings] of Object.entries(translations)) {
      updateTranslation(lang, strings);
    }
  } catch (e) {
    console.error("Failed to parse arguments", e);
  }
}
