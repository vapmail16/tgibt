const bcrypt = require('bcrypt');

async function generateHash() {
    try {
        const hash = await bcrypt.hash('miraya1234', 10);
        console.log('Generated hash:', hash);
    } catch (error) {
        console.error('Error:', error);
    }
}

generateHash(); 