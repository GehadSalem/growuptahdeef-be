import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User.entity';
import { UserRepository } from '../repositories/user.repository';
import admin from '../config/firebase-admin';

export class AuthService {
    private userRepository = new UserRepository();

    async register(userData: Partial<User>): Promise<{ user: User, token: string }> {
        // Add validation for required fields
        if (!userData.email || !userData.password) {
            throw new Error('Email and password are required');
        }
    
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) throw new Error('Email already in use');
    
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await this.userRepository.create({
            ...userData,
            password: hashedPassword,
            authProvider: 'email' // Track auth provider
        });
    
        const token = this.generateJWT(user.id);
        return { user, token };
    }

    async login(email: string, password: string): Promise<{ user: User, token: string }> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new Error('Invalid credentials');

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) throw new Error('Invalid credentials');

        const token = this.generateJWT(user.id);
        return { user, token };
    }

    async verifyGoogleToken(idToken: string): Promise<{ user: User, token: string }> {
        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            
            if (!decodedToken.email) {
                throw new Error('Google token is missing email');
            }
            
            const { email, name, uid } = decodedToken;
            const userName = name || 'User';

            let user = await this.userRepository.findByEmail(email);
            
            if (!user) {
                user = await this.userRepository.create({
                    email,
                    name: userName,
                    firebaseUid: uid,
                    authProvider: 'google'
                });
            } else if (user.authProvider !== 'google') {
                throw new Error('Email already registered with another method');
            }

            const token = this.generateJWT(user.id);
            return { user, token };
        } catch (error) {
            console.error('Google token verification error:', error);
            throw new Error('Invalid Google token');
        }
    }

    private generateJWT(userId: string): string {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d'
        });
    }
}