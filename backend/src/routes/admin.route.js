import { Router } from 'express';
import { verifyAdminJwt } from '../middlewares/admin.middleware.js';
import {
    login, logout, refreshAdminToken, getMe,
    createAdmin, listAdmins, updateAdminPermissions, toggleAdminStatus, deleteAdmin,
    getUsers, getUserById, updateUserStatus,
    getDrivers, getDriverById, updateDriverStatus,
    getPendingDocuments, verifyDocument, rejectDocument,
    getTrips, getTripByIdAdmin, getAnalytics,
    getSupportTickets, getSupportTicketById, updateTicketStatus, addAdminMessage,
} from '../controller/admin.controller.js';

const adminRouter = Router();

// Public
adminRouter.post('/login', login);
adminRouter.post('/refresh-token', refreshAdminToken);

// Protected
adminRouter.use(verifyAdminJwt);
adminRouter.post('/logout', logout);
adminRouter.get('/me', getMe);
adminRouter.get('/admins', listAdmins);
adminRouter.post('/admins', createAdmin);
adminRouter.patch('/admins/:id', updateAdminPermissions);
adminRouter.patch('/admins/:id/toggle', toggleAdminStatus);
adminRouter.delete('/admins/:id', deleteAdmin);

// Users
adminRouter.get('/users', getUsers);
adminRouter.get('/users/:id', getUserById);
adminRouter.put('/users/:id/status', updateUserStatus);

// Drivers
adminRouter.get('/drivers', getDrivers);
adminRouter.get('/drivers/:id', getDriverById);
adminRouter.put('/drivers/:id/status', updateDriverStatus);

// Documents
adminRouter.get('/documents/pending', getPendingDocuments);
adminRouter.put('/documents/:id/verify', verifyDocument);
adminRouter.put('/documents/:id/reject', rejectDocument);

// Trips
adminRouter.get('/trips', getTrips);
adminRouter.get('/trips/:id', getTripByIdAdmin);

// Analytics
adminRouter.get('/analytics', getAnalytics);

// Support
adminRouter.get('/support', getSupportTickets);
adminRouter.get('/support/:id', getSupportTicketById);
adminRouter.put('/support/:id/status', updateTicketStatus);
adminRouter.post('/support/:id/messages', addAdminMessage);

export { adminRouter };
