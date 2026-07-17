const https = require('https');
https.get('https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const countries = JSON.parse(data);
    const india = countries.find(c => c.name.common === 'India');
    console.log(india);
    const code = india.idd.root + (india.idd.suffixes ? india.idd.suffixes[0] : '');
    console.log('Dial code:', code);
  });
});
