const sqlite3 = require('sqlite3').verbose();

// Create and connect to the database
const db = new sqlite3.Database('./jaysauto_db.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create the enquiries table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS t_enquiries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Enquiries table created successfully.');
        }
    });
});

// Create the appoinment table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS t_appoinment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NULL,
        phone TEXT NOT NULL,
        service TEXT NOT NULL,
        date DATE NOT NULL,
        time TIME NOT NULL,
        message TEXT NULL,
        status TEXT DEFAULT 'A',
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Appoinment table created successfully.');
        }
    });
});

// Create the account table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS t_account (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fname TEXT NOT NULL,
        lname TEXT NULL,
        dob DATE NOT NULL,
        email TEXT NULL,
        phone TEXT NOT NULL,
        password TEXT NULL,
        active BIT DEFAULT 1, 
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Account table created successfully.');
        }
    });
});

// Create the comment table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS t_comment (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uname TEXT NOT NULL,
        comment TEXT NULL,
        rate INT DEFAULT 0, 
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Comment table created successfully.');
        }
    });
});

//Create the Vehicles table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS t_vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT NOT NULL,
            active BIT DEFAULT 1, 
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Vehicles table created successfully.');
        }
    });
});

//Create Vehicles Data Ttable
db.serialize(() => {
    db.run(`
        CREATE TABLE t_vehicles_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            veh_id INT NOT NULL,
            yom DATE NOT NULL,
            engine TEXT NOT NULL,
            gear TEXT,
            body TEXT,
            fuel TEXT NOT NULL,
            b_new TEXT NOT NULL,
            millege TEXT,
            other TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Vehicles Data table created successfully.');
        }
    });
});

//Create Users Ttable
db.serialize(() => {
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fname TEXT NOT NULL,
            lname TEXT NOT NULL,
            dob DATE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone INT NULL,
            image TEXT NULL,
            password TEXT NOT NULL,
            active BIT DEFAULT 1,
            lastLogin DATETIME NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Vehicles table created successfully.');
        }
    });
});

//Create Key Values Ttable
db.serialize(() => {
    db.run(`
        CREATE TABLE t_key_values (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            value TEXT NOT NULL,
            "group" TEXT NOT NULL,
            active BIT DEFAULT 1,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Key_Values table created successfully.');
        }
    });
});

//Create Cart View
db.serialize(() => {
    db.run(`
        CREATE VIEW vw_user_cart AS
            SELECT ta.id, u.id AS usr, ta.service, ta.date, ta.time, ta.message, kv.name AS status
            FROM users u
            INNER JOIN t_appoinment ta ON u.email = ta.email
            INNER JOIN t_key_values kv ON ta.status = kv.value
    `, (err) => {
        if (err) {
            console.error('Error creating view:', err.message);
        } else {
            console.log('Cart View created Successfully.');
        }
    });
});

//Create Vehicle Info View
db.serialize(() => {
    db.run(`
        CREATE VIEW vw_vehicle_info AS
            SELECT
            v.id,
            v.brand,
            v.name,
            v.description,
            v.price,
            vd.yom,
            vd.engine,
            vd.body,
            vd.millege,
            vd.other,
            kv.name AS gear,
            kv1.name AS fuel,
            kv2.name AS codition
            FROM
            t_vehicles v
            INNER JOIN t_vehicles_data vd ON v.id = vd.veh_id
            INNER JOIN t_key_values kv ON vd.gear = kv.value and kv."group" = 'Transmission'
            INNER JOIN t_key_values kv1 ON vd.fuel = kv1.value and kv1."group" = 'Fuel'
            INNER JOIN t_key_values kv2 ON vd.b_new = kv2.value and kv2."group" = 'VCondition'
            where v.active=1
    `, (err) => {
        if (err) {
            console.error('Error creating view:', err.message);
        } else {
            console.log('Vehicle Info View created Successfully.');
        }
    });
});

// Close the database connection
db.close();
