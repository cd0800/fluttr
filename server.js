const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const { isValidEmail, sanitizeName } = require("./server/validation");
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Demo account for quick access without sign up.
const DEMO_USER = {
    email: "demo@fluttr.com",
    password: "butterfly",
    name: "Demo User"
};

const DB_PATH = process.env.FLUTTR_DB_PATH || "./butterflies.db";
const db = new sqlite3.Database(DB_PATH);
const NULL_FILTER_VALUE = "__missing__";
const NULL_FILTER_LABEL = "Not specified";
const COLOUR_VALUES = ["Black", "White", "Green", "Blue", "Yellow", "Red"];
const PASSWORD_ITERATIONS = 120000;
const PASSWORD_KEYLEN = 64;
const PASSWORD_DIGEST = "sha256";
const SESSION_COOKIE = "fluttr_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

// Initialize tables and seed butterfly data on startup.
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS butterflies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            common_name TEXT UNIQUE,
            scientific_name TEXT,
            family TEXT,
            tribe TEXT,
            genus TEXT,
            location TEXT,
            size TEXT,
            food_plant TEXT,
            colouring TEXT,
            image TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            password_salt TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    db.get(`SELECT id FROM users WHERE email = ?`, [DEMO_USER.email], (err, row) => {
        if (err) {
            console.error("Error checking demo user", err);
            return;
        }
        if (row) {
            return;
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const passwordHash = hashPassword(DEMO_USER.password, salt);
        const createdAt = new Date().toISOString();

        db.run(
            `INSERT INTO users (name, email, password_hash, password_salt, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [DEMO_USER.name, DEMO_USER.email, passwordHash, salt, createdAt]
        );
    });

    db.run(`ALTER TABLE butterflies ADD COLUMN tribe TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN genus TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN location TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN size TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN food_plant TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN colouring TEXT`, () => {});

    const seed = `
        INSERT INTO butterflies (common_name, scientific_name, family, tribe, genus, location, size, food_plant, colouring, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(common_name) DO UPDATE SET
            scientific_name = excluded.scientific_name,
            family = excluded.family,
            tribe = excluded.tribe,
            genus = excluded.genus,
            location = excluded.location,
            size = excluded.size,
            food_plant = excluded.food_plant,
            colouring = excluded.colouring,
            image = excluded.image
    `;

    const rows = [
        [
            "Ulysses",
            "Papilio ulysses",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Queensland (Wet Tropics)",
            "Large",
            "Citrus species",
            "Black, Blue",
            "/images/ulysses.jpg"
        ],
        [
            "Cairns Birdwing",
            "Ornithoptera euphorion",
            "Papilionidae",
            "Troidini",
            "Ornithoptera",
            "Queensland (Wet Tropics)",
            "Very large",
            "Pararistolochia praevenosa",
            "Black, Green",
            "/images/cairns-birdwing.jpg"
        ],
        [
            "Blue Tiger",
            "Tirumala hamata",
            "Nymphalidae",
            "Danaini",
            "Tirumala",
            "Northern Australia",
            "Medium",
            "Tylophora species",
            "Black, Blue",
            "/images/blue-tiger.jpg"
        ],
        [
            "Four-barred swordtail",
            "Protographium leosthenes",
            "Papilionidae",
            "Leptocircini",
            "Protographium",
            "Australia",
            "Medium",
            "Melodorum species",
            "Black, White",
            "/images/Four-barred swordtail.jpg"
        ],
        [
            "Five-barred or chain swordtail",
            "Graphium aristeus",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            "Medium",
            "Annona species",
            "Black, Green",
            "/images/Five-barred or chain swordtail.jpg"
        ],
        [
            "Macleay's swordtail",
            "Graphium macleayanus",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            "Medium",
            "Cryptocarya species",
            "Black, Green",
            "/images/Macleay's swordtail.jpg"
        ],
        [
            "Blue triangle",
            "Graphium sarpedon",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            "Medium",
            "Cinnamomum species",
            "Black, Blue",
            "/images/Blue triangle.jpg"
        ],
        [
            "Pale triangle",
            "Graphium eurypylus",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            "Medium",
            "Annona species",
            "Black, Green",
            "/images/Pale triangle.jpg"
        ],
        [
            "Green triangle",
            "Graphium macfarlanei",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            "Medium",
            "Cryptocarya species",
            "Black, Green",
            "/images/Green triangle.jpg"
        ],
        [
            "Green-spotted triangle",
            "Graphium agamemnon",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            "Medium",
            "Annona species",
            "Black, Green",
            "/images/Green-spotted triangle.jpg"
        ],
        [
            "Dainty swallowtail",
            "Papilio anactus",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            "Medium",
            "Citrus species",
            "Black, Yellow",
            "/images/Dainty swallowtail.jpg"
        ],
        [
            "Orchard swallowtail",
            "Papilio aegeus",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            "Large",
            "Citrus species",
            "Black, White",
            "/images/Orchard swallowtail.jpg"
        ],
        [
            "Ambrax swallowtail",
            "Papilio ambrax",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            "Large",
            "Citrus species",
            "Black, White",
            "/images/Ambrax swallowtail.jpg"
        ],
        [
            "Fuscus swallowtail",
            "Papilio fuscus",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            "Large",
            "Citrus species",
            "Black, White",
            "/images/Fuscus swallowtail.jpg"
        ],
        [
            "Chequered swallowtail",
            "Papilio demoleus",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            "Large",
            "Citrus species",
            "Black, Yellow, Red",
            "/images/Chequered swallowtail.jpg"
        ],
        [
            "Clearwing swallowtail",
            "Cressida cressida",
            "Papilionidae",
            "Troidini",
            "Cressida",
            "Australia",
            "Medium",
            "Aristolochia species",
            "Black, White",
            "/images/Clearwing swallowtail.jpg"
        ],
        [
            "Richmond birdwing",
            "Ornithoptera richmondia",
            "Papilionidae",
            "Troidini",
            "Ornithoptera",
            "Australia",
            "Very large",
            "Pararistolochia praevenosa",
            "Black, Green",
            "/images/Richmond birdwing.jpg"
        ],
        [
            "New Guinea or common green birdwing",
            "Ornithoptera priamus",
            "Papilionidae",
            "Troidini",
            "Ornithoptera",
            "Australia",
            "Very large",
            "Aristolochia species",
            "Black, Green",
            "/images/New Guinea or common green birdwing.jpg"
        ],
        [
            "Red-bodied swallowtail",
            "Pachliopta polydorus",
            "Papilionidae",
            "Troidini",
            "Pachliopta",
            "Australia",
            "Large",
            "Aristolochia species",
            "Black, Red",
            "/images/Red-bodied swallowtail.jpg"
        ],
        [
            "Southern pearl-white",
            "Elodina angulipennis",
            "Pieridae",
            "Elodinini",
            "Elodina",
            "Australia",
            "Small",
            "Capparis species",
            "White",
            "/images/Southern pearl-white.jpg"
        ],
        [
            "Black-spotted white",
            "Leptosia nina",
            "Pieridae",
            "Leptosiaini",
            "Leptosia",
            "Australia",
            "Small",
            "Capparis species",
            "White, Black",
            "/images/Black-spotted white.jpg"
        ],
        [
            "White or common albatross",
            "Appias albina",
            "Pieridae",
            "Pierini",
            "Appias",
            "Australia",
            "Medium",
            "Drypetes species",
            "White, Black",
            "/images/White or common albatross.jpg"
        ],
        [
            "Caper white",
            "Belenois java",
            "Pieridae",
            "Pierini",
            "Belenois",
            "Australia",
            "Medium",
            "Capparis species",
            "White, Black",
            "/images/Caper white.jpg"
        ],
        [
            "Scarlet Jezebel",
            "Delias argenthona",
            "Pieridae",
            "Pierini",
            "Delias",
            "Australia",
            "Medium",
            "Amyema species",
            "Black, White, Red",
            "/images/Scarlet Jezebel.jpg"
        ],
        [
            "Red-banded Jezebel",
            "Delias mysis",
            "Pieridae",
            "Pierini",
            "Delias",
            "Australia",
            "Medium",
            "Amyema species",
            "Black, White, Red",
            "/images/Red-banded Jezebel.jpg"
        ],
        [
            "Lemon migrant",
            "Catopsilia pomona",
            "Pieridae",
            "Coliadinae",
            "Catopsilia",
            "Australia",
            "Medium",
            "Senna species",
            "Yellow",
            "/images/Lemon migrant.jpg"
        ],
        [
            "White migrant",
            "Catopsilia pyranthe",
            "Pieridae",
            "Coliadinae",
            "Catopsilia",
            "Northern Australia",
            "Medium",
            "Senna species",
            "White",
            "/images/White migrant.jpg"
        ],
        [
            "Orange migrant",
            "Catopsilia scylla",
            "Pieridae",
            "Coliadinae",
            "Catopsilia",
            "Northern Australia",
            "Medium",
            "Senna species",
            "Orange, Yellow",
            "/images/Orange migrant.jpg"
        ],
        [
            "Yellow migrant",
            "Catopsilia gorgophone",
            "Pieridae",
            "Coliadinae",
            "Catopsilia",
            "Northern Australia",
            "Medium",
            "Senna species",
            "Yellow",
            "/images/Yellow migrant.jpg"
        ],
        [
            "No-brand grass-yellow",
            "Eurema brigitta",
            "Pieridae",
            "Coliadinae",
            "Eurema",
            "Australia",
            "Small",
            "Fabaceae species",
            "Yellow, Black",
            "/images/No-brand grass-yellow.jpg"
        ],
        [
            "Lined grass-yellow",
            "Eurema laeta",
            "Pieridae",
            "Coliadinae",
            "Eurema",
            "Northern Australia",
            "Small",
            "Fabaceae species",
            "Yellow, Black",
            "/images/Lined grass-yellow.jpg"
        ],
        [
            "Pink grass-yellow",
            "Eurema herla",
            "Pieridae",
            "Coliadinae",
            "Eurema",
            "Australia",
            "Small",
            "Fabaceae species",
            "Yellow, Pink",
            "/images/Pink grass-yellow.jpg"
        ],
        [
            "Small grass-yellow",
            "Eurema smilax",
            "Pieridae",
            "Coliadinae",
            "Eurema",
            "Australia",
            "Small",
            "Fabaceae species",
            "Yellow",
            "/images/Small grass-yellow.jpg"
        ],
        [
            "Broad-margined grass-yellow",
            "Eurema puella",
            "Pieridae",
            "Coliadinae",
            "Eurema",
            "Northern Australia",
            "Small",
            "Fabaceae species",
            "Yellow, Black",
            "/images/Broad-margined grass-yellow.jpg"
        ],
        [
            "Scalloped grass-yellow",
            "Eurema alitha",
            "Pieridae",
            "Coliadinae",
            "Eurema",
            "Northern Australia",
            "Small",
            "Fabaceae species",
            "Yellow",
            "/images/Scalloped grass-yellow.jpg"
        ],
        [
            "Large grass-yellow",
            "Eurema hecabe",
            "Pieridae",
            "Coliadinae",
            "Eurema",
            "Australia",
            "Small",
            "Fabaceae species",
            "Yellow",
            "/images/Large grass-yellow.jpg"
        ],
        [
            "Three-spot grass-yellow",
            "Eurema blanda",
            "Pieridae",
            "Coliadinae",
            "Eurema",
            "Christmas Island, Torres Strait",
            "Small",
            "Fabaceae species",
            "Yellow, Black",
            "/images/Three-spot grass-yellow.jpg"
        ],
        [
            "Harlequin metalmark",
            "Praetaxila segecia",
            "Riodinidae",
            "Nemeobiinae",
            "Praetaxila",
            "Northern Australia",
            "Small",
            "Parasitic on leaf insects",
            "Black, Orange, White",
            "/images/Harlequin metalmark.jpg"
        ],
        [
            "Moth butterfly",
            "Liphyra brassolis",
            "Lycaenidae",
            "Miletinae",
            "Liphyra",
            "Northern Australia",
            "Medium",
            "Ant brood",
            "Brown",
            "/images/Moth butterfly.jpg"
        ],
        [
            "Chequered copper",
            "Lucia limbaria",
            "Lycaenidae",
            "Theclinae",
            "Lucia",
            "Australia",
            "Small",
            "Cassytha species",
            "Brown, Orange",
            "/images/Chequered copper.jpg"
        ],
        [
            "Bright copper",
            "Paralucia aurifera",
            "Lycaenidae",
            "Theclinae",
            "Paralucia",
            "Australia",
            "Small",
            "Bursaria species",
            "Brown, Orange",
            "/images/Bright copper.jpg"
        ],
        [
            "Fiery copper",
            "Paralucia pyrodiscus",
            "Lycaenidae",
            "Theclinae",
            "Paralucia",
            "Australia",
            "Small",
            "Bursaria species",
            "Orange, Brown",
            "/images/Fiery copper.jpg"
        ],
        [
            "Purple copper",
            "Paralucia spinifera",
            "Lycaenidae",
            "Theclinae",
            "Paralucia",
            "Australia",
            "Small",
            "Bursaria spinosa",
            "Purple, Brown",
            "/images/Purple copper.jpg"
        ],
        [
            "Bright forest-blue",
            "Pseudodipsas cephenes",
            "Lycaenidae",
            "Theclinae",
            "Pseudodipsas",
            "Northern Australia",
            "Small",
            "Acacia species",
            "Blue, Brown",
            "/images/Bright forest-blue.jpg"
        ],
        [
            "Dark forest-blue",
            "Pseudodipsas eone",
            "Lycaenidae",
            "Theclinae",
            "Pseudodipsas",
            "Northern Australia",
            "Small",
            "Acacia species",
            "Blue, Brown",
            "/images/Dark forest-blue.jpg"
        ],
        [
            "Black-veined ant-blue",
            "Acrodipsas arcana",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Brown, Black",
            "/images/Black-veined ant-blue.jpg"
        ],
        [
            "Golden ant-blue",
            "Acrodipsas aurata",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Brown, Gold",
            "/images/Golden ant-blue.jpg"
        ],
        [
            "Bronze ant-blue",
            "Acrodipsas brisbanensis",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Brown, Bronze",
            "/images/Bronze ant-blue.jpg"
        ],
        [
            "Copper ant-blue",
            "Acrodipsas cuprea",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Brown, Copper",
            "/images/Copper ant-blue.jpg"
        ],
        [
            "Decima ant-blue",
            "Acrodipsas decima",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Brown",
            "/images/Decima ant-blue.jpg"
        ],
        [
            "Black ant-blue",
            "Acrodipsas hirtipes",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Brown, Black",
            "/images/Black ant-blue.jpg"
        ],
        [
            "Illidge's ant-blue",
            "Acrodipsas illidgei",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Brown, Grey",
            "/images/Illidge's ant blue.jpg"
        ],
        [
            "Grey ant-blue",
            "Acrodipsas melania",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Grey, Brown",
            "/images/Grey ant-blue.jpg"
        ],
        [
            "Brown ant-blue",
            "Acrodipsas mortoni",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Brown",
            "/images/Brown ant-blue.jpg"
        ],
        [
            "Small ant-blue",
            "Acrodipsas myrmecophila",
            "Lycaenidae",
            "Theclinae",
            "Acrodipsas",
            "Australia",
            "Small",
            "Ant larvae",
            "Brown",
            "/images/Small ant-blue.jpg"
        ],
        [
            "Copper jewel",
            "Hypochrysops apelles",
            "Lycaenidae",
            "Theclinae",
            "Hypochrysops",
            "Australia",
            "Small",
            "Mistletoe species",
            "Brown, Copper",
            "/images/Copper jewel.jpg"
        ],
        [
            "Apollo jewel",
            "Hypochrysops apollo",
            "Lycaenidae",
            "Theclinae",
            "Hypochrysops",
            "Australia",
            "Small",
            "Mistletoe species",
            "Blue, Brown",
            "/images/Apollo jewel.jpg"
        ],
        [
            "Yellow jewel",
            "Hypochrysops byzos",
            "Lycaenidae",
            "Theclinae",
            "Hypochrysops",
            "Australia",
            "Small",
            "Mistletoe species",
            "Yellow, Brown",
            "/images/Yellow jewel.jpg"
        ],
        [
            "Mangrove jewel",
            "Hypochrysops epicurus",
            "Lycaenidae",
            "Theclinae",
            "Hypochrysops",
            "Australia",
            "Small",
            "Mistletoe species",
            "Blue, Brown",
            "/images/Mangrove jewel.jpg"
        ],
        [
            "Turquoise jewel",
            "Hypochrysops halyaetus",
            "Lycaenidae",
            "Theclinae",
            "Hypochrysops",
            "Australia",
            "Small",
            "Mistletoe species",
            "Blue, Turquoise",
            "/images/Turquoise jewel.jpg"
        ],
        [
            "Narcissus jewel",
            "Hypochrysops narcissus",
            "Lycaenidae",
            "Theclinae",
            "Hypochrysops",
            "Australia",
            "Small",
            "Mistletoe species",
            "Blue, Brown",
            "/images/Narcissus jewel.jpg"
        ]


    ];

    rows.forEach((row) => {
        db.run(seed, row);
    });
});

app.locals.db = db;
function getDistinctValues(column) {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT DISTINCT ${column} AS value FROM butterflies WHERE ${column} IS NOT NULL AND ${column} != '' ORDER BY ${column}`,
            [],
            (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows.map((row) => row.value));
            }
        );
    });
}

