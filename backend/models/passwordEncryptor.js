import bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, saltRounds);
};


hashPassword("omkarzagade605").then((hash) => {
    console.log(hash);
});

