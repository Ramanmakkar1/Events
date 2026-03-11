const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'app/page.js',
    'app/toronto/page.js',
    'app/vancouver/page.js',
    'app/calgary/page.js',
    'app/montreal/page.js',
    'app/winnipeg/page.js',
    'app/ottawa/page.js'
];

const targetPattern = /<div className="nav-right"[\s\S]*?<div className=\{`status-pill/g;

const replacement = `<div className="nav-right" style={{ display: "flex", alignItems: "center", gap: "2px", whiteSpace: "nowrap" }}>
              <button
                className={\`nav-btn \${activePage === "home" ? "active" : ""}\`}
                onClick={() => setActivePage("home")}
              >
                Home
              </button>
              
              <div className="nav-dropdown">
                <button
                  className={\`nav-btn \${activePage === "events" ? "active" : ""}\`}
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  Events
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L5 5L9 1"/></svg>
                </button>
                <div className="nav-dropdown-content">
                  <a href="/">Edmonton</a>
                  <a href="/toronto">Toronto</a>
                  <a href="/vancouver">Vancouver</a>
                  <a href="/calgary">Calgary</a>
                  <a href="/montreal">Montreal</a>
                  <a href="/winnipeg">Winnipeg</a>
                  <a href="/ottawa">Ottawa</a>
                </div>
              </div>

              <a href="#" className="nav-btn">Shop</a>
              <a href="#" className="nav-btn">About</a>

              <div className="nav-divider"></div>
              <div className={\`status-pill`;

for (const fp of filesToUpdate) {
    const fullPath = path.join(__dirname, fp);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(targetPattern, replacement);
        fs.writeFileSync(fullPath, content);
        console.log(`Updated nav in ${fp}`);
    }
}