function getMissingCount(column) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT COUNT(*) AS count FROM butterflies WHERE ${column} IS NULL OR ${column} = ''`,
            [],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(row.count || 0);
            }
        );
    });
}

async function getFilterValues(column) {
    const [values, missingCount] = await Promise.all([
        getDistinctValues(column),
        getMissingCount(column)
    ]);
    const items = values.map((value) => ({ value, label: value }));
    if (missingCount > 0) {
        items.push({ value: NULL_FILTER_VALUE, label: NULL_FILTER_LABEL });
    }
    return items;
}

async function getColouringValues() {
    const missingCount = await getMissingCount("colouring");
    const items = COLOUR_VALUES.map((value) => ({ value, label: value }));
    if (missingCount > 0) {
        items.push({ value: NULL_FILTER_VALUE, label: NULL_FILTER_LABEL });
    }
    return items;
}

app.get("/api/filters", async (req, res) => {
    try {
        const [family, tribe, genus, location, size, food_plant, colouring] = await Promise.all([
            getFilterValues("family"),
            getFilterValues("tribe"),
            getFilterValues("genus"),
            getFilterValues("location"),
            getFilterValues("size"),
            getFilterValues("food_plant"),
            getColouringValues()
        ]);

        res.json({ family, tribe, genus, location, size, food_plant, colouring });
    } catch (err) {
        res.status(500).json(err);
    }
});

app.get("/api/butterflies", (req, res) => {

    const search = req.query.q || "";
    const filters = {
        family: req.query.family || "",
        tribe: req.query.tribe || "",
        genus: req.query.genus || "",
        location: req.query.location || "",
        size: req.query.size || "",
        food_plant: req.query.food_plant || "",
        colouring: req.query.colouring || ""
    };

    const conditions = [];
    const params = [];

    if (search) {
        const term = `%${search}%`;
        conditions.push(`
            (common_name LIKE ?
            OR scientific_name LIKE ?
            OR family LIKE ?
            OR tribe LIKE ?
            OR genus LIKE ?
            OR location LIKE ?
            OR food_plant LIKE ?
            OR colouring LIKE ?)
        `);
        params.push(term, term, term, term, term, term, term, term);
    }

    Object.entries(filters).forEach(([key, value]) => {
        const values = Array.isArray(value) ? value : (value ? [value] : []);
        if (!values.length) {
            return;
        }

        const hasMissing = values.includes(NULL_FILTER_VALUE);
        const realValues = values.filter((item) => item !== NULL_FILTER_VALUE);

        const isColouring = key === "colouring";

        if (hasMissing && realValues.length) {
            if (isColouring) {
                const likeClauses = realValues.map(() => `${key} LIKE ?`).join(" OR ");
                conditions.push(`((${likeClauses}) OR ${key} IS NULL OR ${key} = '')`);
                params.push(...realValues.map((value) => `%${value}%`));
                return;
            }

            const placeholders = realValues.map(() => "?").join(", ");
            conditions.push(`(${key} IN (${placeholders}) OR ${key} IS NULL OR ${key} = '')`);
            params.push(...realValues);
            return;
        }

        if (hasMissing) {
            conditions.push(`(${key} IS NULL OR ${key} = '')`);
            return;
        }

        if (isColouring) {
            const likeClauses = realValues.map(() => `${key} LIKE ?`).join(" OR ");
            conditions.push(`(${likeClauses})`);
            params.push(...realValues.map((value) => `%${value}%`));
            return;
        }

        const placeholders = realValues.map(() => "?").join(", ");
        conditions.push(`${key} IN (${placeholders})`);
        params.push(...realValues);
    });

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM butterflies ${whereClause}`;

    db.all(sql, params, (err, rows) => {
        if(err){
            res.status(500).json(err);
            return;
        }

        res.json(rows);
    });

});

