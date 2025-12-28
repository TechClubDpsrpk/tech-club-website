const bcrypt = await import('bcrypt').then(mod => mod.default);

const password = 'techclub2526@nophp';
const hash = '$2b$10$6P9hMTbFDA7FZFwNOK6WqOma5H0uG6eh1QOzEBSgxKgb/PBCpC4LG';

const match = await bcrypt.compare(password, hash);
console.log('Password match:', match);
