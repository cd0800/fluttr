const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const DEMO_USER = {
    email: "demo@fluttr.com",
    password: "butterfly",
    name: "Demo User"
};

const db = new sqlite3.Database("./butterflies.db");

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

    db.run(`ALTER TABLE butterflies ADD COLUMN tribe TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN genus TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN location TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN size TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN food_plant TEXT`, () => {});
    db.run(`ALTER TABLE butterflies ADD COLUMN colouring TEXT`, () => {});

    const seed = `
        INSERT OR IGNORE INTO butterflies (common_name, scientific_name, family, tribe, genus, location, size, food_plant, colouring, image)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            "Electric blue",
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
            "Green and black",
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
            "Blue and black",
            "/images/blue-tiger.jpg"
        ],
        [
            "Four-barred swordtail",
            "Protographium leosthenes",
            "Papilionidae",
            "Leptocircini",
            "Protographium",
            "Australia",
            null,
            null,
            null,
            "/images/Four-barred swordtail.jpg"
        ],
        [
            "Five-barred or chain swordtail",
            "Graphium aristeus",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            null,
            null,
            null,
            "/images/Five-barred or chain swordtail.jpg"
        ],
        [
            "Macleay's swordtail",
            "Graphium macleayanus",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            null,
            null,
            null,
            "/images/Macleay's swordtail.jpg"
        ],
        [
            "Blue triangle",
            "Graphium sarpedon",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            null,
            null,
            null,
            "/images/Blue triangle.jpg"
        ],
        [
            "Pale triangle",
            "Graphium eurypylus",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            null,
            null,
            null,
            "/images/Pale triangle.jpg"
        ],
        [
            "Green triangle",
            "Graphium macfarlanei",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            null,
            null,
            null,
            "/images/Green triangle.jpg"
        ],
        [
            "Green-spotted triangle",
            "Graphium agamemnon",
            "Papilionidae",
            "Leptocircini",
            "Graphium",
            "Australia",
            null,
            null,
            null,
            "/images/Green-spotted triangle.jpg"
        ],
        [
            "Dainty swallowtail",
            "Papilio anactus",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            null,
            null,
            null,
            "/images/Dainty swallowtail.jpg"
        ],
        [
            "Orchard swallowtail",
            "Papilio aegeus",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            null,
            null,
            null,
            "/images/Orchard swallowtail.jpg"
        ],
        [
            "Ambrax swallowtail",
            "Papilio ambrax",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            null,
            null,
            null,
            "/images/Ambrax swallowtail.jpg"
        ],
        [
            "Fuscus swallowtail",
            "Papilio fuscus",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            null,
            null,
            null,
            "/images/Fuscus swallowtail.jpg"
        ],
        [
            "Chequered swallowtail",
            "Papilio demoleus",
            "Papilionidae",
            "Papilionini",
            "Papilio",
            "Australia",
            null,
            null,
            null,
            "/images/Chequered swallowtail.jpg"
        ],
        [
            "Clearwing swallowtail",
            "Cressida cressida",
            "Papilionidae",
            "Troidini",
            "Cressida",
            "Australia",
            null,
            null,
            null,
            "/images/Clearwing swallowtail.jpg"
        ],
        [
            "Richmond birdwing",
            "Ornithoptera richmondia",
            "Papilionidae",
            "Troidini",
            "Ornithoptera",
            "Australia",
            null,
            null,
            null,
            "/images/Richmond birdwing.jpg"
        ],
        [
            "New Guinea or common green birdwing",
            "Ornithoptera priamus",
            "Papilionidae",
            "Troidini",
            "Ornithoptera",
            "Australia",
            null,
            null,
            null,
            "/images/New Guinea or common green birdwing.jpg"
        ],
        [
            "Red-bodied swallowtail",
            "Pachliopta polydorus",
            "Papilionidae",
            "Troidini",
            "Pachliopta",
            "Australia",
            null,
            null,
            null,
            "/images/Red-bodied swallowtail.jpg"
        ],
        [
            "Southern pearl-white",
            "Elodina angulipennis",
            "Pieridae",
            "Elodinini",
            "Elodina",
            "Australia",
            null,
            null,
            null,
            "/images/Southern pearl-white.jpg"
        ],
        [
            "Black-spotted white",
            "Leptosia nina",
            "Pieridae",
            "Leptosiaini",
            "Leptosia",
            "Australia",
            null,
            null,
            null,
            "/images/Black-spotted white.jpg"
        ],
        [
            "White or common albatross",
            "Appias albina",
            "Pieridae",
            "Pierini",
            "Appias",
            "Australia",
            null,
            null,
            null,
            "/images/White or common albatross.jpg"
        ],
        [
            "Caper white",
            "Belenois java",
            "Pieridae",
            "Pierini",
            "Belenois",
            "Australia",
            null,
            null,
            null,
            "/images/Caper white.jpg"
        ],
        [
            "Scarlet Jezebel",
            "Delias argenthona",
            "Pieridae",
            "Pierini",
            "Delias",
            "Australia",
            null,
            null,
            null,
            "/images/Scarlet Jezebel.jpg"
        ],
        [
            "Red-banded Jezebel",
            "Delias mysis",
            "Pieridae",
            "Pierini",
            "Delias",
            "Australia",
            null,
            null,
            null,
            "/images/Red-banded Jezebel.jpg"
        ],
        [
            "Lemon migrant",
            "Catopsilia pomona",
            "Pieridae",
            "Coliadinae",
            "Catopsilia",
            "Australia",
            null,
            null,
            null,
            "/images/Lemon migrant.jpg"
        ]
    ];

    rows.forEach((row) => {
        db.run(seed, row);
        if (row[9]) {
            db.run(`UPDATE butterflies SET image = ? WHERE common_name = ?`, [row[9], row[0]]);
        }
    });
});

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

app.get("/api/filters", async (req, res) => {
    try {
        const [family, tribe, genus, location, size, food_plant, colouring] = await Promise.all([
            getDistinctValues("family"),
            getDistinctValues("tribe"),
            getDistinctValues("genus"),
            getDistinctValues("location"),
            getDistinctValues("size"),
            getDistinctValues("food_plant"),
            getDistinctValues("colouring")
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
        if (value) {
            conditions.push(`${key} = ?`);
            params.push(value);
        }
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

    if (email === DEMO_USER.email && password === DEMO_USER.password) {
        res.json({ user: { email: DEMO_USER.email, name: DEMO_USER.name } });
        return;
    }

    res.status(401).json({ error: "Invalid email or password." });
});

app.post("/api/signout", (req, res) => {
    res.json({ ok: true });
});

app.listen(3000,()=>{
    console.log("Server running on http://localhost:3000");
});
