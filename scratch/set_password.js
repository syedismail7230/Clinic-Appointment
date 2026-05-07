import { hashPassword } from '../server/auth.js';
import { supabase } from '../server/db.js';

async function updatePassword() {
    const phone = '9538921426';
    const password = 'passmein1';

    console.log(`Hashing password for ${phone}...`);
    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword })
        .eq('phone', phone);

    if (error) {
        console.error('Error updating password:', error);
    } else {
        console.log(`Successfully updated password for ${phone}!`);
    }
    process.exit();
}

updatePassword();
