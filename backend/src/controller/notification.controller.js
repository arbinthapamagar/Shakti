import { Notification } from '../models/notification.model.js';
import { Driver } from '../models/driver.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getDriverNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unread } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');

    const filter = { driverId: driver._id };
    if (unread === 'true') filter.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
        Notification.countDocuments(filter),
        Notification.countDocuments({ driverId: driver._id, isRead: false }),
    ]);

    return res.status(200).json(
        new apiResponse(200, {
            notifications,
            unreadCount,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
        }, 'Notifications fetched')
    );
});

const markDriverNotificationRead = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');

    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, driverId: driver._id },
        { isRead: true },
        { new: true }
    );
    if (!notification) throw new apiError(404, 'Notification not found');
    return res.status(200).json(new apiResponse(200, notification, 'Marked as read'));
});

const markAllDriverNotificationsRead = asyncHandler(async (req, res) => {
    const driver = await Driver.findOne({ userId: req.user._id });
    if (!driver) throw new apiError(404, 'Driver profile not found');

    await Notification.updateMany({ driverId: driver._id, isRead: false }, { isRead: true });
    return res.status(200).json(new apiResponse(200, {}, 'All notifications marked as read'));
});

export { getDriverNotifications, markDriverNotificationRead, markAllDriverNotificationsRead };
