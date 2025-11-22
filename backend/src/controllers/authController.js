const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/knex');
const { sendOTP } = require('../services/emailService');

const SALT_ROUNDS = 10;

// Helper to generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.signup = async (req, res) => {
    const { login_id, email, password } = req.body;

    // Basic validation
    if (!login_id || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (login_id.length < 6 || login_id.length > 12) {
        return res.status(400).json({ error: 'Login ID must be between 6 and 12 characters' });
    }

    try {
        // Check if user exists
        const existingUser = await db('users')
            .where({ login_id })
            .orWhere({ email })
            .first();

        if (existingUser) {
            return res.status(400).json({ error: 'Login ID or Email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert user
        const [newUser] = await db('users')
            .insert({
                login_id,
                email,
                password_hash: hashedPassword,
            })
            .returning(['id', 'login_id', 'email', 'created_at']);

        // Generate token
        const token = jwt.sign(
            { id: newUser.id, login_id: newUser.login_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during signup' });
    }
};

exports.login = async (req, res) => {
    const { login_id, password } = req.body;

    if (!login_id || !password) {
        return res.status(400).json({ error: 'Login ID and password are required' });
    }

    try {
        const user = await db('users').where({ login_id }).first();

        if (!user) {
            return res.status(401).json({ error: 'Incorrect Login ID or Password' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Incorrect Login ID or Password' });
        }

        const token = jwt.sign(
            { id: user.id, login_id: user.login_id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, login_id: user.login_id, email: user.email },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

exports.requestOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const user = await db('users').where({ email }).first();

        if (!user) {
            // Security: Don't reveal if email exists or not, but for this milestone we can be explicit or generic.
            // Let's be generic to be professional, but helpful for debugging.
            // Actually, the prompt says "Backend checks if email exists".
            return res.status(404).json({ error: 'User with this email not found' });
        }

        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP
        await db('otp_tokens').insert({
            user_id: user.id,
            otp,
            expires_at: expiresAt,
            used: false,
        });

        // Send Email
        const emailSent = await sendOTP(email, otp, user.login_id);

        if (emailSent) {
            res.json({ message: 'OTP sent to your email' });
        } else {
            res.status(500).json({ error: 'Failed to send email' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error requesting OTP' });
    }
};

exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }

    try {
        const user = await db('users').where({ email }).first();
        if (!user) return res.status(404).json({ error: 'User not found' });

        const validOtp = await db('otp_tokens')
            .where({ user_id: user.id, otp, used: false })
            .andWhere('expires_at', '>', new Date())
            .orderBy('created_at', 'desc')
            .first();

        if (!validOtp) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Return a temporary token or just success flag.
        // For simplicity, we'll return a success message and the user can proceed to reset password.
        // In a stricter flow, we might issue a short-lived "reset token".
        // Here we will just say "Verified". The reset endpoint will check OTP again or we trust the client flow for this milestone?
        // Better: The reset endpoint should also verify the OTP or take a signed token.
        // Requirement says: "Checks OTP and returns a session token or flag allowing password reset."

        // Let's issue a temporary signed token specifically for password reset
        const resetToken = jwt.sign(
            { id: user.id, type: 'reset_password' },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.json({ message: 'OTP verified', resetToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error verifying OTP' });
    }
};

exports.resetPassword = async (req, res) => {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }

    try {
        // Verify reset token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

        if (decoded.type !== 'reset_password') {
            return res.status(403).json({ error: 'Invalid token type' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await db('users')
            .where({ id: decoded.id })
            .update({ password_hash: hashedPassword });

        // Mark all OTPs for this user as used (optional cleanup) or just the one used?
        // Since we used a token, we don't strictly need to mark OTP as used here if we didn't pass the OTP code again.
        // But the requirement says "Mark OTP as used".
        // To do that, we would need to know WHICH OTP was used.
        // Let's assume the verify step was enough, but to be strictly compliant with "Mark OTP as used" in this step:
        // We can expire all pending OTPs for this user to be safe.
        await db('otp_tokens')
            .where({ user_id: decoded.id, used: false })
            .update({ used: true });

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Invalid or expired token' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await db('users')
            .where({ id: req.user.id })
            .select('id', 'login_id', 'email', 'created_at')
            .first();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
