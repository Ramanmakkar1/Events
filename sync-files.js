const fs = require('fs');
const path = require('path');

const CITIES = [
    {
        id: 'toronto',
        name: 'Toronto',
        theme: 'theme-toronto',
        apiCity: 'Toronto',
        apiState: 'ON',
        provFull: 'ONTARIO',
        teamName: 'Maple Leafs',
        teamSearch: 'maple leaf',
        arena: 'Scotiabank Arena',
    },
    {
        id: 'vancouver',
        name: 'Vancouver',
        theme: 'theme-vancouver',
        apiCity: 'Vancouver',
        apiState: 'BC',
        provFull: 'BRITISH COLUMBIA',
        teamName: 'Canucks',
        teamSearch: 'canuck',
        arena: 'Rogers Arena',
    },
    {
        id: 'calgary',
        name: 'Calgary',
        theme: 'theme-calgary',
        apiCity: 'Calgary',
        apiState: 'AB',
        provFull: 'ALBERTA',
        teamName: 'Flames',
        teamSearch: 'flame',
        arena: 'Scotiabank Saddledome',
    },
    {
        id: 'montreal',
        name: 'Montreal',
        theme: 'theme-montreal',
        apiCity: 'Montreal',
        apiState: 'QC',
        provFull: 'QUEBEC',
        teamName: 'Canadiens',
        teamSearch: 'canadien',
        arena: 'Bell Centre',
    },
    {
        id: 'winnipeg',
        name: 'Winnipeg',
        theme: 'theme-winnipeg',
        apiCity: 'Winnipeg',
        apiState: 'MB',
        provFull: 'MANITOBA',
        teamName: 'Jets',
        teamSearch: 'jets',
        arena: 'Canada Life Centre',
    },
    {
        id: 'ottawa',
        name: 'Ottawa',
        theme: 'theme-ottawa',
        apiCity: 'Ottawa',
        apiState: 'ON',
        provFull: 'ONTARIO',
        teamName: 'Senators',
        teamSearch: 'senator',
        arena: 'Canadian Tire Centre',
    }
];

const templatePath = path.join(__dirname, 'app/page.js');
let content = fs.readFileSync(templatePath, 'utf8');

function processContent(str, cityConfig) {
    // Replace API fetch
    str = str.replace(/city=Edmonton&stateCode=AB/g, "city=" + cityConfig.apiCity + "&stateCode=" + cityConfig.apiState);

    // Replace Team search "oiler" -> "search"
    str = str.replace(/ev\.name\.toLowerCase\(\)\.includes\("oiler"\)/g, "ev.name.toLowerCase().includes(\"" + cityConfig.teamSearch + "\")");

    // Update Theme Wrapper
    // Original is `<div className="theme-light">` or `<>\n`
    // Actually Edmonton doesn't have a theme wrapper currently. Let's make sure Edmonton has `<div className="theme-edmonton">` so we can replace it.
    str = str.replace(/<div className="theme-edmonton">/g, "<div className=\"" + cityConfig.theme + "\">");

    // Logo text
    str = str.replace(/Edmonton<span>Weekend<\/span>/g, cityConfig.name + "<span>Weekend</span>");

    // Hero
    str = str.replace(/EDMONTON • ALBERTA • CANADA/g, cityConfig.name.toUpperCase() + " • " + cityConfig.provFull + " • CANADA");
    str = str.replace(/Everything Happening\\n                  <br \/>\\n                  in Edmonton/g, "Everything Happening\\n                  <br />\\n                  in " + cityConfig.name);
    str = str.replace(/Oilers games/g, cityConfig.teamName + " games");

    // Content header
    str = str.replace(/This Week in Edmonton/g, "This Week in " + cityConfig.name);

    // Oilers header -> Team header
    str = str.replace(/Edmonton <span style={{ color: "var\(--accent\)" }}>Oilers<\/span>/g, cityConfig.name + ' <span style={{ color: "var(--accent)" }}>' + cityConfig.teamName + '</span>');
    str = str.replace(/Upcoming games at Rogers Place/g, "Upcoming games at " + cityConfig.arena);

    // Never Miss
    str = str.replace(/happening in Edmonton\./g, "happening in " + cityConfig.name + ".");

    // Footer text
    str = str.replace(/Built for Edmonton locals/g, "Built for " + cityConfig.name + " locals");
    str = str.replace(/@edmontonweekend/g, "@" + cityConfig.name.toLowerCase() + "weekend");

    let prov = 'Ontario';
    if (cityConfig.name === 'Montreal') prov = 'Quebec';
    if (cityConfig.name === 'Vancouver') prov = 'British Columbia';
    if (cityConfig.name === 'Calgary') prov = 'Alberta';
    if (cityConfig.name === 'Winnipeg') prov = 'Manitoba';

    str = str.replace(/Edmonton Weekend • Edmonton, Alberta/g, cityConfig.name + " Weekend • " + cityConfig.name + ", " + prov);

    return str;
}

for (const city of CITIES) {
    const c = processContent(content, city);
    const dir = path.join(__dirname, 'app', city.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'page.js'), c);
    console.log("Synced " + city.id);
}