app.get("/api/butterflies/:id", (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
    }

    db.get(`SELECT * FROM butterflies WHERE id = ?`, [id], (err, row) => {
        if (err) {
            res.status(500).json(err);
            return;
        }
        if (!row) {
            res.status(404).json({ error: "Not found" });
            return;
        }
        res.json(row);
    });
});

app.post("/api/signin", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
        res.status(400).json({ error: "Email and password are required." });
        return;
    }

    if (!isValidEmail(email)) {
        res.status(400).json({ error: "Please enter a valid email address." });
        return;
    }

    // Look up the user and verify the password hash.
    db.get(
        `SELECT id, name, email, password_hash, password_salt FROM users WHERE email = ?`,
        [email],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: "Database error." });
                return;
            }

            if (!row) {
                res.status(401).json({ error: "Invalid email or password." });
                return;
            }

            const expectedHash = hashPassword(password, row.password_salt);
            if (!timingSafeEqual(expectedHash, row.password_hash)) {
                res.status(401).json({ error: "Invalid email or password." });
                return;
            }

            createSession(row.id, (sessionErr, session) => {
                if (sessionErr) {
                    res.status(500).json({ error: "Could not create session." });
                    return;
                }

                setSessionCookie(res, session.token, session.expiresAt);
                res.json({ user: { email: row.email, name: row.name } });
            });
        }
    );
});

