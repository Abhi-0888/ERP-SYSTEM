const http = require('http');
const fs = require('fs');

const loginData = JSON.stringify({
    username: 'superadmin',
    password: 'admin123'
});

const login = () => new Promise((resolve, reject) => {
    const req = http.request({
        hostname: 'localhost', port: 5001, path: '/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    }, (res) => {
        let b = ''; res.on('data', d => b += d);
        res.on('end', () => resolve(JSON.parse(b)));
    });
    req.on('error', reject);
    req.write(loginData); req.end();
});

const get = (token, path) => new Promise((resolve, reject) => {
    http.request({
        hostname: 'localhost', port: 5001, path: path, method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    }, (res) => {
        let b = ''; res.on('data', d => b += d);
        res.on('end', () => resolve(JSON.parse(b)));
    }).on('error', reject).end();
});

async function run() {
    try {
        const auth = await login();
        if (!auth.access_token) { console.log('LOGIN_FAILED'); return; }

        const [users, students] = await Promise.all([
            get(auth.access_token, '/users'),
            get(auth.access_token, '/students')
        ]);

        const res = {
            USERS_ID: (users.data || users)[0]?._id || (users.data || users)[0]?.id,
            STUDENTS_ID: (students.data || students)[0]?._id || (students.data || students)[0]?.id
        };
        fs.writeFileSync('ids.json', JSON.stringify(res, null, 2));
        console.log('SUCCESS_IDs:', res);
    } catch (e) { console.error(e); }
}

run();
