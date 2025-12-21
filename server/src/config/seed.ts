import User from '../models/User';
import Coupon from '../models/Coupon';
import bcrypt from 'bcryptjs';

export const seedCoupons = async () => {
    try {
        const existingCoupon = await Coupon.findOne({ code: 'WELCOME50' });
        if (!existingCoupon) {
            const coupon = new Coupon({
                code: 'WELCOME50',
                discountType: 'percentage',
                discountAmount: 10,
                minOrderValue: 500,
                expiryDate: new Date('2025-12-31'),
                isActive: true
            });
            await coupon.save();
            console.log('Seed Coupon Created: WELCOME50');
        }
    } catch (error) {
        console.error('Error seeding coupons:', error);
    }
};

export const seedAdmin = async () => {
    try {
        const adminEmail = 'tmart2025';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            console.log('Seeding admin user...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('tmart@2025', salt);

            const adminUser = new User({
                name: 'T-Mart Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                provider: 'email'
            });

            await adminUser.save();
            console.log('Admin user seeded successfully.');
        } else {
            console.log('Admin user already exists.');
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};