app.post("/api/signup", (req, res) => {
    const name = sanitizeName(String(req.body.name || ""));
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!name || !email || !password) {
        res.status(400).json({ error: "Name, email, and password are required." });
        return;
    }

    if (!isValidEmail(email)) {
        res.status(400).json({ error: "Please enter a valid email address." });
        return;
    }

    if (password.length < 1) {
        res.status(400).json({ error: "Password is required." });
        return;
    }

    // Ensure the email is not already registered.
    db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
        if (err) {
            res.status(500).json({ error: "Database error." });
            return;
        }

        if (row) {
            res.status(409).json({ error: "An account with that email already exists." });
            return;
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const passwordHash = hashPassword(password, salt);
        const createdAt = new Date().toISOString();

        db.run(
            `INSERT INTO users (name, email, password_hash, password_salt, created_at)
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, passwordHash, salt, createdAt],
            function insertHandler(insertErr) {
                if (insertErr) {
                    res.status(500).json({ error: "Could not create account." });
                    return;
                }

                const userId = this.lastID;
                createSession(userId, (sessionErr, session) => {
                    if (sessionErr) {
                        res.status(500).json({ error: "Could not create session." });
                        return;
                    }
                    setSessionCookie(res, session.token, session.expiresAt);
                    res.status(201).json({ user: { email, name } });
                });
            }
        );
    });
});

app.get("/api/me", (req, res) => {
    getSessionUser(req, (err, user) => {
        if (err) {
            res.status(500).json({ error: "Database error." });
            return;
        }
        if (!user) {
            res.json({ user: null });
            return;
        }
        res.json({ user: { email: user.email, name: user.name } });
    });
});

app.post("/api/signout", (req, res) => {
    const token = getSessionToken(req);
    if (!token) {
        clearSessionCookie(res);
        res.json({ ok: true });
        return;
    }

    db.run(`DELETE FROM sessions WHERE token = ?`, [token], () => {
        clearSessionCookie(res);
        res.json({ ok: true });
    });
});

function hashPassword(password, salt) {
    return crypto
        .pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEYLEN, PASSWORD_DIGEST)
        .toString("hex");
}

function timingSafeEqual(a, b) {
    const aBuf = Buffer.from(a, "hex");
    const bBuf = Buffer.from(b, "hex");
    if (aBuf.length !== bBuf.length) {
        return false;
    }
    return crypto.timingSafeEqual(aBuf, bBuf);
}

// Parse the session cookie from the request header.
function getSessionToken(req) {
    const cookieHeader = req.headers.cookie || "";
    const cookies = cookieHeader.split(";").reduce((acc, item) => {
        const [key, ...rest] = item.trim().split("=");
        if (!key) return acc;
        acc[key] = decodeURIComponent(rest.join("="));
        return acc;
    }, {});
    return cookies[SESSION_COOKIE];
}

// Create a httpOnly session cookie.
function setSessionCookie(res, token, expiresAt) {
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        expires: new Date(expiresAt)
    });
}

// Clear the session cookie on sign out.
function clearSessionCookie(res) {
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax" });
}

// Insert a new session token for a user.
function createSession(userId, callback) {
    const token = crypto.randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

    db.run(
        `INSERT INTO sessions (user_id, token, created_at, expires_at) VALUES (?, ?, ?, ?)`,
        [userId, token, now.toISOString(), expiresAt.toISOString()],
        (err) => {
            if (err) {
                callback(err);
                return;
            }
            callback(null, { token, expiresAt: expiresAt.toISOString() });
        }
    );
}

// Resolve the current user from the session cookie.
function getSessionUser(req, callback) {
    const token = getSessionToken(req);
    if (!token) {
        callback(null, null);
        return;
    }

    db.get(
        `SELECT sessions.token, sessions.expires_at, users.email, users.name
         FROM sessions
         JOIN users ON users.id = sessions.user_id
         WHERE sessions.token = ?`,
        [token],
        (err, row) => {
            if (err) {
                callback(err);
                return;
            }
            if (!row) {
                callback(null, null);
                return;
            }

            const expiresAt = new Date(row.expires_at);
            if (Number.isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
                db.run(`DELETE FROM sessions WHERE token = ?`, [token], () => {
                    callback(null, null);
                });
                return;
            }

            callback(null, { email: row.email, name: row.name });
        }
    );
}

if (require.main === module) {
    app.listen(3000, () => {
        console.log("Server running on http://localhost:3000");
    });
}

module.exports = app;
